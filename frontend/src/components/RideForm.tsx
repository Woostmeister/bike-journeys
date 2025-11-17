import { useState } from "react";

export function RideForm() {
    const [date, setDate] = useState("");
    const [distanceKm, setDistanceKm] = useState("");
    const [notes, setNotes] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        alert(`Pretend we saved:\n${date} - ${distanceKm} km - ${notes}`);
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Add manual ride</h2>

            <div>
                <label>Date</label>
                <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                />
            </div>

            <div>
                <label>Distance (km)</label>
                <input
                    type="number"
                    step="0.1"
                    value={distanceKm}
                    onChange={e => setDistanceKm(e.target.value)}
                />
            </div>

            <div>
                <label>Notes</label>
                <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                />
            </div>

            <button type="submit">Save ride</button>
        </form>
    );
}
