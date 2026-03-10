import type Database from "better-sqlite3";
import type { OrderRecord, OrderStatus } from "../domain/orders.js";
import type { OrderPaidEvent } from "../domain/events.js";
import { nowIso } from "../utils/time.js";

export class OrdersRepository {
  constructor(private readonly db: Database.Database) {}

  upsertReceived(event: OrderPaidEvent): void {
    const ts = nowIso();
    this.db
      .prepare(
        `INSERT INTO orders(order_id, status, amount, currency, last_event_id, created_at, updated_at)
         VALUES(@order_id, @status, @amount, @currency, @last_event_id, @created_at, @updated_at)
         ON CONFLICT(order_id) DO UPDATE SET
           status=excluded.status,
           amount=excluded.amount,
           currency=excluded.currency,
           last_event_id=excluded.last_event_id,
           updated_at=excluded.updated_at`
      )
      .run({
        order_id: event.orderId,
        status: "received",
        amount: event.amount,
        currency: event.currency,
        last_event_id: event.eventId,
        created_at: ts,
        updated_at: ts
      });
  }

  updateStatus(orderId: string, status: OrderStatus, lastEventId?: string): void {
    this.db
      .prepare(
        `UPDATE orders
         SET status = ?,
             last_event_id = COALESCE(?, last_event_id),
             updated_at = ?
         WHERE order_id = ?`
      )
      .run(status, lastEventId ?? null, nowIso(), orderId);
  }

  getByOrderId(orderId: string): OrderRecord | null {
    const row = this.db.prepare("SELECT * FROM orders WHERE order_id = ?").get(orderId) as
      | {
          order_id: string;
          status: OrderStatus;
          amount: number;
          currency: string;
          last_event_id: string | null;
          updated_at: string;
          created_at: string;
        }
      | undefined;

    if (!row) {
      return null;
    }

    return {
      orderId: row.order_id,
      status: row.status,
      amount: row.amount,
      currency: row.currency,
      lastEventId: row.last_event_id,
      updatedAt: row.updated_at,
      createdAt: row.created_at
    };
  }
}
