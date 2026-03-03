import type { FastifyInstance } from "fastify";
import type { FailedEventsRepository } from "../repositories/failed-events-repository.js";

export function registerFailedEventsRoute(app: FastifyInstance, failedEventsRepository: FailedEventsRepository): void {
  app.get("/failed-events", async (_request, reply) => {
    return reply.status(200).send(failedEventsRepository.list());
  });
}
