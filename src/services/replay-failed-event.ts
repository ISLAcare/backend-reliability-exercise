import type { ProcessOrderPaidDependencies, ProcessOrderPaidResult } from "./process-order-paid.js";
import type { FailedEventsRepository } from "../repositories/failed-events-repository.js";
import type { OrderPaidEvent } from "../domain/events.js";
import { processOrderPaid } from "./process-order-paid.js";

export type ReplayResult = {
  failedEventId: string;
  result: ProcessOrderPaidResult;
};

export async function replayFailedEvent(
  failedEventsRepository: FailedEventsRepository,
  processingDependencies: ProcessOrderPaidDependencies,
  failedEventId: string
): Promise<ReplayResult | null> {
  const failed = failedEventsRepository.getById(failedEventId);
  if (!failed) {
    return null;
  }

  // Replay path safety: already replayed — return success without reprocessing (avoids duplicate fulfillment).
  if (failed.replayedAt) {
    return {
      failedEventId,
      result: {
        ok: true,
        status: "fulfilled",
        orderId: failed.orderId,
        eventId: failed.eventId,
        message: "Already replayed"
      }
    };
  }

  const payload = JSON.parse(failed.payloadJson) as OrderPaidEvent;

  // Replay path safety: event was already fulfilled (e.g. after retries) — mark replayed and return success without calling fulfillment again.
  if (processingDependencies.processedEventsRepository.exists(payload.eventId)) {
    failedEventsRepository.markReplayed(failedEventId);
    return {
      failedEventId,
      result: {
        ok: true,
        status: "fulfilled",
        orderId: payload.orderId,
        eventId: payload.eventId,
        message: "Event already processed; marked replayed"
      }
    };
  }

  const result = await processOrderPaid(processingDependencies, payload);

  if (result.ok) {
    failedEventsRepository.markReplayed(failedEventId);
  }

  return {
    failedEventId,
    result
  };
}
