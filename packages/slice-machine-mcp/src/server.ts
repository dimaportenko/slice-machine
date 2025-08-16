import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SERVER_CONFIG } from "./config/constants.js";
import {
  createSliceTool,
  addFieldToSliceTool,
  deleteFieldFromSliceTool,
} from "./tools/index.js";
import { librariesResource } from "./resources/index.js";

export async function createServer(): Promise<McpServer> {
  // Create server instance
  const server = new McpServer({
    name: SERVER_CONFIG.name,
    version: SERVER_CONFIG.version,
    capabilities: {
      resources: {},
      tools: {},
    },
  });

  // Register resources
  server.resource(
    librariesResource.name,
    librariesResource.template,
    librariesResource.metadata,
    librariesResource.handler,
  );

  // Register tools
  server.registerTool(
    createSliceTool.name,
    {
      title: createSliceTool.title,
      description: createSliceTool.description,
      inputSchema: createSliceTool.inputSchema.shape,
    },
    createSliceTool.handler,
  );

  server.registerTool(
    addFieldToSliceTool.name,
    {
      title: addFieldToSliceTool.title,
      description: addFieldToSliceTool.description,
      inputSchema: addFieldToSliceTool.inputSchema.shape,
    },
    addFieldToSliceTool.handler,
  );

  server.registerTool(
    deleteFieldFromSliceTool.name,
    {
      title: deleteFieldFromSliceTool.title,
      description: deleteFieldFromSliceTool.description,
      inputSchema: deleteFieldFromSliceTool.inputSchema.shape,
    },
    deleteFieldFromSliceTool.handler,
  );

  return server;
}

export async function startServer(): Promise<void> {
  try {
    const server = await createServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);

    // Log to stderr to avoid interfering with stdio communication
    console.error(
      `${SERVER_CONFIG.name} v${SERVER_CONFIG.version} - MCP server running`,
    );
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}
