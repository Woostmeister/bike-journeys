import { useEffect, useState } from "react";

type Ride = {
    id: number;
    date: string;
    distance_miles: number;
    notes: string | null;
};

export function RideList() {
    const [rides, setRides] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchRides() {
            try {
                const res = await fetch("http://localhost:4000/api/rides");
                if (!res.ok) throw new Error("Failed to fetch rides");

                const data = await res.json();
                setRides(data);
            } catch (err) {
                setError("Could not load rides.");
            } finally {
                setLoading(false);
            }
        }

        fetchRides();
    }, []);

    if (loading) return <p>Loading rides...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div
            style={{
                background: "#2f2f2f",
                padding: "28px",
                borderRadius: "12px",
                marginTop: "30px",
                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.25)"
            }}
        >
            <h2>Your Rides</h2>

            {rides.length === 0 && <p>No rides saved yet.</p>}

            <ul style={{ listStyle: "none", padding: 0, marginTop: "20px" }}>
                {rides.map(ride => (
                    <li
                        key={ride.id}
                        style={{
                            background: "#3a3a3a",
                            padding: "16px",
                            borderRadius: "8px",
                            marginBottom: "12px"
                        }}
                    >
                        <div>
                            <strong>Date:</strong> {ride.date}
                        </div>
                        <div style={{ marginTop: "6px" }}>
                            <strong>Distance:</strong> {ride.distance_miles} miles
                        </div>
                        {ride.notes && (
                            <div style={{ marginTop: "6px" }}>
                                <strong>Notes:</strong> {ride.notes}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

