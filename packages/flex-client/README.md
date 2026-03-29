# @y3rsh/flex-client

TypeScript client for the Opentrons Flex HTTP API.

Flow-first, typed access to a Flex robot for app code, scripts, and agentic workflows.

## Install

```bash
npm install @y3rsh/flex-client
```

## Quick Start

```ts
import { FlexClient } from "@y3rsh/flex-client";

const robot = new FlexClient({ host: "192.168.1.42" });
const health = await robot.health.get();

console.log(health.robotSerial);
```

## Configuration

```ts
import { FlexClient } from "@y3rsh/flex-client";
import fetch from "node-fetch";

const robot = new FlexClient({
  host: "192.168.1.42",
  port: 31950,
  protocol: "http",
  fetch, // optional for non-native-fetch runtimes
});
```

## API Surface

- `robot.health`
- `robot.camera`
- `robot.instruments`
- `robot.modules`
- `robot.protocols`
- `robot.runs`
- `robot.labwareOffsets`
- `robot.maintenance`
- `robot.deck`
- `robot.errorRecovery`
- `robot.system`
- `FlexClient.createDiscoveryClient(...)` for network robot discovery

## Common Workflows

### Upload and run a protocol

```ts
const protocol = await robot.protocols.upload(pythonSource, "my_assay.py");
const offsets = await robot.labwareOffsets.list();

const run = await robot.runs.create({
  protocolId: protocol.id,
  labwareOffsets: offsets,
});

await robot.runs.start(run.id);
const finalRun = await robot.runs.waitForCompletion(run.id);
console.log(finalRun.status);
```

### Inspect attached hardware

```ts
const [pipettes, gripper, modules] = await Promise.all([
  robot.instruments.pipettes(),
  robot.instruments.gripper(),
  robot.modules.list(),
]);

console.log("pipettes:", pipettes.map((p) => `${p.instrumentName} on ${p.mount}`));
console.log("gripper attached:", Boolean(gripper));
console.log("modules:", modules.map((m) => `${m.moduleModel} in ${m.slotName}`));
```

### Capture a deck image

```ts
import { writeFile } from "node:fs/promises";

const image = await robot.camera.takePicture();
await writeFile("deck.jpg", image.data);
console.log("saved deck image with content type:", image.contentType);
```

### Discover robots on the network

```ts
import { FlexClient } from "@y3rsh/flex-client";

const discovery = FlexClient.createDiscoveryClient({
  candidates: ["localhost", "192.168.1.42"],
  pollIntervalMs: 2000,
  // optional: enable /24 private subnet probing
  enableSubnetScan: false,
});

discovery.on("update", (robots) => {
  console.log("discovered:", robots.map((r) => `${r.name}@${r.host}`));
});

discovery.start();
// later...
discovery.stop();
```

`FlexDiscoveryClient` is a streamlined reimplementation of the discovery logic
used in the Opentrons monorepo app stack, without pulling in legacy dependency
chains. It supports:

- candidate-based discovery (`addCandidate`, `removeCandidate`)
- interval health polling and stale robot eviction
- optional private subnet scanning
- typed `update` / `error` events

### Maintenance run and direct command

```ts
const mRun = await robot.maintenance.create();

await robot.maintenance.enqueueCommand(mRun.id, {
  data: {
    commandType: "moveToWell",
    params: {
      pipetteId: "pipette-id",
      labwareId: "labware-id",
      wellName: "A1",
      wellLocation: { origin: "top", offset: { x: 0, y: 0, z: 5 } },
    },
  },
});

await robot.maintenance.delete(mRun.id);
```

### Error handling

```ts
import { FlexApiError, FlexRunFailedError, FlexTimeoutError } from "@y3rsh/flex-client";

try {
  await robot.runs.waitForCompletion("run-id", { timeoutMs: 60_000 });
} catch (error) {
  if (error instanceof FlexRunFailedError) {
    console.error("run failed", error.errors);
  } else if (error instanceof FlexTimeoutError) {
    console.error("run timeout", error.lastStatus);
  } else if (error instanceof FlexApiError) {
    console.error("api error", error.status, error.errorCode, error.message);
  } else {
    throw error;
  }
}
```

### Deck configuration

```ts
const config = await robot.deck.getConfiguration();

await robot.deck.setConfiguration([
  ...config.data.filter((c) => c.cutoutId !== "cutoutD3"),
  {
    cutoutId: "cutoutD3",
    cutoutFixtureId: "wasteChuteRightAdapterNoCover",
  },
]);
```

## Testing

- Unit tests: `npm test`
- Type checks: `npm run typecheck`
- Build outputs: `npm run build`

## Publishing

Publishing is handled by CI via `.github/workflows/publish-flex-client.yml`.

- Push to `main` publishes automatically with DateVer format:
  - `YYYY.M.D-r<GITHUB_RUN_NUMBER>.<GITHUB_RUN_ATTEMPT>`
- Manual publish is available via workflow dispatch:
  - optional `version` input for explicit DateVer/semver string
- Target registry: npmjs (`@y3rsh/flex-client`)
- Required repository secret for publish workflows: `NPM_TOKEN`

## Agent Ecosystem Packages

- `@y3rsh/flex-tools-core`
  - framework-agnostic tool definitions backed by this client

This package keeps the same typed Flex capabilities reusable from Claude,
Cursor, and other agentic tooling stacks.

## Status

Implementation is tracked in `docs/IMPLEMENTATION_PLAN.md`. Planned v1 phases 1 through 11 are now implemented.
