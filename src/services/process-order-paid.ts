import type { FastifyBaseLogger } from "fastify";
import type { OrderPaidEvent } from "../domain/events.js";
import { withLogContext } from "../utils/logger.js";
import { FakeFulfillmentClient, FakeFulfillmentError } from "../clients/fake-fulfillment-client.js";
import { DeliveryAttemptsRepository } from "../repositories/delivery-attempts-repository.js";
import { FailedEventsRepository } from "../repositories/failed-events-repository.js";
import { OrdersRepository } from "../repositories/orders-repository.js";
import { OutboxRepository } from "../repositories/outbox-repository.js";
import { ProcessedEventsRepository } from "../repositories/processed-events-repository.js";
import { MetricsService } from "./metrics.js";

export type ProcessOrderPaidResult =
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

export type ProcessOrderPaidDependencies = {
  logger: FastifyBaseLogger;
  ordersRepository: OrdersRepository;
  deliveryAttemptsRepository: DeliveryAttemptsRepository;
  failedEventsRepository: FailedEventsRepository;
  processedEventsRepository: ProcessedEventsRepository;
  outboxRepository: OutboxRepository;
  fulfillmentClient: FakeFulfillmentClient;
  metrics: MetricsService;
};

export async function processOrderPaid(
  deps: ProcessOrderPaidDependencies,
  event: OrderPaidEvent
): Promise<ProcessOrderPaidResult> {
  const logger = withLogContext(deps.logger, event.eventId, event.orderId);
  deps.metrics.incrementAccepted();

  deps.ordersRepository.upsertReceived(event);
  deps.outboxRepository.enqueue("order.paid", event.orderId, JSON.stringify(event));

  deps.ordersRepository.updateStatus(event.orderId, "processing", event.eventId);

  const maxAttempts = 3;
  let hadFailure = false;
  let lastError = "unknown downstream error";

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await deps.fulfillmentClient.fulfillShipment(event.orderId, event.eventId);
      deps.deliveryAttemptsRepository.insert({
        orderId: event.orderId,
        eventId: event.eventId,
        attemptNumber: attempt,
        outcome: "success"
      });
      deps.ordersRepository.updateStatus(event.orderId, "fulfilled", event.eventId);
      deps.processedEventsRepository.save(event.eventId, event.orderId);
      deps.metrics.incrementFulfilled();

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

      deps.deliveryAttemptsRepository.insert({
        orderId: event.orderId,
        eventId: event.eventId,
        attemptNumber: attempt,
        outcome: "failure",
        errorMessage: lastError
      });

      logger.warn(`Downstream attempt ${attempt} failed: ${lastError}`);

      if (attempt === 1) {
        deps.failedEventsRepository.insert(event.eventId, event.orderId, JSON.stringify(event), lastError);
      }

      if (error instanceof FakeFulfillmentError && error.kind === "timeout") {
        continue;
      }
    }
  }

  deps.metrics.incrementFailed();

  if (!lastError.includes("timeout")) {
    deps.ordersRepository.updateStatus(event.orderId, "failed", event.eventId);
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
