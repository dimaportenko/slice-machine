import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { managerClient } from "../services/managerClient.js";
import { extractLocalLibraryPaths } from "../utils/validation.js";

export const librariesResource = {
  name: "libraries",
  template: new ResourceTemplate("slice-machine://libraries", {
    list: () => ({
      resources: [
        {
          name: "libraries",
          uri: "slice-machine://libraries",
          description: "Available slice libraries",
        },
      ],
    }),
  }),
  metadata: {
    title: "Slice Machine Libraries",
    description: "Returns available slice machine library paths",
    mimeType: "application/json",
  },
  handler: async (uri: URL) => {
    try {
      const state = await managerClient.getState();
      const libraryPaths = extractLocalLibraryPaths(state);

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(libraryPaths, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(
              {
                error: `Failed to fetch libraries: ${errorMessage}`,
                libraries: [],
              },
              null,
              2,
            ),
          },
        ],
      };
    }
  },
};
