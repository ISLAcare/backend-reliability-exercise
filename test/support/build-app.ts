import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildApp } from "../../src/app.js";
import type { FulfillmentMode } from "../../src/config.js";

export async function createTestApp(mode: FulfillmentMode = "success"): Promise<{
  app: ReturnType<typeof buildApp>["app"];
  cleanup: () => Promise<void>;
  getFulfilledCount: (orderId: string) => number;
}> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "backend-lead-test-"));
  const dbPath = path.join(dir, "app.db");

  const { app, fulfillmentClient } = buildApp({
    dbPath,
    fulfillmentMode: mode
  });

  await app.ready();

  return {
    app,
    getFulfilledCount: (orderId: string) => fulfillmentClient.getFulfilledCount(orderId),
    cleanup: async () => {
      await app.close();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  };
}
