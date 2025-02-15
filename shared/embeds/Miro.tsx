import * as React from "react";
import Frame from "./components/Frame";

const URL_REGEX = /^https:\/\/(realtimeboard|miro).com\/app\/board\/(.*)$/;
type Props = {
  attrs: {
    href: string;
    matches: string[];
  };
};

export default class RealtimeBoard extends React.Component<Props> {
  static ENABLED = [URL_REGEX];

  render() {
    const { matches } = this.props.attrs;
    const domain = matches[1];
    const boardId = matches[2];
    const titleName = domain === "realtimeboard" ? "RealtimeBoard" : "Miro";
    return (
      <Frame
        {...this.props}
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ src: string; title: string; attrs: { href:... Remove this comment to see the full error message
        src={`https://${domain}.com/app/embed/${boardId}`}
        title={`${titleName} (${boardId})`}
      />
    );
  }
}
