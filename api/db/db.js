const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "db", "rides.db");
const initSqlPath = path.join(__dirname, "db", "init.sql");

function getDb() {
    const db = new sqlite3.Database(dbPath);

    // Initialise schema on first use
    const initSql = fs.readFileSync(initSqlPath, "utf8");
    db.exec(initSql);

    return db;
}

module.exports = { getDb };

