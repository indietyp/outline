import { Location } from "history";
import { TFunction } from "react-i18next";
import RootStore from "~/stores/RootStore";
import Document from "~/models/Document";

export type MenuItemButton = {
  type: "button";
  title: React.ReactNode;
  onClick: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  visible?: boolean;
  selected?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
};

export type MenuItemWithChildren = {
  type: "submenu";
  title: React.ReactNode;
  visible?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  hover?: boolean;

  items: MenuItem[];
  icon?: React.ReactNode;
};

export type MenuSeparator = {
  type: "separator";
  visible?: boolean;
};

export type MenuHeading = {
  type: "heading";
  visible?: boolean;
  title: React.ReactNode;
};

export type MenuInternalLink = {
  type: "route";
  title: React.ReactNode;
  to: string;
  visible?: boolean;
  selected?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
};

export type MenuExternalLink = {
  type: "link";
  title: React.ReactNode;
  href: string;
  visible?: boolean;
  selected?: boolean;
  disabled?: boolean;
  level?: number;
  icon?: React.ReactNode;
};

export type MenuItem =
  | MenuInternalLink
  | MenuItemButton
  | MenuExternalLink
  | MenuItemWithChildren
  | MenuSeparator
  | MenuHeading;

export type ActionContext = {
  isContextMenu: boolean;
  isCommandBar: boolean;
  activeCollectionId: string | null | undefined;
  activeDocumentId: string | null | undefined;
  location: Location;
  stores: RootStore;
  event?: Event;
  t: TFunction;
};

export type Action = {
  type?: undefined;
  id: string;
  name: ((context: ActionContext) => string) | string;
  section: ((context: ActionContext) => string) | string;
  shortcut?: string[];
  keywords?: string;
  iconInContextMenu?: boolean;
  icon?: React.ReactElement | React.FC;
  placeholder?: ((context: ActionContext) => string) | string;
  selected?: (context: ActionContext) => boolean;
  visible?: (context: ActionContext) => boolean;
  perform?: (context: ActionContext) => void;
  children?: ((context: ActionContext) => Action[]) | Action[];
};

export type CommandBarAction = {
  id: string;
  name: string;
  section?: string;
  shortcut: string[];
  keywords: string;
  placeholder?: string;
  icon?: React.ReactElement;
  perform?: () => void;
  children?: string[];
  parent?: string;
};

export type LocationWithState = Location & {
  state: Record<string, string>;
};

export type Toast = {
  id: string;
  createdAt: string;
  message: string;
  type: "warning" | "error" | "info" | "success";
  timeout?: number;
  reoccurring?: number;
  action?: {
    text: string;
    onClick: React.MouseEventHandler<HTMLSpanElement>;
  };
};

export type FetchOptions = {
  prefetch?: boolean;
  revisionId?: string;
  shareId?: string;
  force?: boolean;
};

export type NavigationNode = {
  id: string;
  title: string;
  url: string;
  children: NavigationNode[];
};

// Pagination response in an API call
export type Pagination = {
  limit: number;
  nextPath: string;
  offset: number;
};

// Pagination request params
export type PaginationParams = {
  limit?: number;
  offset?: number;
  sort?: string;
  direction?: "ASC" | "DESC";
};

export type SearchResult = {
  ranking: number;
  context: string;
  document: Document;
};

export type ToastOptions = {
  type: "warning" | "error" | "info" | "success";
  timeout?: number;
  action?: {
    text: string;
    onClick: React.MouseEventHandler<HTMLSpanElement>;
  };
};
