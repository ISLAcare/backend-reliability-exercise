import { z } from "zod";

export const orderPaidEventSchema = z.object({
  eventId: z.string().min(1),
  orderId: z.string().min(1),
  occurredAt: z.string().datetime(),
  amount: z.number().positive(),
  currency: z.string().min(1)
});

export type OrderPaidEvent = z.infer<typeof orderPaidEventSchema>;
