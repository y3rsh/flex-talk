#!/usr/bin/env node
import { startFlexMcpServer } from "./index.js";

const defaultHost = process.env.FLEX_HOST;

startFlexMcpServer(defaultHost ? { defaultHost } : undefined).catch((error) => {
  console.error("Failed to start flex MCP server:", error);
  process.exit(1);
});
