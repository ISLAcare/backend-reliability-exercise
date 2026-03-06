import type Database from "better-sqlite3";
import { newId } from "../utils/ids.js";
import { nowIso } from "../utils/time.js";

export type FailedEventRecord = {
  id: string;
  eventId: string;
  orderId: string;
  payloadJson: string;
  failureReason: string;
  createdAt: string;
  replayedAt: string | null;
};

export class FailedEventsRepository {
  constructor(private readonly db: Database.Database) {}

  insert(eventId: string, orderId: string, payloadJson: string, failureReason: string): string {
    const id = newId();
    this.db
      .prepare(
        `INSERT INTO failed_events(id, event_id, order_id, payload_json, failure_reason, created_at, replayed_at)
         VALUES(?, ?, ?, ?, ?, ?, NULL)`
      )
      .run(id, eventId, orderId, payloadJson, failureReason, nowIso());
    return id;
  }

  list(): FailedEventRecord[] {
    const rows = this.db.prepare("SELECT * FROM failed_events ORDER BY created_at DESC").all() as Array<{
      id: string;
      event_id: string;
      order_id: string;
      payload_json: string;
      failure_reason: string;
      created_at: string;
      replayed_at: string | null;
    }>;

    return rows.map((row) => ({
      id: row.id,
      eventId: row.event_id,
      orderId: row.order_id,
      payloadJson: row.payload_json,
      failureReason: row.failure_reason,
      createdAt: row.created_at,
      replayedAt: row.replayed_at
    }));
  }

  /** Check if we already have a failed record for this event (avoids duplicate rows on retries). */
  getByEventId(eventId: string): FailedEventRecord | null {
    const row = this.db.prepare("SELECT * FROM failed_events WHERE event_id = ? LIMIT 1").get(eventId) as
      | {
          id: string;
          event_id: string;
          order_id: string;
          payload_json: string;
          failure_reason: string;
          created_at: string;
          replayed_at: string | null;
        }
      | undefined;
    if (!row) return null;
    return {
      id: row.id,
      eventId: row.event_id,
      orderId: row.order_id,
      payloadJson: row.payload_json,
      failureReason: row.failure_reason,
      createdAt: row.created_at,
      replayedAt: row.replayed_at
    };
  }

  getById(id: string): FailedEventRecord | null {
    const row = this.db.prepare("SELECT * FROM failed_events WHERE id = ?").get(id) as
      | {
          id: string;
          event_id: string;
          order_id: string;
          payload_json: string;
          failure_reason: string;
          created_at: string;
          replayed_at: string | null;
        }
      | undefined;

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      eventId: row.event_id,
      orderId: row.order_id,
      payloadJson: row.payload_json,
      failureReason: row.failure_reason,
      createdAt: row.created_at,
      replayedAt: row.replayed_at
    };
  }

  markReplayed(id: string): void {
    this.db.prepare("UPDATE failed_events SET replayed_at = ? WHERE id = ?").run(nowIso(), id);
  }
}
