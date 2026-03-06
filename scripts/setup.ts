import fs from "node:fs";
import path from "node:path";

function getNodeMajor(): number {
  const major = Number(process.versions.node.split(".")[0]);
  return Number.isFinite(major) ? major : 0;
}

function ensureNodeVersion(): void {
  const major = getNodeMajor();
  if (major < 24) {
    console.error(`Node 20+ is required. Current version: ${process.versions.node}`);
    process.exit(1);
  }
}

function ensureEnvFile(): void {
  const root = process.cwd();
  const envPath = path.join(root, ".env");
  const examplePath = path.join(root, ".env.example");

  if (!fs.existsSync(examplePath)) {
    return;
  }

  if (!fs.existsSync(envPath)) {
    fs.copyFileSync(examplePath, envPath);
    console.log("Created .env from .env.example");
  } else {
    console.log(".env already exists");
  }
}

function ensureDataDir(): void {
  const root = process.cwd();
  const dataDir = path.join(root, "data");
  fs.mkdirSync(dataDir, { recursive: true });
}

ensureNodeVersion();
ensureEnvFile();
ensureDataDir();

console.log("Setup complete.");
