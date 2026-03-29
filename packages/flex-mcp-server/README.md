# @y3rsh/flex-mcp-server

MCP server adapter for `@y3rsh/flex-client`.

## Install

```bash
npm install @y3rsh/flex-mcp-server
```

## Run

```bash
FLEX_HOST=192.168.0.20 npx flex-mcp-server
```

If a tool call does not provide `host`, `FLEX_HOST` is used as the default.

## Exposed tools

- `flex.discover`
- `flex.health`
- `flex.inspect_hardware`
- `flex.camera.take_picture`
- `flex.run_protocol`
- `flex.run_status`
