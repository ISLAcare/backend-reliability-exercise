import Fastify, { type FastifyInstance } from "fastify";
import type { FulfillmentMode } from "./config.js";
import { openDatabase } from "./db/database.js";
import { runMigrations } from "./db/migrate.js";
import { OrdersRepository } from "./repositories/orders-repository.js";
import { DeliveryAttemptsRepository } from "./repositories/delivery-attempts-repository.js";
import { FailedEventsRepository } from "./repositories/failed-events-repository.js";
import { ProcessedEventsRepository } from "./repositories/processed-events-repository.js";
import { OutboxRepository } from "./repositories/outbox-repository.js";
import { FakeFulfillmentClient } from "./clients/fake-fulfillment-client.js";
import { MetricsService } from "./services/metrics.js";
import { registerOrderPaidRoute } from "./routes/order-paid-route.js";
import { registerGetOrderRoute } from "./routes/get-order-route.js";
import { registerFailedEventsRoute } from "./routes/failed-events-route.js";
import { registerReplayRoute } from "./routes/replay-route.js";
import type { ProcessOrderPaidDependencies } from "./services/process-order-paid.js";

export type BuildAppOptions = {
  dbPath: string;
  fulfillmentMode: FulfillmentMode;
};

export type AppContext = {
  app: FastifyInstance;
  fulfillmentClient: FakeFulfillmentClient;
};

export function buildApp(options: BuildAppOptions): AppContext {
  const app = Fastify({ logger: true });
  const db = openDatabase(options.dbPath);

  runMigrations(db);

  const ordersRepository = new OrdersRepository(db);
  const deliveryAttemptsRepository = new DeliveryAttemptsRepository(db);
  const failedEventsRepository = new FailedEventsRepository(db);
  const processedEventsRepository = new ProcessedEventsRepository(db);
  const outboxRepository = new OutboxRepository(db);
  const fulfillmentClient = new FakeFulfillmentClient(options.fulfillmentMode);
  const metrics = new MetricsService();

  const processingDeps: ProcessOrderPaidDependencies = {
    logger: app.log,
    ordersRepository,
    deliveryAttemptsRepository,
    failedEventsRepository,
    processedEventsRepository,
    outboxRepository,
    fulfillmentClient,
    metrics
  };

  registerOrderPaidRoute(app, processingDeps);
  registerGetOrderRoute(app, ordersRepository);
  registerFailedEventsRoute(app, failedEventsRepository);
  registerReplayRoute(app, failedEventsRepository, processingDeps);

  app.get("/health", async () => ({
    status: "ok",
    metrics: metrics.snapshot()
  }));

  app.addHook("onClose", async () => {
    db.close();
  });

  return {
    app,
    fulfillmentClient
  };
}
