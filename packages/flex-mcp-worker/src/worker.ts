import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import * as z from "zod/v4";

type ToolCatalogItem = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  executionModel: string;
};

const TOOL_CATALOG: ToolCatalogItem[] = [
  {
    name: "flex.discover",
    description: "Discover Opentrons Flex robots on the network.",
    inputSchema: {
      type: "object",
      properties: {
        candidates: { type: "array", items: { type: "string" } },
        enableSubnetScan: { type: "boolean" },
        subnetPrefixes: { type: "array", items: { type: "string" } },
        requestTimeoutMs: { type: "number" },
      },
      additionalProperties: false,
    },
    executionModel:
      "Generate local code and execute with @y3rsh/flex-client on the user's machine.",
  },
  {
    name: "flex.health",
    description: "Get health information for a Flex robot.",
    inputSchema: {
      type: "object",
      properties: { host: { type: "string" } },
      required: ["host"],
      additionalProperties: false,
    },
    executionModel:
      "Generate local code and execute with @y3rsh/flex-client on the user's machine.",
  },
  {
    name: "flex.inspect_hardware",
    description: "Inspect attached pipettes, gripper, and modules on a Flex robot.",
    inputSchema: {
      type: "object",
      properties: { host: { type: "string" } },
      required: ["host"],
      additionalProperties: false,
    },
    executionModel:
      "Generate local code and execute with @y3rsh/flex-client on the user's machine.",
  },
  {
    name: "flex.camera.take_picture",
    description: "Capture a camera image from the robot deck camera.",
    inputSchema: {
      type: "object",
      properties: { host: { type: "string" }, returnBase64: { type: "boolean" } },
      required: ["host"],
      additionalProperties: false,
    },
    executionModel:
      "Generate local code and execute with @y3rsh/flex-client on the user's machine.",
  },
  {
    name: "flex.run_protocol",
    description: "Upload protocol source, create a run, start it, and optionally wait.",
    inputSchema: {
      type: "object",
      properties: {
        host: { type: "string" },
        protocolSource: { type: "string" },
        filename: { type: "string" },
        waitForCompletion: { type: "boolean" },
        throwOnFailure: { type: "boolean" },
      },
      required: ["host", "protocolSource"],
      additionalProperties: false,
    },
    executionModel:
      "Generate local code and execute with @y3rsh/flex-client on the user's machine.",
  },
  {
    name: "flex.run_status",
    description: "Get current run state and errors for a run.",
    inputSchema: {
      type: "object",
      properties: { host: { type: "string" }, runId: { type: "string" } },
      required: ["host", "runId"],
      additionalProperties: false,
    },
    executionModel:
      "Generate local code and execute with @y3rsh/flex-client on the user's machine.",
  },
];

function localExecutionGuide(): string {
  return [
    "# Flex Local Execution Guide",
    "",
    "This MCP endpoint is public guidance/spec only.",
    "It does not execute robot actions.",
    "",
    "## Required execution model",
    "- Agent generates TypeScript locally.",
    "- Agent runs code locally on the user's machine.",
    "- Code imports @y3rsh/flex-client for all robot operations.",
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
  ].join("\n");
}

function operationPrompt(operation: string): string {
  return [
    `Generate local TypeScript using @y3rsh/flex-client for operation: ${operation}.`,
    "",
    "Rules:",
    "- Execute locally on user machine.",
    "- Do not use remote MCP tool execution for robot actions.",
    "- Include imports and minimal runnable script.",
    "- Include try/catch and actionable logging.",
  ].join("\n");
}

function createGuidanceServer(): McpServer {
  const server = new McpServer({
    name: "@y3rsh/flex-mcp-worker",
    version: "0.1.0",
  });

  server.registerResource(
    "flex-tool-catalog",
    "flex://tools/catalog",
    {
      title: "Flex Tool Catalog",
      description: "Tool metadata/schemas for local execution.",
      mimeType: "application/json",
    },
    async () => ({
      contents: [{ uri: "flex://tools/catalog", text: JSON.stringify(TOOL_CATALOG, null, 2) }],
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
      contents: [{ uri: "flex://guides/local-execution", text: localExecutionGuide() }],
    })
  );

  server.registerPrompt(
    "flex-generate-local-code",
    {
      description: "Generate local TypeScript code for a Flex operation.",
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

  return server;
}

function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, MCP-Protocol-Version",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  };
}

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders())) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (url.pathname === "/" || url.pathname === "/health") {
      return new Response(
        JSON.stringify({
          ok: true,
          service: "@y3rsh/flex-mcp-worker",
          mode: "guidance-only",
          endpoint: "/mcp",
        }),
        { status: 200, headers: { "content-type": "application/json", ...corsHeaders() } }
      );
    }

    if (url.pathname !== "/mcp") {
      return new Response("Not Found", { status: 404, headers: corsHeaders() });
    }

    try {
      const server = createGuidanceServer();
      const transport = new WebStandardStreamableHTTPServerTransport();
      await server.connect(transport);
      const response = await transport.handleRequest(request);
      return withCors(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return new Response(
        JSON.stringify({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error", data: message },
          id: null,
        }),
        {
          status: 500,
          headers: { "content-type": "application/json", ...corsHeaders() },
        }
      );
    }
  },
};
