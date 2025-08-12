import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  managerClient,
  extractLocalLibraryPaths,
} from "./managerClient.js";

// Create server instance
const server = new McpServer({
  name: "slice-machine-mcp",
  version: "0.1.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Add slice libraries resource
server.resource(
  "libraries",
  new ResourceTemplate("slice-machine://libraries", {
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
  {
    title: "Slice Machine Libraries",
    description: "Returns available slice machine library paths",
    mimeType: "application/json",
  },
  async (uri) => {
    const state = await managerClient.getState();
    const libraryPaths = extractLocalLibraryPaths(state);

    return {
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(libraryPaths),
        },
      ],
    };
  },
);

// Add an addition tool
// server.registerTool(
//   "add",
//   {
//     title: "Addition Tool",
//     description: "Add two numbers",
//     inputSchema: { a: z.number(), b: z.number() },
//   },
//   async ({ a, b }) => ({
//     content: [{ type: "text", text: String(a + b) }],
//   }),
// );

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // console.error("Slice Machine MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
