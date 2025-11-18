const db = require("../shared/db");

module.exports = async function (context, req) {
    context.log("Fetching all rides...");

    return new Promise((resolve) => {
        db.all("SELECT * FROM rides ORDER BY date DESC", (err, rows) => {
            if (err) {
                context.log("Database fetch error:", err);
                context.res = {
                    status: 500,
                    body: { success: false, error: "Failed to fetch rides" }
                };
            } else {
                context.res = {
                    status: 200,
                    body: rows
                };
            }
            resolve();
        });
    });
};
