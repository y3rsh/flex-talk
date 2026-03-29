# Skill Publishing

This repository publishes the `flex-agentic-tools` skill to:

- GitHub Pages (automatic)
- Cloudflare Pages (pull-based from GitHub repository)

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

## Cloudflare Pages setup

Configure Cloudflare Pages to build directly from this repository with Astro:

1. Cloudflare Dashboard -> Workers & Pages -> Create -> Pages -> Connect to Git
2. Select this repository and branch (`main`)
3. Set build settings:
   - Build command: `cd site && npm ci && npm run build`
   - Build output directory: `site/dist`
   - Root directory: `/` (repo root)
4. Save and deploy

Attach a custom domain in:

- Cloudflare Dashboard -> Workers & Pages -> your Pages project -> Custom domains

## Consumption model

Tools/agents should point to the published `skill.md` URL.
When additional context is needed, use this repository as fallback reference.
