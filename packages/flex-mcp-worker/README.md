# @y3rsh/flex-mcp-worker

Public Cloudflare Worker host for the guidance-only Flex MCP endpoint.

This service exposes MCP resources/prompts that teach agents to execute
`@y3rsh/flex-client` code locally on user machines. It does **not** execute
robot operations remotely.

## Endpoints

- `GET /health` - service status
- `POST /mcp` - MCP Streamable HTTP endpoint
- `GET /mcp` / `DELETE /mcp` - transport-compatible MCP methods

## Deploy

```bash
cd packages/flex-mcp-worker
npm install
npm run deploy
```

## GitHub Actions deploy

This repo includes `.github/workflows/deploy-flex-mcp-worker.yml` for automatic
deploys on `main` pushes (and manual dispatch).

Required repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## Custom domain

In Cloudflare dashboard:

1. Workers & Pages -> `flex-mcp-worker`
2. Triggers -> Custom Domains
3. Add your domain (example: `mcp.yourdomain.com`)

## Public mode

This Worker is configured for public access. If you later want to protect it:

- add Cloudflare Access policy
- or enforce API key header checks in `src/worker.ts`
