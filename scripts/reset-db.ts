import fs from "node:fs";
import { loadConfig } from "../src/config.js";

const { dbPath } = loadConfig();
if (fs.existsSync(dbPath)) {
  fs.rmSync(dbPath);
  console.log(`Removed ${dbPath}`);
} else {
  console.log(`No database file at ${dbPath}`);
}
