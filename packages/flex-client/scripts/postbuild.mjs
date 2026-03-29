import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const cjsDir = resolve(root, "dist/cjs");
const esmDir = resolve(root, "dist/esm");

await mkdir(cjsDir, { recursive: true });
await mkdir(esmDir, { recursive: true });

await writeFile(
  resolve(cjsDir, "package.json"),
  JSON.stringify({ type: "commonjs" }, null, 2) + "\n",
  "utf8"
);

await writeFile(
  resolve(esmDir, "package.json"),
  JSON.stringify({ type: "module" }, null, 2) + "\n",
  "utf8"
);
