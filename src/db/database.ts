import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

export function openDatabase(dbPath: string): Database.Database {
  const directory = path.dirname(dbPath);
  fs.mkdirSync(directory, { recursive: true });
  return new Database(dbPath);
}
