import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";

const config = loadConfig();
const { app } = buildApp({
  dbPath: config.dbPath,
  fulfillmentMode: config.fulfillmentMode
});

app
  .listen({ host: "0.0.0.0", port: config.port })
  .then(() => {
    app.log.info(`server listening on ${config.port}`);
  })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
