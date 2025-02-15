import { transparentize } from "polished";
import * as React from "react";
import styled, { useTheme } from "styled-components";
import breakpoint from "styled-components-breakpoint";
import EventBoundary from "~/components/EventBoundary";
import NudeButton from "~/components/NudeButton";
import { NavigationNode } from "~/types";
import NavLink, { Props as NavLinkProps } from "./NavLink";

export type DragObject = NavigationNode & {
  depth: number;
  active: boolean;
  collectionId: string;
};

type Props = Omit<NavLinkProps, "to"> & {
  to?: string | Record<string, any>;
  href?: string | Record<string, any>;
  innerRef?: (arg0: HTMLElement | null | undefined) => void;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLAnchorElement>;
  icon?: React.ReactNode;
  label?: React.ReactNode;
  menu?: React.ReactNode;
  showActions?: boolean;
  active?: boolean;
  isActiveDrop?: boolean;
  depth?: number;
  scrollIntoViewIfNeeded?: boolean;
};

const activeDropStyle = {
  fontWeight: 600,
};

function SidebarLink(
  {
    icon,
    onClick,
    onMouseEnter,
    to,
    label,
    active,
    isActiveDrop,
    menu,
    showActions,
    exact,
    href,
    depth,
    className,
    ...rest
  }: Props,
  ref: React.RefObject<HTMLAnchorElement>
) {
  const theme = useTheme();
  const style = React.useMemo(
    () => ({
      paddingLeft: `${(depth || 0) * 16 + 12}px`,
    }),
    [depth]
  );

  const activeStyle = React.useMemo(
    () => ({
      fontWeight: 600,
      color: theme.text,
      background: theme.sidebarItemBackground,
      ...style,
    }),
    [theme, style]
  );

  return (
    <>
      <Link
        $isActiveDrop={isActiveDrop}
        activeStyle={isActiveDrop ? activeDropStyle : activeStyle}
        style={active ? activeStyle : style}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        // @ts-expect-error exact does not exist on div
        exact={exact !== false}
        to={to}
        as={to ? undefined : href ? "a" : "div"}
        href={href}
        className={className}
        ref={ref}
        {...rest}
      >
        {icon && <IconWrapper>{icon}</IconWrapper>}
        <Label>{label}</Label>
      </Link>
      {menu && <Actions showActions={showActions}>{menu}</Actions>}
    </>
  );
}

// accounts for whitespace around icon
const IconWrapper = styled.span`
  margin-left: -4px;
  margin-right: 4px;
  height: 24px;
  overflow: hidden;
  flex-shrink: 0;
`;

const Actions = styled(EventBoundary)<{ showActions?: boolean }>`
  display: ${(props) => (props.showActions ? "inline-flex" : "none")};
  position: absolute;
  top: 4px;
  right: 4px;
  color: ${(props) => props.theme.textTertiary};
  transition: opacity 50ms;

  svg {
    color: ${(props) => props.theme.textSecondary};
    fill: currentColor;
    opacity: 0.5;
  }

  &:hover {
    display: inline-flex;

    svg {
      opacity: 0.75;
    }
  }
`;

const Link = styled(NavLink)<{ $isActiveDrop?: boolean }>`
  display: flex;
  position: relative;
  text-overflow: ellipsis;
  padding: 6px 16px;
  border-radius: 4px;
  transition: background 50ms, color 50ms;
  user-select: none;
  background: ${(props) =>
    props.$isActiveDrop ? props.theme.slateDark : "inherit"};
  color: ${(props) =>
    props.$isActiveDrop ? props.theme.white : props.theme.sidebarText};
  font-size: 16px;
  cursor: pointer;
  overflow: hidden;

  svg {
    ${(props) => (props.$isActiveDrop ? `fill: ${props.theme.white};` : "")}
    transition: fill 50ms;
  }

  &:focus {
    color: ${(props) => props.theme.text};
    background: ${(props) =>
      transparentize("0.25", props.theme.sidebarItemBackground)};
  }

  & + ${Actions} {
    ${NudeButton} {
      background: ${(props) => props.theme.sidebarBackground};
    }
  }

  &:focus + ${Actions} {
    ${NudeButton} {
      background: ${(props) =>
        transparentize("0.25", props.theme.sidebarItemBackground)};
    }
  }

  &[aria-current="page"] + ${Actions} {
    ${NudeButton} {
      background: ${(props) => props.theme.sidebarItemBackground};
    }
  }

  ${breakpoint("tablet")`
    padding: 4px 8px 4px 16px;
    font-size: 15px;
  `}

  @media (hover: hover) {
    &:hover + ${Actions}, &:active + ${Actions} {
      display: inline-flex;

      svg {
        opacity: 0.75;
      }
    }

    &:hover {
      color: ${(props) =>
        props.$isActiveDrop ? props.theme.white : props.theme.text};
    }
  }
`;

const Label = styled.div`
  position: relative;
  width: 100%;
  max-height: 4.8em;
  line-height: 1.6;
  * {
    unicode-bidi: plaintext;
  }
`;

export default React.forwardRef<HTMLAnchorElement, Props>(SidebarLink);
