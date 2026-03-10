import fs from "node:fs";
import path from "node:path";

export type FulfillmentMode = "success" | "failOncePerOrder" | "alwaysFail" | "randomFail";

export type AppConfig = {
  port: number;
  dbPath: string;
  fulfillmentMode: FulfillmentMode;
};

let envLoaded = false;

function loadEnvFile(): void {
  if (envLoaded) {
    return;
  }

  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    envLoaded = true;
    return;
  }

  const file = fs.readFileSync(envPath, "utf8");
  for (const line of file.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }

  envLoaded = true;
}

export function loadConfig(): AppConfig {
  loadEnvFile();

  const rawPort = Number(process.env.PORT ?? "3000");
  const mode = (process.env.FULFILLMENT_MODE ?? "randomFail") as FulfillmentMode;

  return {
    port: Number.isFinite(rawPort) ? rawPort : 3000,
    dbPath: process.env.DB_PATH ?? "./data/app.db",
    fulfillmentMode: mode
  };
}
