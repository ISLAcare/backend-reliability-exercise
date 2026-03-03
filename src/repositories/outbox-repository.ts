import type Database from "better-sqlite3";
import { nowIso } from "../utils/time.js";
import { newId } from "../utils/ids.js";

export class OutboxRepository {
  constructor(private readonly db: Database.Database) {}

  enqueue(topic: string, aggregateId: string, payloadJson: string): void {
    this.db
      .prepare(
        `INSERT INTO outbox_events(id, topic, aggregate_id, payload_json, status, attempt_count, next_attempt_at, last_error, created_at, published_at)
         VALUES(?, ?, ?, ?, 'pending', 0, NULL, NULL, ?, NULL)`
      )
      .run(newId(), topic, aggregateId, payloadJson, nowIso());
  }
}
