import * as React from "react";
import Frame from "./components/Frame";
import Image from "./components/Image";

const URL_REGEX = new RegExp(
  "^https?://datastudio.google.com/(embed|u/0)/reporting/(.*)/page/(.*)(/edit)?$"
);
type Props = {
  attrs: {
    href: string;
    matches: string[];
  };
};

export default class GoogleDataStudio extends React.Component<Props> {
  static ENABLED = [URL_REGEX];

  render() {
    return (
      <Frame
        {...this.props}
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ src: string; icon: Element; canonicalUrl: ... Remove this comment to see the full error message
        src={this.props.attrs.href.replace("u/0", "embed").replace("/edit", "")}
        icon={
          <Image
            src="/images/google-datastudio.png"
            alt="Google Data Studio Icon"
            width={16}
            height={16}
          />
        }
        canonicalUrl={this.props.attrs.href}
        title="Google Data Studio"
        border
      />
    );
  }
}
