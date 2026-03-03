import type Database from "better-sqlite3";
import { newId } from "../utils/ids.js";
import { nowIso } from "../utils/time.js";

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
}
