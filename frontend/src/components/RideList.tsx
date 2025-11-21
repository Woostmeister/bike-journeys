import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../AuthContext";

interface Ride {
    id: number;
    date: string;
    distance_miles: number;
    notes: string | null;
}

export function RideList() {
    const { user } = useAuth();
    const [rides, setRides] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return; // ProtectedRoute SHOULD prevent this anyway

        async function loadRides() {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from("rides")
                .select("*")
                .eq("user_id", user.id)
                .order("date", { ascending: false });

            if (error) {
                setError(error.message);
            } else {
                setRides(data || []);
            }

            setLoading(false);
        }

        loadRides();
    }, [user]);

    if (loading) return <p>Loading rides…</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div>
            <h2 style={{ marginBottom: "1rem" }}>Your Rides</h2>

            {rides.length === 0 && <p>No rides yet. Add one!</p>}

            {rides.map((ride) => (
                <div
                    key={ride.id}
                    style={{
                        background: "#fff",
                        color: "#000",
                        padding: "1rem",
                        marginBottom: "1rem",
                        borderRadius: "8px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    }}
                >
                    <h3 style={{ margin: 0 }}>{ride.date}</h3>
                    <p style={{ margin: "0.5rem 0" }}>
                        <strong>{ride.distance_miles} miles</strong>
                    </p>
                    {ride.notes && <p style={{ opacity: 0.8 }}>{ride.notes}</p>}
                </div>
            ))}
        </div>
    );
}



