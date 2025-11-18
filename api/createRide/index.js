const db = require("../shared/db");

module.exports = async function (context, req) {
    const { date, distance, notes } = req.body || {};

    // Validation
    if (!date) {
        context.res = {
            status: 400,
            body: { success: false, error: "Date is required." }
        };
        return;
    }

    if (distance !== null && distance !== undefined && isNaN(Number(distance))) {
        context.res = {
            status: 400,
            body: { success: false, error: "Distance must be a valid number." }
        };
        return;
    }

    context.log("Creating ride:", date, distance, notes);

    // Insert into SQLite DB
    return new Promise((resolve) => {
        db.run(
            "INSERT INTO rides (date, distance_miles, notes) VALUES (?, ?, ?)",
            [date, distance, notes],
            function (err) {
                if (err) {
                    context.log("Database error:", err);
                    context.res = {
                        status: 500,
                        body: { success: false, error: "Failed to save ride" }
                    };
                } else {
                    context.res = {
                        status: 200,
                        body: { success: true, id: this.lastID }
                    };
                }
                resolve();
            }
        );
    });
};
