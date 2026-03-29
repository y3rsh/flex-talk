# opentrons-flex-client Implementation Plan

This document captures the v1 plan for `@y3rsh/flex-client` and the execution order for delivering a typed, flow-first TypeScript client for Opentrons Flex.

## Scope

- Flex-only support (no OT-2 compatibility).
- Flow-oriented API grouped by user goals.
- Strict, AI-friendly TypeScript types.
- Typed exceptions and internal polling/retry loops.
- Runtime dependency target: native `fetch` (Node 18+) or `node-fetch`.
- Include a modern, dependency-light robot discovery layer compatible with
  Opentrons app workflows.

## Public Client Shape

`FlexClient` is the single entry point:

- `health`
- `instruments`
- `modules`
- `protocols`
- `runs`
- `labwareOffsets`
- `maintenance`
- `deck`
- `errorRecovery`
- `system`

## Package Layout

```text
packages/flex-client/
├── src/
│   ├── index.ts
│   ├── FlexClient.ts
│   ├── http.ts
│   ├── errors.ts
│   ├── types/
│   │   └── ...
│   └── resources/
│       └── ...
├── tests/
│   └── ...
├── package.json
├── tsconfig.json
├── tsconfig.cjs.json
├── tsconfig.esm.json
└── README.md
```

## Phase Plan

1. `HttpClient` + error hierarchy (`FlexApiError`, `FlexRunFailedError`, `FlexTimeoutError`)
2. `HealthResource`
3. `InstrumentsResource` + `ModulesResource`
4. `ProtocolsResource`
5. `RunsResource` (create/start/stop/wait first, then command APIs)
6. `LabwareOffsetsResource`
7. `MaintenanceRunsResource`
8. `DeckResource`
9. `ErrorRecoveryResource` + `SystemResource`
10. Type hardening pass for command unions and response models
11. README completion and usage examples
12. Discovery module parity pass (recreate + streamline app discovery behavior)
13. Camera resource support (`/camera` + image capture endpoints)
14. CI publish workflow with DateVer versioning for GitHub Packages
15. Agent ecosystem adapters (`flex-tools-core` and `flex-mcp-server`)
16. Guidance-only MCP mode (resources/prompts for local execution pattern)
17. Cloudflare Worker public host for guidance MCP (`flex-mcp-worker`)
18. CI deploy workflow for Cloudflare MCP worker

## Definitions of Done

Each phase ships with:

- strict TypeScript coverage for public API
- unit tests for success and failure paths
- typed error semantics for non-2xx responses
- README updates for newly available flows

## Current Status

- [x] Phase 1 started
- [x] Initial package scaffolding created
- [x] Phase 1: `HttpClient` + error hierarchy
- [x] Phase 2: `HealthResource`
- [x] Phase 3: `InstrumentsResource` + `ModulesResource`
- [x] Phase 4: `ProtocolsResource` (upload/list/get/delete/analyze/getAnalysis)
- [x] Phase 5: `RunsResource` (create/list/get/delete/actions/wait/commands/errors)
- [x] Phase 6: `LabwareOffsetsResource`
- [x] Phase 7: `MaintenanceRunsResource`
- [x] Phase 8: `DeckResource`
- [x] Phase 9: `ErrorRecoveryResource` + `SystemResource`
- [x] Phase 10: type hardening pass on command models
- [x] Phase 11: README completion and usage examples
- [x] Phase 12: discovery module recreation and simplification
- [x] Phase 13: camera resource support and docs
- [x] Phase 14: CI GitHub Packages publishing with DateVer
- [x] Phase 15: reusable tool-core and MCP server adapter packages
- [x] Phase 16: guidance-only MCP resources/prompts mode
- [x] Phase 17: public Cloudflare Worker MCP host scaffold
- [x] Phase 18: GitHub Actions deploy workflow for Worker
