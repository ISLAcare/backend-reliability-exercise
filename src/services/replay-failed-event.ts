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

  const payload = JSON.parse(failed.payloadJson) as OrderPaidEvent;
  const result = await processOrderPaid(processingDependencies, payload);

  if (result.ok) {
    failedEventsRepository.markReplayed(failedEventId);
  }

  return {
    failedEventId,
    result
  };
}
