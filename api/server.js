const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const allowedOrigins = [
    "http://localhost:5173",   // Your React frontend during development
    "https://your-azure-site-name.azurestaticapps.net" // Placeholder for later
];

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow tools like Postman (no origin)
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            } else {
                console.warn("Blocked CORS request from:", origin);
                return callback(new Error("Not allowed by CORS"));
            }
        }
    })
);

app.use(express.json());

// ---------------------
// SQLite Setup
// ---------------------
const dbPath = path.join(__dirname, "rides.db");
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

// ---------------------
// POST: Create Ride
// ---------------------
app.post("/api/createRide", (req, res) => {
    const { date, distance, notes } = req.body;

    // ---------------------
    // Validation checks
    // ---------------------
    if (!date) {
        console.warn("Validation failed: Missing date");
        return res.status(400).json({
            success: false,
            error: "Date is required."
        });
    }

    // Distance can be null, but if provided it must be a valid number
    if (distance !== null && distance !== undefined && isNaN(Number(distance))) {
        console.warn("Validation failed: Invalid distance value");
        return res.status(400).json({
            success: false,
            error: "Distance must be a valid number."
        });
    }


    console.log("Incoming ride:", { date, distance, notes });

    db.run(
        "INSERT INTO rides (date, distance_miles, notes) VALUES (?, ?, ?)",
        [date, distance, notes],
        function (err) {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ success: false, error: "Failed to save ride" });
            }

            console.log("Saved ride to database:", date, distance, notes);

            res.json({ success: true, id: this.lastID });
        }
    );
});

// ---------------------
// GET: List All Rides
// ---------------------
app.get("/api/rides", (req, res) => {
    db.all("SELECT * FROM rides ORDER BY date DESC", (err, rows) => {
        if (err) {
            console.error("Database fetch error:", err);
            return res.status(500).json({ success: false });
        }

        console.log("Fetched all rides:", rows.length);

        res.json(rows);
    });
});

// ---------------------
// Start Server
// ---------------------
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}`);
});


