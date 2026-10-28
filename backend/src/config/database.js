const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const dataDirectory = path.resolve(__dirname, "..", "..", "data");
const databasePath = path.join(dataDirectory, "appointments.sqlite");

fs.mkdirSync(dataDirectory, { recursive: true, mode: 0o700 });
if (process.platform !== "win32") {
  fs.chmodSync(dataDirectory, 0o700);
}

const database = new DatabaseSync(databasePath, { timeout: 5000 });
database.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = FULL;
  PRAGMA foreign_keys = ON;
  PRAGMA secure_delete = ON;
  PRAGMA busy_timeout = 5000;
  PRAGMA trusted_schema = OFF;
`);

function createAppointmentsTable() {
  database.exec(`
    CREATE TABLE appointments (
      id INTEGER PRIMARY KEY,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(date, time)
    ) STRICT
  `);
}

function initializeAppointmentsTable() {
  const table = database.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'appointments'"
  ).get();

  if (!table) {
    createAppointmentsTable();
  } else {
    const columns = database.prepare("PRAGMA table_info(appointments)").all();
    const hasPersonalData = columns.some(({ name }) =>
      ["name", "phone", "pet_name", "notes"].includes(name)
    );

    if (hasPersonalData) {
      database.exec("BEGIN IMMEDIATE");
      try {
        database.exec("ALTER TABLE appointments RENAME TO appointments_legacy");
        createAppointmentsTable();
        database.exec(`
          INSERT INTO appointments (date, time, created_at)
          SELECT date, time, created_at FROM appointments_legacy
        `);
        database.exec("DROP TABLE appointments_legacy");
        database.exec("COMMIT");
        database.exec("PRAGMA wal_checkpoint(TRUNCATE)");
        database.exec("VACUUM");
      } catch (error) {
        if (database.isTransaction) database.exec("ROLLBACK");
        throw error;
      }
    }
  }
}

initializeAppointmentsTable();
if (process.platform !== "win32") {
  fs.chmodSync(databasePath, 0o600);
}

module.exports = database;
