import { loadConfig } from "../src/config.js";
import { buildApp } from "../src/app.js";

async function run(): Promise<void> {
  const config = loadConfig();
  const { app } = buildApp({
    dbPath: config.dbPath,
    fulfillmentMode: "success"
  });

  await app.ready();

  const response = await app.inject({
    method: "GET",
    url: "/health"
  });

  await app.close();

  if (response.statusCode !== 200) {
    console.error(`Smoke check failed: /health returned ${response.statusCode}`);
    process.exit(1);
  }

  console.log("Smoke check passed.");
}

run().catch((error) => {
  console.error("Smoke check failed with exception:", error);
  process.exit(1);
});
