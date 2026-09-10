import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const dbPath = join(process.cwd(), "data", "question-bank.db");
mkdirSync(dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec("PRAGMA foreign_keys = ON;");
db.exec(`
  CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "checksum" TEXT NOT NULL,
    "finished_at" DATETIME,
    "migration_name" TEXT NOT NULL,
    "logs" TEXT,
    "rolled_back_at" DATETIME,
    "started_at" DATETIME NOT NULL DEFAULT current_timestamp,
    "applied_steps_count" INTEGER UNSIGNED NOT NULL DEFAULT 0
  );
`);

const migrationName = "202606280001_init";
const alreadyApplied = db.prepare('SELECT COUNT(*) AS count FROM "_prisma_migrations" WHERE "migration_name" = ?').get(migrationName).count;

if (!alreadyApplied) {
  const sql = readFileSync(join(process.cwd(), "prisma", "migrations", migrationName, "migration.sql"), "utf8");
  db.exec(sql);
  db.prepare(`
    INSERT INTO "_prisma_migrations" (
      id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count
    )
    VALUES (?, ?, CURRENT_TIMESTAMP, ?, NULL, NULL, CURRENT_TIMESTAMP, 1)
  `).run(randomUUID(), "manual-sqlite-init", migrationName);
}

db.close();
console.log(`SQLite schema ready at ${dbPath}`);
