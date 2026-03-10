import type { FastifyInstance } from "fastify";
import { orderPaidEventSchema } from "../domain/events.js";
import type { OrderPaidService } from "../services/order-paid.service.js";

export function registerOrderPaidRoute(app: FastifyInstance, orderPaidService: OrderPaidService): void {
  app.post("/events/order-paid", async (request, reply) => {
    const parsed = orderPaidEventSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        status: "invalid_payload",
        message: "Invalid OrderPaid payload",
        issues: parsed.error.issues
      });
    }

    const result = await orderPaidService.process(parsed.data);

    return reply.status(202).send({
      orderId: result.orderId,
      eventId: result.eventId,
      status: result.status,
      message: result.message
    });
  });
}
