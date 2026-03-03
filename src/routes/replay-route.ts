import type { FastifyInstance } from "fastify";
import type { FailedEventsRepository } from "../repositories/failed-events-repository.js";
import type { ProcessOrderPaidDependencies } from "../services/process-order-paid.js";
import { replayFailedEvent } from "../services/replay-failed-event.js";

export function registerReplayRoute(
  app: FastifyInstance,
  failedEventsRepository: FailedEventsRepository,
  processingDeps: ProcessOrderPaidDependencies
): void {
  app.post<{ Params: { id: string } }>("/replay/:id", async (request, reply) => {
    const replay = await replayFailedEvent(failedEventsRepository, processingDeps, request.params.id);
    if (!replay) {
      return reply.status(404).send({
        status: "not_found",
        message: `Failed event ${request.params.id} not found`
      });
    }

    return reply.status(200).send(replay);
  });
}
