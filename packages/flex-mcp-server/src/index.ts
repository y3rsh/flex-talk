import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as z from "zod/v4";

import { createFlexToolDefinitions } from "@y3rsh/flex-tools-core";

function renderToolCatalog(): string {
  const defs = createFlexToolDefinitions();
  return JSON.stringify(
    defs.map((def) => ({
      name: def.name,
      description: def.description,
      inputSchema: def.inputSchema,
      executionModel:
        "Run locally using @y3rsh/flex-client (do not execute via remote MCP tool call).",
    })),
    null,
    2
  );
}

function localExecutionGuide(): string {
  return [
    "# Flex Local Execution Guide",
    "",
    "Use this MCP server as guidance only. It does not execute robot actions.",
    "All real execution should happen locally in the agent runtime by importing @y3rsh/flex-client.",
    "",
    "## Install",
    "npm install @y3rsh/flex-client",
    "",
    "## Example",
    "```ts",
    'import { FlexClient } from "@y3rsh/flex-client";',
    'const robot = new FlexClient({ host: "192.168.0.20" });',
    "const health = await robot.health.get();",
    "console.log(health);",
    "```",
    "",
    "## Safety",
    "- Always verify host/IP before write operations.",
    "- Use explicit confirmation steps for run start and maintenance commands.",
    "- Prefer discovery + inspect_hardware before protocol execution.",
  ].join("\n");
}

function operationPrompt(operation: string): string {
  return [
    `Generate local TypeScript using @y3rsh/flex-client for operation: ${operation}.`,
    "",
    "Requirements:",
    "- Execute locally on the user's machine.",
    "- Do not call remote MCP tools for robot actions.",
    "- Include imports and minimal runnable code.",
    "- Handle errors with try/catch and print actionable output.",
  ].join("\n");
}

export async function startFlexMcpServer(): Promise<void> {
  const server = new McpServer({
    name: "@y3rsh/flex-mcp-server",
    version: "0.1.0",
  });

  server.registerResource(
    "flex-tool-catalog",
    "flex://tools/catalog",
    {
      title: "Flex Tool Catalog",
      description: "Tool metadata and schemas for local execution.",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "flex://tools/catalog",
          text: renderToolCatalog(),
        },
      ],
    })
  );

  server.registerResource(
    "flex-local-execution-guide",
    "flex://guides/local-execution",
    {
      title: "Flex Local Execution Guide",
      description: "How agents should execute Flex code locally.",
      mimeType: "text/markdown",
    },
    async () => ({
      contents: [
        {
          uri: "flex://guides/local-execution",
          text: localExecutionGuide(),
        },
      ],
    })
  );

  server.registerPrompt(
    "flex-generate-local-code",
    {
      description:
        "Generate local TypeScript code for a Flex operation (guidance only).",
      argsSchema: {
        operation: z.string().describe("Operation to implement (e.g. discover, health, camera)."),
      },
    },
    async ({ operation }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: operationPrompt(operation),
          },
        },
      ],
    })
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
