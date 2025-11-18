const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Path to the SQLite DB file inside the API folder
// Azure Functions run from "/home/site/wwwroot"
// so relative paths are safe
const dbPath = process.env.SQLITE_DB_PATH || "/tmp/rides.db";

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS rides (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            distance_miles REAL,
            notes TEXT
        )
    `);
});

module.exports = db;
