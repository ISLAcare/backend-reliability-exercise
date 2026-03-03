import type Database from "better-sqlite3";
import { schemaSql } from "./schema.js";

export function runMigrations(db: Database.Database): void {
  for (const statement of schemaSql) {
    db.exec(statement);
  }
}
