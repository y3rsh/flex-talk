---
name: flex-agentic-tools
description: Build and run agent-generated TypeScript workflows for Opentrons Flex robots using this repository as the reference implementation. Use when users ask to discover robots, check status/health, inspect hardware, capture camera images, or compose protocol/run automation code.
license: MIT
metadata:
  repository: https://github.com/y3rsh/flex-talk
---

# Flex Agentic Tools

Use this skill to generate practical, local-execution TypeScript for Opentrons Flex robots.

## When to Use

- User wants agent-generated code for Flex discovery, health, camera, or run flows.
- User wants examples grounded in this repository's implementation details.
- User wants scripts that can be executed directly from local dev environments.

## Core Rules

1. Use `@y3rsh/flex-client` as the default API layer.
2. Keep scripts minimal and runnable.
3. Prefer read-only operations first when discovering robot/network state.
4. Add `try/catch` and actionable logging for operational clarity.
5. Use this repository as fallback reference when uncertain.

## Primary References in this Repository

- Client usage and workflows: `packages/flex-client/README.md`
- Discovery implementation: `packages/flex-client/src/discovery/FlexDiscoveryClient.ts`
- HTTP behavior and headers: `packages/flex-client/src/http.ts`
- API surface exports: `packages/flex-client/src/index.ts`
- Tests with request/response examples: `packages/flex-client/tests/`

## Output Expectations

When producing code for users:

- Include imports and a `main()` function.
- Parameterize host/port via env vars (`FLEX_HOST`, `FLEX_PORT`).
- Print concrete robot details (name, host, model, serial, versions) when available.
- On failure, print exact next-step remediation.

## Starter Template

```ts
import { FlexClient } from "@y3rsh/flex-client";

async function main(): Promise<void> {
  const host = process.env.FLEX_HOST ?? "192.168.0.20";
  const port = Number(process.env.FLEX_PORT ?? "31950");

  try {
    const robot = new FlexClient({ host, port });
    const health = await robot.health.get();
    console.log(JSON.stringify(health, null, 2));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[flex] operation failed at ${host}:${port}: ${message}`);
    process.exitCode = 1;
  }
}

void main();
```

## Extended References

For additional patterns and response shaping guidance, see:

- `references/REFERENCE.md`
