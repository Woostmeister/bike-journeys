import { useState } from "react";
import { supabase } from "../../lib/supabaseClient.ts";  // <-- make sure this path matches your project

export function RideForm() {
    const [date, setDate] = useState("");
    const [distanceMiles, setDistanceMiles] = useState("");
    const [notes, setNotes] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<"success" | "error" | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        // basic validation
        if (!date || !distanceMiles) {
            setMessage("Please enter a date and distance.");
            setMessageType("error");
            return;
        }

        // Build the record exactly to match your Supabase table
        const payload = {
            date,
            distance_miles: parseFloat(distanceMiles),
            notes: notes || null
        };

        console.log("Saving to Supabase:", payload);

        const { error } = await supabase
            .from("rides")
            .insert([payload]);

        if (error) {
            console.error("Supabase insert error:", error);
            setMessage("Error saving ride. Please try again.");
            setMessageType("error");
            return;
        }

        // success!
        setMessage("Ride saved successfully!");
        setMessageType("success");

        setDate("");
        setDistanceMiles("");
        setNotes("");
    }

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "10px",
        marginTop: "4px",
        borderRadius: "6px",
        border: "1px solid #555",
        background: "#1a1a1a",
        color: "#fff",
        fontSize: "14px"
    };

    const labelStyle: React.CSSProperties = {
        display: "block",
        marginBottom: "4px",
        fontWeight: 500
    };

    const buttonStyle: React.CSSProperties = {
        marginTop: "16px",
        padding: "10px 18px",
        background: "#4caf50",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: 600
    };

    return (
        <form onSubmit={handleSubmit}>
            <div
                style={{
                    background: "#2f2f2f",
                    padding: "28px",
                    borderRadius: "12px",
                    marginTop: "30px",
                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.25)"
                }}
            >
                <h2 style={{ marginBottom: "16px" }}>Add manual ride</h2>

                <div style={{ marginTop: "12px" }}>
                    <label style={labelStyle}>Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        style={inputStyle}
                    />
                </div>

                <div style={{ marginTop: "16px" }}>
                    <label style={labelStyle}>Distance (miles)</label>
                    <input
                        type="number"
                        step="0.1"
                        value={distanceMiles}
                        onChange={e => setDistanceMiles(e.target.value)}
                        style={inputStyle}
                    />
                </div>

                <div style={{ marginTop: "16px" }}>
                    <label style={labelStyle}>Notes</label>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        style={{ ...inputStyle, height: "80px" }}
                    />
                </div>

                <button
                    type="submit"
                    style={buttonStyle}
                    onMouseEnter={e => (e.currentTarget.style.background = "#45a049")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#4caf50")}
                >
                    Save ride
                </button>

                {message && (
                    <div
                        style={{
                            marginTop: "20px",
                            padding: "12px",
                            borderRadius: "6px",
                            backgroundColor: messageType === "success" ? "#d4edda" : "#f8d7da",
                            color: messageType === "success" ? "#155724" : "#721c24",
                            border: messageType === "success"
                                ? "1px solid #c3e6cb"
                                : "1px solid #f5c6cb"
                        }}
                    >
                        {message}
                    </div>
                )}
            </div>
        </form>
    );
}


