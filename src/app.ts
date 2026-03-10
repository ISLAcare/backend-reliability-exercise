import Fastify, { type FastifyInstance } from "fastify";
import type { FulfillmentMode } from "./config.js";
import { FakeFulfillmentClient } from "./clients/fake-fulfillment.client.js";
import { openDatabase } from "./db/database.js";
import { runMigrations } from "./db/migrate.js";
import { DeliveryAttemptsRepository } from "./repositories/delivery-attempts.repository.js";
import { OrdersRepository } from "./repositories/orders.repository.js";
import { ProcessedEventsRepository } from "./repositories/processed-events.repository.js";
import { registerGetOrderRoute } from "./routes/get-order.route.js";
import { registerOrderPaidRoute } from "./routes/order-paid.route.js";
import { MetricsService } from "./services/metrics.js";
import { OrderPaidService } from "./services/order-paid.service.js";
import { OrderQueryService } from "./services/order-query.service.js";

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
  const processedEventsRepository = new ProcessedEventsRepository(db);
  const fulfillmentClient = new FakeFulfillmentClient(options.fulfillmentMode);
  const metrics = new MetricsService();
  const orderPaidService = new OrderPaidService({
    logger: app.log,
    ordersStore: ordersRepository,
    deliveryAttemptsStore: deliveryAttemptsRepository,
    processedEventsStore: processedEventsRepository,
    fulfillmentGateway: fulfillmentClient,
    metrics
  });
  const orderQueryService = new OrderQueryService(ordersRepository);

  registerOrderPaidRoute(app, orderPaidService);
  registerGetOrderRoute(app, orderQueryService);

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
