import { FlexClient } from "@y3rsh/flex-client";
import type {
  CameraTakePictureInput,
  DiscoverToolInput,
  HealthToolInput,
  RunProtocolInput,
  RunStatusInput,
  ToolContext,
  ToolDefinition,
} from "./types.js";

const discoverInputSchema = {
  type: "object",
  properties: {
    candidates: { type: "array", items: { type: "string" } },
    enableSubnetScan: { type: "boolean" },
    subnetPrefixes: { type: "array", items: { type: "string" } },
    requestTimeoutMs: { type: "number" },
  },
  additionalProperties: false,
};

const hostInputSchema = {
  type: "object",
  properties: {
    host: { type: "string" },
  },
  required: ["host"],
  additionalProperties: false,
};

const cameraInputSchema = {
  type: "object",
  properties: {
    host: { type: "string" },
    returnBase64: { type: "boolean" },
  },
  required: ["host"],
  additionalProperties: false,
};

const runProtocolInputSchema = {
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
};

const runStatusInputSchema = {
  type: "object",
  properties: {
    host: { type: "string" },
    runId: { type: "string" },
  },
  required: ["host", "runId"],
  additionalProperties: false,
};

export function createDefaultToolContext(defaultHost?: string): ToolContext {
  return {
    getClient: (host?: string) => {
      const resolvedHost = host ?? defaultHost;
      if (!resolvedHost) {
        throw new Error("Host is required. Provide host in input or default host.");
      }
      return new FlexClient({ host: resolvedHost });
    },
  };
}

export function createFlexToolDefinitions(): ToolDefinition[] {
  const discoverTool: ToolDefinition<DiscoverToolInput, unknown> = {
    name: "flex.discover",
    description: "Discover Opentrons Flex robots on the network.",
    inputSchema: discoverInputSchema,
    execute: async (_ctx, input) => {
      const discovery = FlexClient.createDiscoveryClient({
        ...(input.candidates ? { candidates: input.candidates } : {}),
        ...(input.enableSubnetScan !== undefined
          ? { enableSubnetScan: input.enableSubnetScan }
          : {}),
        ...(input.subnetPrefixes ? { subnetPrefixes: input.subnetPrefixes } : {}),
        requestTimeoutMs: input.requestTimeoutMs ?? 1200,
      });
      try {
        return await discovery.refresh();
      } finally {
        discovery.stop();
      }
    },
  };

  const healthTool: ToolDefinition<HealthToolInput, unknown> = {
    name: "flex.health",
    description: "Get health information for a Flex robot.",
    inputSchema: hostInputSchema,
    execute: async (ctx, input) => {
      const client = ctx.getClient(input.host);
      return client.health.get();
    },
  };

  const inspectHardwareTool: ToolDefinition<HealthToolInput, unknown> = {
    name: "flex.inspect_hardware",
    description: "Inspect attached pipettes, gripper, and modules on a Flex robot.",
    inputSchema: hostInputSchema,
    execute: async (ctx, input) => {
      const client = ctx.getClient(input.host);
      const [pipettes, gripper, modules] = await Promise.all([
        client.instruments.pipettes(),
        client.instruments.gripper(),
        client.modules.list(),
      ]);
      return { pipettes, gripper, modules };
    },
  };

  const cameraPictureTool: ToolDefinition<CameraTakePictureInput, unknown> = {
    name: "flex.camera.take_picture",
    description: "Capture a camera image from the robot deck camera.",
    inputSchema: cameraInputSchema,
    execute: async (ctx, input) => {
      const client = ctx.getClient(input.host);
      const image = await client.camera.takePicture();
      if (input.returnBase64) {
        return {
          contentType: image.contentType,
          base64: Buffer.from(image.data).toString("base64"),
        };
      }
      return {
        contentType: image.contentType,
        byteLength: image.data.length,
      };
    },
  };

  const runProtocolTool: ToolDefinition<RunProtocolInput, unknown> = {
    name: "flex.run_protocol",
    description: "Upload protocol source, create a run, start it, and optionally wait.",
    inputSchema: runProtocolInputSchema,
    execute: async (ctx, input) => {
      const client = ctx.getClient(input.host);
      const protocol = await client.protocols.upload(
        input.protocolSource,
        input.filename ?? "protocol.py"
      );
      const run = await client.runs.create({ protocolId: protocol.id });
      const action = await client.runs.start(run.id);
      if (input.waitForCompletion) {
        const completed = await client.runs.waitForCompletion(run.id, {
          throwOnFailure: input.throwOnFailure ?? true,
        });
        return { protocol, run: completed, action };
      }
      return { protocol, run, action };
    },
  };

  const runStatusTool: ToolDefinition<RunStatusInput, unknown> = {
    name: "flex.run_status",
    description: "Get current run state and errors for a run.",
    inputSchema: runStatusInputSchema,
    execute: async (ctx, input) => {
      const client = ctx.getClient(input.host);
      const [run, errors] = await Promise.all([
        client.runs.get(input.runId),
        client.runs.getErrors(input.runId),
      ]);
      return { run, errors };
    },
  };

  return [
    discoverTool,
    healthTool,
    inspectHardwareTool,
    cameraPictureTool,
    runProtocolTool,
    runStatusTool,
  ];
}
