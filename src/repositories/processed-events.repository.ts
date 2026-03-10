import type Database from "better-sqlite3";
import { nowIso } from "../utils/time.js";

export class ProcessedEventsRepository {
  constructor(private readonly db: Database.Database) {}

  save(eventId: string, orderId: string): void {
    this.db
      .prepare(
        `INSERT OR REPLACE INTO processed_events(event_id, order_id, processed_at)
         VALUES(?, ?, ?)`
      )
      .run(eventId, orderId, nowIso());
  }

  has(eventId: string): boolean {
    const row = this.db.prepare("SELECT 1 FROM processed_events WHERE event_id = ?").get(eventId) as
      | { 1: number }
      | undefined;

    return Boolean(row);
  }
}
