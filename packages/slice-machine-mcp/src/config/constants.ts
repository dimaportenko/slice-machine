export const SERVER_CONFIG = {
  name: "slice-machine-mcp",
  version: "0.1.0",
  description: "Model Context Protocol server for Slice Machine",
} as const;

export const MANAGER_CONFIG = {
  serverURL: "http://localhost:9999/_manager",
} as const;

export const DEFAULT_FIELD_CONFIG = {
  structuredText: {
    allowTargetBlank: true,
    multi: "paragraph,preformatted,hyperlink,embed,rtl,strong,em,list-item,o-list-item",
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