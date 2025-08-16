import type { z } from "zod";

export interface MCPToolDefinition<
  TSchema extends z.ZodSchema,
  TInput = z.infer<TSchema>,
> {
  name: string;
  title: string;
  description: string;
  inputSchema: TSchema;
  handler: (input: TInput) => Promise<{
    content: Array<{
      type: string;
      text: string;
    }>;
  }>;
}

export interface MCPResourceDefinition {
  name: string;
  template: any;
  metadata: {
    title: string;
    description: string;
    mimeType: string;
  };
  handler: (uri: URL) => Promise<{
    contents: Array<{
      uri: string;
      mimeType: string;
      text: string;
    }>;
  }>;
}

export interface MCPServerConfig {
  name: string;
  version: string;
  description?: string;
}
