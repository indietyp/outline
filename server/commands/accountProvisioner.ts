import invariant from "invariant";
import Sequelize from "sequelize";
import { Collection, Team, User } from "@server/models";
import {
  AuthenticationError,
  EmailAuthenticationRequiredError,
  AuthenticationProviderDisabledError,
} from "../errors";
import mailer from "../mailer";
import teamCreator, { TeamCreatorResult } from "./teamCreator";
import userCreator from "./userCreator";

type Props = {
  ip: string;
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
    username?: string;
  };
  team: {
    name: string;
    domain?: string;
    subdomain: string;
    avatarUrl?: string;
  };
  authenticationProvider: {
    name: string;
    providerId: string;
  };
  authentication: {
    providerId: string;
    scopes: string[];
    accessToken?: string;
    refreshToken?: string;
  };
};

export type AccountProvisionerResult = {
  // @ts-expect-error ts-migrate(2749) FIXME: 'User' refers to a value, but is being used as a t... Remove this comment to see the full error message
  user: User;
  // @ts-expect-error ts-migrate(2749) FIXME: 'Team' refers to a value, but is being used as a t... Remove this comment to see the full error message
  team: Team;
  isNewTeam: boolean;
  isNewUser: boolean;
};

export async function findExistingTeam(
  authenticationProvider: Props["authenticationProvider"]
): Promise<TeamCreatorResult | null> {
  // Should outline deployed in a multi-tenant environment, skip searching
  // for an existing team.
  console.log(process.env.DEVELOPMENT);
  if (process.env.DEPLOYMENT === "hosted") return null;

  // get the first team that exists, ordered by createdAt
  const team = await Team.findOne({ limit: 1, order: ["createdAt"] });
  if (team === null) {
    return null;
  }

  // query if a corresponding authenticationProvider already exists
  const authenticationProviders = await team.getAuthenticationProviders({
    where: {
      name: authenticationProvider.name,
    },
  });

  // ... if this is not the case, create a new authentication provider
  // that we use instead, overwriting the providerId with the domain of the team
  const authP =
    authenticationProviders.length === 0
      ? await team.createAuthenticationProvider({
          ...authenticationProvider,
          providerId: team.domain,
        })
      : authenticationProviders[0];

  return {
    authenticationProvider: authP,
    team: team,
    isNewTeam: false,
  };
}

export default async function accountProvisioner({
  ip,
  user: userParams,
  team: teamParams,
  authenticationProvider: authenticationProviderParams,
  authentication: authenticationParams,
}: Props): Promise<AccountProvisionerResult> {
  let result;

  try {
    result =
      (await findExistingTeam(authenticationProviderParams)) ||
      (await teamCreator({
        name: teamParams.name,
        domain: teamParams.domain,
        subdomain: teamParams.subdomain,
        avatarUrl: teamParams.avatarUrl,
        authenticationProvider: authenticationProviderParams,
      }));
  } catch (err) {
    throw AuthenticationError(err.message);
  }

  invariant(result, "Team creator result must exist");
  const { authenticationProvider, team, isNewTeam } = result;

  if (!authenticationProvider.enabled) {
    throw AuthenticationProviderDisabledError();
  }

  try {
    const result = await userCreator({
      name: userParams.name,
      email: userParams.email,
      username: userParams.username,
      isAdmin: isNewTeam || undefined,
      avatarUrl: userParams.avatarUrl,
      teamId: team.id,
      ip,
      authentication: {
        ...authenticationParams,
        authenticationProviderId: authenticationProvider.id,
      },
    });
    const { isNewUser, user } = result;

    if (isNewUser) {
      await mailer.sendTemplate("welcome", {
        to: user.email,
        teamUrl: team.url,
      });
    }

    if (isNewUser || isNewTeam) {
      let provision = isNewTeam;

      // accounts for the case where a team is provisioned, but the user creation
      // failed. In this case we have a valid previously created team but no
      // onboarding collection.
      if (!isNewTeam) {
        const count = await Collection.count({
          where: {
            teamId: team.id,
          },
        });
        provision = count === 0;
      }

      if (provision) {
        await team.provisionFirstCollection(user.id);
      }
    }

    return {
      user,
      team,
      isNewUser,
      isNewTeam,
    };
  } catch (err) {
    if (err instanceof Sequelize.UniqueConstraintError) {
      const exists = await User.findOne({
        where: {
          email: userParams.email,
          teamId: team.id,
        },
      });

      if (exists) {
        throw EmailAuthenticationRequiredError(
          "Email authentication required",
          team.url
        );
      } else {
        throw AuthenticationError(err.message, team.url);
      }
    }

    throw err;
  }
}
