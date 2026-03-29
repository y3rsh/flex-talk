# @y3rsh/flex-mcp-server

Guidance-only MCP server for `@y3rsh/flex-client`.

## Install

```bash
npm install @y3rsh/flex-mcp-server
```

## Run

```bash
npx flex-mcp-server
```

## Execution model

- This MCP server does **not** execute robot operations.
- It exposes resources and prompts that teach agents how to generate and run
  local TypeScript code using `@y3rsh/flex-client`.
- Robot actions should execute on the user's machine.

## Exposed resources and prompts

Resources:

- `flex://tools/catalog`
- `flex://guides/local-execution`

Prompts:

- `flex-generate-local-code`
