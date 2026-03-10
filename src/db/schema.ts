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
  `CREATE TABLE IF NOT EXISTS processed_events (
    event_id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    processed_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_delivery_attempts_order_event ON delivery_attempts(order_id, event_id)`
];
