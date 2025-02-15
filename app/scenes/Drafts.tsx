import { observable } from "mobx";
import { observer } from "mobx-react";
import { EditIcon } from "outline-icons";
import queryString from "query-string";
import * as React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { RouteComponentProps } from "react-router-dom";
import styled from "styled-components";
import RootStore from "~/stores/RootStore";
import CollectionFilter from "~/scenes/Search/components/CollectionFilter";
import DateFilter from "~/scenes/Search/components/DateFilter";
import { Action } from "~/components/Actions";
import Empty from "~/components/Empty";
import Flex from "~/components/Flex";
import Heading from "~/components/Heading";
import InputSearchPage from "~/components/InputSearchPage";
import PaginatedDocumentList from "~/components/PaginatedDocumentList";
import Scene from "~/components/Scene";
import Subheading from "~/components/Subheading";
import withStores from "~/components/withStores";
import NewDocumentMenu from "~/menus/NewDocumentMenu";

type Props = WithTranslation & RouteComponentProps & RootStore;

@observer
class Drafts extends React.Component<Props> {
  @observable
  params: URLSearchParams = new URLSearchParams(this.props.location.search);

  componentDidUpdate(prevProps: Props) {
    if (prevProps.location.search !== this.props.location.search) {
      this.handleQueryChange();
    }
  }

  handleQueryChange = () => {
    this.params = new URLSearchParams(this.props.location.search);
  };

  handleFilterChange = (search: {
    dateFilter?: string | null | undefined;
    collectionId?: string | null | undefined;
  }) => {
    this.props.history.replace({
      pathname: this.props.location.pathname,
      search: queryString.stringify(
        { ...queryString.parse(this.props.location.search), ...search },
        {
          skipEmptyString: true,
        }
      ),
    });
  };

  get collectionId() {
    const id = this.params.get("collectionId");
    return id ? id : undefined;
  }

  get dateFilter() {
    const id = this.params.get("dateFilter");
    return (id ? id : undefined) as
      | "day"
      | "week"
      | "month"
      | "year"
      | undefined;
  }

  render() {
    const { t } = this.props;
    const isFiltered = this.collectionId || this.dateFilter;
    const options = {
      dateFilter: this.dateFilter,
      collectionId: this.collectionId,
    };

    return (
      <Scene
        icon={<EditIcon color="currentColor" />}
        title={t("Drafts")}
        actions={
          <>
            <Action>
              <InputSearchPage source="drafts" label={t("Search documents")} />
            </Action>
            <Action>
              <NewDocumentMenu />
            </Action>
          </>
        }
      >
        <Heading>{t("Drafts")}</Heading>
        <Subheading sticky>
          {t("Documents")}
          <Filters>
            <CollectionFilter
              collectionId={this.collectionId}
              onSelect={(collectionId) =>
                this.handleFilterChange({
                  collectionId,
                })
              }
            />
            <DateFilter
              dateFilter={this.dateFilter}
              onSelect={(dateFilter) =>
                this.handleFilterChange({
                  dateFilter,
                })
              }
            />
          </Filters>
        </Subheading>

        <PaginatedDocumentList
          empty={
            <Empty>
              {isFiltered
                ? t("No documents found for your filters.")
                : t("You’ve not got any drafts at the moment.")}
            </Empty>
          }
          fetch={this.props.documents.fetchDrafts}
          documents={this.props.documents.drafts(options)}
          options={options}
          showCollection
        />
      </Scene>
    );
  }
}

const Filters = styled(Flex)`
  opacity: 0.85;
  transition: opacity 100ms ease-in-out;
  position: absolute;
  right: -8px;
  bottom: 0;
  padding: 0 0 6px;

  &:hover {
    opacity: 1;
  }
`;

export default withTranslation()(withStores(Drafts));
