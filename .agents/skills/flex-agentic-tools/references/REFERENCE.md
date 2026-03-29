# Flex Agentic Reference

This reference expands the `flex-agentic-tools` skill with practical guidance.

## Preferred workflow

1. Confirm intent (`discover`, `health`, `camera`, `hardware`, `run status`).
2. Generate local TypeScript with explicit env-driven host config.
3. Execute and capture structured output.
4. Summarize key robot details and next step.

## Repo fallback strategy

When uncertain, prefer examples and tests from this repo over assumptions:

- Read usage patterns in `packages/flex-client/README.md`
- Inspect typed models in `packages/flex-client/src/types/`
- Mirror tested behavior from `packages/flex-client/tests/`

## Response quality checklist

- Output includes robot identity fields where available.
- Errors include cause + remediation.
- Script is runnable without editing code constants.
- Avoid adding dependencies unless required.
