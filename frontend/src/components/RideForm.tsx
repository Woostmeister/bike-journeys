import { useAuth } from "../../src/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import { useState } from "react";  // <-- make sure this path matches your project

export function RideForm() {
    const { user } = useAuth();

    const [date, setDate] = useState("");
    const [distance, setDistance] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!user) {
            setError("You must be logged in.");
            return;
        }

        setLoading(true);
        setError(null);
        setMessage(null);

        const { error } = await supabase.from("rides").insert({
            user_id: user.id,
            date,
            distance_miles: Number(distance),
            notes,
        });

        setLoading(false);

        if (error) {
            setError(error.message);
            return;
        }

        setMessage("Ride added!");
        setDate("");
        setDistance("");
        setNotes("");
    }

    return (
        <div>
            <h2 style={{ marginBottom: "1rem" }}>Add Ride</h2>

            <form onSubmit={handleSubmit}>
                {/* DATE */}
                <div style={{ marginBottom: "1rem" }}>
                    <label>Date:</label>
                    <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        style={{ width: "100%", padding: "0.5rem" }}
                    />
                </div>

                {/* DISTANCE */}
                <div style={{ marginBottom: "1rem" }}>
                    <label>Distance (miles):</label>
                    <input
                        type="number"
                        min="0"
                        required
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                        style={{ width: "100%", padding: "0.5rem" }}
                    />
                </div>

                {/* NOTES */}
                <div style={{ marginBottom: "1rem" }}>
                    <label>Notes (optional):</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        style={{ width: "100%", padding: "0.5rem" }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: "0.75rem",
                        background: "#2563eb",
                        color: "white",
                        borderRadius: "4px",
                        cursor: "pointer",
                        opacity: loading ? 0.7 : 1,
                    }}
                >
                    {loading ? "Saving..." : "Add Ride"}
                </button>
            </form>

            {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
            {message && <p style={{ color: "green", marginTop: "1rem" }}>{message}</p>}
        </div>
    );
}
