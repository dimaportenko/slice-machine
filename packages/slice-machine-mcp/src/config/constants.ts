import { PACKAGE_INFO } from "./version.js";

export const SERVER_CONFIG = {
  name: PACKAGE_INFO.name,
  version: PACKAGE_INFO.version,
  description: PACKAGE_INFO.description,
} as const;

export const MANAGER_CONFIG = {
  serverURL: "http://localhost:9999/_manager",
} as const;

export const DEFAULT_FIELD_CONFIG = {
  structuredText: {
    allowTargetBlank: true,
    multi:
      "paragraph,preformatted,hyperlink,embed,rtl,strong,em,list-item,o-list-item",
  },
  image: {
    constraint: {},
    thumbnails: [],
  },
  link: {
    select: null,
    allowText: true,
  },
} as const;
