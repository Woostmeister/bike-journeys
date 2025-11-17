const express = require("express");
const bodyParser = require("body-parser");
const { getDb } = require("./db/db");

const app = express();
const port = 4000;

app.use(bodyParser.json());

app.post("/api/createRide", async (req, res) => {
    try {
        const body = req.body || {};
        const {
            date,
            startTime = null,
            endTime = null,
            sourceType = "Manual",
            bikeId = null,
            distanceKm = null,
            notes = ""
        } = body;

        if (!date) {
            return res.status(400).json({ error: "date is required" });
        }

        const db = getDb();

        await new Promise((resolve, reject) => {
            const sql = `
        INSERT INTO rides (
          date, start_time, end_time, source_type, bike_id,
          distance_km, notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
            const params = [
                date,
                startTime,
                endTime,
                sourceType,
                bikeId,
                distanceKm,
                notes
            ];

            db.run(sql, params, function (err) {
                if (err) return reject(err);
                resolve(this.lastID);
            });
        });

        db.close();
        res.status(201).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create ride" });
    }
});

app.listen(port, () => {
    console.log(`API server listening on http://localhost:${port}`);
});
