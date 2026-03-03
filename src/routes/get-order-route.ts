import type { FastifyInstance } from "fastify";
import type { OrdersRepository } from "../repositories/orders-repository.js";

export function registerGetOrderRoute(app: FastifyInstance, ordersRepository: OrdersRepository): void {
  app.get<{ Params: { orderId: string } }>("/orders/:orderId", async (request, reply) => {
    const order = ordersRepository.getByOrderId(request.params.orderId);
    if (!order) {
      return reply.status(404).send({
        status: "not_found",
        message: `Order ${request.params.orderId} not found`
      });
    }

    return reply.status(200).send(order);
  });
}
