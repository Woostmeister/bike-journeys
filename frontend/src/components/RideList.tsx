import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient.ts"; 

type Ride = {
    id: string;
    date: string;
    distance_miles: number | null;
    notes: string | null;
};

export function RideList() {
    const [rides, setRides] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchRides() {
            const { data, error } = await supabase
                .from("rides")
                .select("*")
                .order("date", { ascending: false });

            if (error) {
                console.error("Error loading rides:", error);
                setError("Could not load rides.");
            } else {
                setRides(data || []);
            }

            setLoading(false);
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
                            <strong>Distance:</strong>{" "}
                            {ride.distance_miles !== null
                                ? `${ride.distance_miles} miles`
                                : "Not recorded"}
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


