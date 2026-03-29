# @y3rsh/flex-tools-core

Framework-agnostic tool definitions powered by `@y3rsh/flex-client`.

## What this package provides

- A small, reusable set of Flex-oriented tool definitions
- JSON schemas for tool input validation in adapter runtimes
- Portable `execute()` handlers that call the typed Flex client

## Included tools

- `flex.discover`
- `flex.health`
- `flex.inspect_hardware`
- `flex.camera.take_picture`
- `flex.run_protocol`
- `flex.run_status`

## Basic usage

```ts
import { createDefaultToolContext, createFlexToolDefinitions } from "@y3rsh/flex-tools-core";

const tools = createFlexToolDefinitions();
const context = createDefaultToolContext("192.168.0.20");

const healthTool = tools.find((t) => t.name === "flex.health");
const result = await healthTool?.execute(context, { host: "192.168.0.20" });
console.log(result);
```
