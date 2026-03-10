import type Database from "better-sqlite3";
import { newId } from "../utils/ids.js";
import { nowIso } from "../utils/time.js";

export type DeliveryAttemptRecord = {
  orderId: string;
  eventId: string;
  attemptNumber: number;
  outcome: string;
  errorMessage: string | null;
};

export class DeliveryAttemptsRepository {
  constructor(private readonly db: Database.Database) {}

  insert(params: {
    orderId: string;
    eventId: string;
    attemptNumber: number;
    outcome: string;
    errorMessage?: string;
  }): void {
    this.db
      .prepare(
        `INSERT INTO delivery_attempts(id, order_id, event_id, attempt_number, outcome, error_message, created_at)
         VALUES(?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        newId(),
        params.orderId,
        params.eventId,
        params.attemptNumber,
        params.outcome,
        params.errorMessage ?? null,
        nowIso()
      );
  }

  listByOrderId(orderId: string): DeliveryAttemptRecord[] {
    const rows = this.db
      .prepare(
        `SELECT order_id, event_id, attempt_number, outcome, error_message
         FROM delivery_attempts
         WHERE order_id = ?
         ORDER BY attempt_number ASC`
      )
      .all(orderId) as Array<{
      order_id: string;
      event_id: string;
      attempt_number: number;
      outcome: string;
      error_message: string | null;
    }>;

    return rows.map((row) => ({
      orderId: row.order_id,
      eventId: row.event_id,
      attemptNumber: row.attempt_number,
      outcome: row.outcome,
      errorMessage: row.error_message
    }));
  }
}
