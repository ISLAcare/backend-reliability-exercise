import type { OrderRecord } from "../domain/orders.js";

export type OrderQueryStore = {
  getByOrderId(orderId: string): OrderRecord | null;
};

export class OrderQueryService {
  constructor(private readonly ordersStore: OrderQueryStore) {}

  getByOrderId(orderId: string): OrderRecord | null {
    return this.ordersStore.getByOrderId(orderId);
  }
}
