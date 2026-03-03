export const schemaSql: string[] = [
  `CREATE TABLE IF NOT EXISTS orders (
    order_id TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL,
    last_event_id TEXT,
    updated_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS delivery_attempts (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    event_id TEXT NOT NULL,
    attempt_number INTEGER NOT NULL,
    outcome TEXT NOT NULL,
    error_message TEXT,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS failed_events (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    order_id TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    failure_reason TEXT NOT NULL,
    created_at TEXT NOT NULL,
    replayed_at TEXT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS processed_events (
    event_id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    processed_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS outbox_events (
    id TEXT PRIMARY KEY,
    topic TEXT NOT NULL,
    aggregate_id TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    status TEXT NOT NULL,
    attempt_count INTEGER NOT NULL,
    next_attempt_at TEXT NULL,
    last_error TEXT NULL,
    created_at TEXT NOT NULL,
    published_at TEXT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_delivery_attempts_order_event ON delivery_attempts(order_id, event_id)`,
  `CREATE INDEX IF NOT EXISTS idx_failed_events_event_order ON failed_events(event_id, order_id)`,
  `CREATE INDEX IF NOT EXISTS idx_outbox_events_status_next ON outbox_events(status, next_attempt_at)`
];
