import { McpServer, ResourceTemplate, } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { managerClient, extractLocalLibraryPaths, } from "./managerClient.js";
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
server.resource("libraries", new ResourceTemplate("slice-machine://libraries", {
    list: () => ({
        resources: [
            {
                name: "libraries",
                uri: "slice-machine://libraries",
                description: "Available slice libraries",
            },
        ],
    }),
}), {
    title: "Slice Machine Libraries",
    description: "Returns available slice machine library paths",
    mimeType: "application/json",
}, async (uri) => {
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
});
// Field type definitions for slice fields
const FieldTypeSchema = z.enum([
    "Text",
    "StructuredText",
    "Image",
    "Link",
    "Boolean",
    "Number",
    "Select",
    "Date",
    "Color",
    "GeoPoint",
    "Embed",
]);
const FieldDefinitionSchema = z.object({
    name: z.string(),
    type: FieldTypeSchema,
    label: z.string().optional(),
    placeholder: z.string().optional(),
});
// Add createSlice tool
server.registerTool("createSlice", {
    title: "Create Slice",
    description: "Create a new Prismic slice in a library",
    inputSchema: {
        libraryID: z.string().describe("Library path (e.g., './src/slices')"),
        sliceName: z.string().describe("Human-readable slice name"),
        sliceID: z.string().regex(/^[a-z][a-z0-9_]*$/).describe("Snake_case slice ID"),
        description: z.string().optional().describe("Slice description"),
        fields: z.object({
            primary: z.array(FieldDefinitionSchema).optional().describe("Primary zone fields"),
            items: z.array(FieldDefinitionSchema).optional().describe("Repeater zone fields"),
        }).optional().describe("Field configuration for primary and items zones"),
    },
}, async ({ libraryID, sliceName, sliceID, description, fields }) => {
    try {
        // Build field configurations
        const primaryFields = {};
        const itemsFields = {};
        if (fields?.primary) {
            for (const field of fields.primary) {
                primaryFields[field.name] = {
                    type: field.type,
                    config: {
                        label: field.label || field.name,
                        placeholder: field.placeholder || "",
                        ...(field.type === "Image" ? { constraint: {}, thumbnails: [] } : {}),
                        ...(field.type === "Link" ? { select: null, allowText: true } : {}),
                        ...(field.type === "StructuredText" ? {
                            allowTargetBlank: true,
                            multi: "paragraph,preformatted,hyperlink,embed,rtl,strong,em,list-item,o-list-item",
                        } : {}),
                    },
                };
            }
        }
        if (fields?.items) {
            for (const field of fields.items) {
                itemsFields[field.name] = {
                    type: field.type,
                    config: {
                        label: field.label || field.name,
                        placeholder: field.placeholder || "",
                        ...(field.type === "Image" ? { constraint: {}, thumbnails: [] } : {}),
                        ...(field.type === "Link" ? { select: null, allowText: true } : {}),
                        ...(field.type === "StructuredText" ? {
                            allowTargetBlank: true,
                            multi: "paragraph,preformatted,hyperlink,embed,rtl,strong,em,list-item,o-list-item",
                        } : {}),
                    },
                };
            }
        }
        // Create the slice model
        const model = {
            id: sliceID,
            type: "SharedSlice",
            name: sliceName,
            description: description || sliceName,
            variations: [
                {
                    id: "default",
                    name: "Default",
                    description: "Default",
                    docURL: "...",
                    version: "initial",
                    imageUrl: "",
                    primary: primaryFields,
                    items: itemsFields,
                },
            ],
        };
        // Call the manager client to create the slice
        const { errors } = await managerClient.slices.createSlice({ libraryID, model });
        if (errors?.length) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to create slice: ${errors.join(", ")}`,
                    },
                ],
            };
        }
        return {
            content: [
                {
                    type: "text",
                    text: `Successfully created slice "${sliceID}" in library ${libraryID}`,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error creating slice: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
        };
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    // console.error("Slice Machine MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
