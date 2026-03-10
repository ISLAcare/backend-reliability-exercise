import type { FastifyBaseLogger } from "fastify";
import type { OrderPaidEvent } from "../domain/events.js";
import { FakeFulfillmentError } from "../clients/fake-fulfillment.client.js";
import { withLogContext } from "../utils/logger.js";

export type OrderPaidResult =
  | {
      ok: true;
      status: "fulfilled" | "accepted_with_warnings";
      orderId: string;
      eventId: string;
      message: string;
    }
  | {
      ok: false;
      status: "failed";
      orderId: string;
      eventId: string;
      reason: string;
      message: string;
    };

export type OrdersStore = {
  upsertReceived(event: OrderPaidEvent): void;
  updateStatus(orderId: string, status: "received" | "processing" | "fulfilled" | "failed", lastEventId?: string): void;
};

export type DeliveryAttemptsStore = {
  insert(params: {
    orderId: string;
    eventId: string;
    attemptNumber: number;
    outcome: string;
    errorMessage?: string;
  }): void;
};

export type ProcessedEventsStore = {
  save(eventId: string, orderId: string): void;
  has(eventId: string): boolean;
};

export type FulfillmentGateway = {
  fulfillShipment(orderId: string, eventId: string): Promise<void>;
};

export type MetricsCollector = {
  incrementAccepted(): void;
  incrementFulfilled(): void;
  incrementFailed(): void;
};

export type OrderPaidServiceDependencies = {
  logger: FastifyBaseLogger;
  ordersStore: OrdersStore;
  deliveryAttemptsStore: DeliveryAttemptsStore;
  processedEventsStore: ProcessedEventsStore;
  fulfillmentGateway: FulfillmentGateway;
  metrics: MetricsCollector;
};

export class OrderPaidService {
  constructor(private readonly deps: OrderPaidServiceDependencies) {}

  async process(event: OrderPaidEvent): Promise<OrderPaidResult> {
    const logger = withLogContext(this.deps.logger, event.eventId, event.orderId);
    this.deps.metrics.incrementAccepted();

    this.deps.ordersStore.upsertReceived(event);
    this.deps.ordersStore.updateStatus(event.orderId, "processing", event.eventId);

    const maxAttempts = 3;
    let hadFailure = false;
    let lastError = "unknown downstream error";

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        await this.deps.fulfillmentGateway.fulfillShipment(event.orderId, event.eventId);
        this.deps.deliveryAttemptsStore.insert({
          orderId: event.orderId,
          eventId: event.eventId,
          attemptNumber: attempt,
          outcome: "success"
        });
        this.deps.ordersStore.updateStatus(event.orderId, "fulfilled", event.eventId);
        this.deps.processedEventsStore.save(event.eventId, event.orderId);
        this.deps.metrics.incrementFulfilled();

        return {
          ok: true,
          status: hadFailure ? "accepted_with_warnings" : "fulfilled",
          orderId: event.orderId,
          eventId: event.eventId,
          message: hadFailure ? "Fulfilled after retries" : "Fulfilled"
        };
      } catch (error) {
        hadFailure = true;
        lastError = error instanceof Error ? error.message : "unknown error";

        this.deps.deliveryAttemptsStore.insert({
          orderId: event.orderId,
          eventId: event.eventId,
          attemptNumber: attempt,
          outcome: "failure",
          errorMessage: lastError
        });

        logger.warn(`Downstream attempt ${attempt} failed: ${lastError}`);

        if (error instanceof FakeFulfillmentError && error.kind === "timeout") {
          continue;
        }
      }
    }

    this.deps.metrics.incrementFailed();

    if (!lastError.includes("timeout")) {
      this.deps.ordersStore.updateStatus(event.orderId, "failed", event.eventId);
    }

    return {
      ok: false,
      status: "failed",
      orderId: event.orderId,
      eventId: event.eventId,
      reason: lastError,
      message: "Processing failed after retries"
    };
  }
}
