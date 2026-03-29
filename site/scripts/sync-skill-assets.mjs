import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { resolve } from "node:path";

const siteRoot = process.cwd();
const repoRoot = resolve(siteRoot, "..");
const publicDir = resolve(siteRoot, "public");

const canonicalSkill = resolve(repoRoot, ".agents/skills/flex-agentic-tools/SKILL.md");
const canonicalReference = resolve(
  repoRoot,
  ".agents/skills/flex-agentic-tools/references/REFERENCE.md"
);

const claudeSkill = resolve(repoRoot, ".claude/skills/flex-agentic-tools/SKILL.md");
const claudeReference = resolve(
  repoRoot,
  ".claude/skills/flex-agentic-tools/references/REFERENCE.md"
);

const codexSkill = resolve(repoRoot, ".codex/skills/flex-agentic-tools/SKILL.md");
const codexReference = resolve(
  repoRoot,
  ".codex/skills/flex-agentic-tools/references/REFERENCE.md"
);

async function assertEqual(pathA, pathB) {
  const [a, b] = await Promise.all([readFile(pathA, "utf8"), readFile(pathB, "utf8")]);
  if (a !== b) {
    throw new Error(`Skill mirror mismatch:\n- ${pathA}\n- ${pathB}`);
  }
}

await assertEqual(canonicalSkill, claudeSkill);
await assertEqual(canonicalSkill, codexSkill);
await assertEqual(canonicalReference, claudeReference);
await assertEqual(canonicalReference, codexReference);

await mkdir(publicDir, { recursive: true });
await copyFile(canonicalSkill, resolve(publicDir, "skill.md"));

const version = process.env.GITHUB_SHA ?? "local";
const metadata = {
  name: "flex-agentic-tools",
  version,
  skillUrl: "skill.md",
  sourceRepository: "https://github.com/y3rsh/flex-talk",
  compatibility: ["agent-skills", "anthropic-claude-skills", "openai-codex-skills"],
};

await writeFile(resolve(publicDir, "skill.json"), JSON.stringify(metadata, null, 2) + "\n", "utf8");
