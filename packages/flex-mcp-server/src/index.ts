import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import {
  createDefaultToolContext,
  createFlexToolDefinitions,
  type ToolDefinition,
} from "@y3rsh/flex-tools-core";

function toZodSchema(schema: Record<string, unknown>): z.ZodRawShape {
  const properties = (schema.properties ?? {}) as Record<string, Record<string, unknown>>;
  const required = new Set((schema.required ?? []) as string[]);
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const [key, prop] of Object.entries(properties)) {
    const type = prop.type;
    let field: z.ZodTypeAny;
    if (type === "string") field = z.string();
    else if (type === "number") field = z.number();
    else if (type === "boolean") field = z.boolean();
    else if (type === "array") field = z.array(z.unknown());
    else if (type === "object") field = z.record(z.string(), z.unknown());
    else field = z.unknown();
    shape[key] = required.has(key) ? field : field.optional();
  }

  return shape as z.ZodRawShape;
}

function resultToMcpContent(result: unknown): { content: Array<{ type: "text"; text: string }> } {
  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
  };
}

function registerTool(server: McpServer, def: ToolDefinition, defaultHost?: string): void {
  server.tool(
    def.name,
    def.description,
    toZodSchema(def.inputSchema),
    async (input: Record<string, unknown>) => {
      const ctx = createDefaultToolContext(defaultHost);
      const result = await def.execute(ctx, input);
      return resultToMcpContent(result);
    }
  );
}

export async function startFlexMcpServer(options?: { defaultHost?: string }): Promise<void> {
  const server = new McpServer({
    name: "@y3rsh/flex-mcp-server",
    version: "0.1.0",
  });

  const tools = createFlexToolDefinitions();
  for (const tool of tools) {
    registerTool(server, tool, options?.defaultHost);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
