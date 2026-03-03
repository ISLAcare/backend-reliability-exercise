export type OrderStatus = "received" | "processing" | "fulfilled" | "failed";

export type OrderRecord = {
  orderId: string;
  status: OrderStatus;
  amount: number;
  currency: string;
  lastEventId: string | null;
  updatedAt: string;
  createdAt: string;
};
