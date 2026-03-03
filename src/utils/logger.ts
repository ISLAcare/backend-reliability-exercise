import type { FastifyBaseLogger } from "fastify";

export function withLogContext(logger: FastifyBaseLogger, eventId: string, orderId: string): FastifyBaseLogger {
  return logger.child({ eventId, orderId });
}
