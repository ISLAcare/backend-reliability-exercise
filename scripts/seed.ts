import { buildApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";

const config = loadConfig();
const { app } = buildApp({
  dbPath: config.dbPath,
  fulfillmentMode: "success"
});

const sampleEvent = {
  eventId: `seed-${Date.now()}`,
  orderId: "seed-order-1",
  occurredAt: new Date().toISOString(),
  amount: 4200,
  currency: "USD"
};

const res = await app.inject({
  method: "POST",
  url: "/events/order-paid",
  payload: sampleEvent
});

console.log(`Seed event status: ${res.statusCode}`);
await app.close();
