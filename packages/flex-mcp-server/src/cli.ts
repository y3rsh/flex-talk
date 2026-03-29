#!/usr/bin/env node
import { startFlexMcpServer } from "./index.js";

startFlexMcpServer().catch((error) => {
  console.error("Failed to start flex MCP server:", error);
  process.exit(1);
});
