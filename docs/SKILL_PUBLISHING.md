# Skill Publishing

This repository publishes the `flex-agentic-tools` skill to:

- GitHub Pages (automatic)
- Cloudflare Workers Builds (pull-based from GitHub repository)

## Source of truth

- Skill: `.agents/skills/flex-agentic-tools/SKILL.md`
- Reference: `.agents/skills/flex-agentic-tools/references/REFERENCE.md`
- Workflow: `.github/workflows/publish-skill-site.yml`
- Astro site: `site/`
- Build parity script: `site/scripts/sync-skill-assets.mjs`

Compatibility mirrors are committed for cross-tool discovery:

- Anthropic/Claude: `.claude/skills/flex-agentic-tools/`
- OpenAI/Codex: `.codex/skills/flex-agentic-tools/`

The publish workflow validates these mirrors stay byte-for-byte aligned with the
canonical `.agents/skills` copies.

## GitHub Pages setup

1. Repository Settings -> Pages
2. Build and deployment -> Source -> GitHub Actions
3. Push to `main` touching the skill/workflow files

Published files:

- `/index.html`
- `/skill.md`
- `/skill.json`

`skill.json` includes compatibility metadata for Agent Skills, Claude Skills,
and Codex Skills consumers.

## Cloudflare Workers Builds setup

Configure Cloudflare to build and deploy as a Worker from this repository:

1. Cloudflare Dashboard -> Workers & Pages -> Create -> Workers -> Import a repository
2. Select this repository and branch (`main`)
3. Set build/deploy settings:
   - Root directory: `site`
   - Build command: `npm ci && npm run build`
   - Deploy command: `npm run deploy`
   - Non-production branch deploy command: `npm run deploy`
   - Version command: `npm run versions:upload`
   - Worker path: `worker/index.ts`
4. Save and deploy

Important: if the project shows "disconnected from your Git account", reconnect it
before relying on branch-based builds/deployments.

Attach a custom domain in:

- Cloudflare Dashboard -> Workers & Pages -> your Worker -> Triggers -> Custom Domains

## Consumption model

Tools/agents should point to the published `skill.md` URL.
When additional context is needed, use this repository as fallback reference.
