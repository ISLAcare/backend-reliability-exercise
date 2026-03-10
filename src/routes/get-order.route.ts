import type { FastifyInstance } from "fastify";
import type { OrderQueryService } from "../services/order-query.service.js";

export function registerGetOrderRoute(app: FastifyInstance, orderQueryService: OrderQueryService): void {
  app.get<{ Params: { orderId: string } }>("/orders/:orderId", async (request, reply) => {
    const order = orderQueryService.getByOrderId(request.params.orderId);
    if (!order) {
      return reply.status(404).send({
        status: "not_found",
        message: `Order ${request.params.orderId} not found`
      });
    }

    return reply.status(200).send(order);
  });
}
