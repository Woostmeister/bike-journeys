import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../AuthContext";

// ------------------------------
// Weather Codes
// ------------------------------
const weatherCodeMap: Record<number, { desc: string; icon: string }> = {
    0: { desc: "Clear sky", icon: "☀️" },
    1: { desc: "Mainly clear", icon: "🌤️" },
    2: { desc: "Partly cloudy", icon: "⛅" },
    3: { desc: "Overcast", icon: "☁️" },
    45: { desc: "Fog", icon: "🌫️" },
    48: { desc: "Rime fog", icon: "🌫️" },
    51: { desc: "Light drizzle", icon: "🌦️" },
    53: { desc: "Drizzle", icon: "🌦️" },
    55: { desc: "Dense drizzle", icon: "🌧️" },
    61: { desc: "Light rain", icon: "🌧️" },
    63: { desc: "Rain", icon: "🌧️" },
    65: { desc: "Heavy rain", icon: "🌧️" },
    71: { desc: "Light snow", icon: "🌨️" },
    73: { desc: "Snow", icon: "❄️" },
    75: { desc: "Heavy snow", icon: "❄️" },
    95: { desc: "Thunderstorm", icon: "⛈️" }
};

interface Ride {
    id: number;
    date: string;
    distance_miles: number;
    notes: string | null;
    location_name: string | null;
    weather_code: number | null;
    temperature: number | null;
}

export function RideList() {
    const { user } = useAuth();
    const [rides, setRides] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        async function loadRides() {
            const { data, error } = await supabase
                .from("rides")
                .select("*")
                .eq("user_id", user.id)
                .order("date", { ascending: false });

            if (error) setError(error.message);
            else setRides(data || []);

            setLoading(false);
        }

        loadRides();
    }, [user]);

    if (loading) return <p>Loading rides…</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    // ------------------------------
    // Format Dates
    // ------------------------------
    function formatDay(dateStr: string) {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short"
        });
    }

    function groupByMonth(rides: Ride[]) {
        const groups: Record<string, Ride[]> = {};

        rides.forEach((ride) => {
            const d = new Date(ride.date);
            const key = d.toLocaleDateString("en-GB", {
                month: "long",
                year: "numeric"
            });

            if (!groups[key]) groups[key] = [];
            groups[key].push(ride);
        });

        return groups;
    }

    const grouped = groupByMonth(rides);

    return (
        <div style={{ maxWidth: "700px", margin: "2rem auto" }}>
            <h2 style={{ marginBottom: "1.5rem" }}>Your Rides</h2>

            {Object.keys(grouped).map((month) => (
                <div key={month} style={{ marginBottom: "2rem" }}>
                    {/* Month Header */}
                    <h3
                        style={{
                            margin: "1rem 0",
                            fontSize: "1.4rem",
                            color: "#d1d5db"
                        }}
                    >
                        {month}
                    </h3>

                    {grouped[month].map((ride) => {
                        const weather =
                            ride.weather_code !== null
                                ? weatherCodeMap[ride.weather_code]
                                : null;

                        return (
                            <div
                                key={ride.id}
                                style={{
                                    background: "#fff",
                                    padding: "1.25rem",
                                    marginBottom: "1rem",
                                    borderRadius: "10px",
                                    boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
                                    color: "#000"
                                }}
                            >
                                {/* DATE */}
                                <h4
                                    style={{
                                        margin: 0,
                                        fontSize: "1.1rem"
                                    }}
                                >
                                    {formatDay(ride.date)}
                                </h4>

                                {/* DISTANCE */}
                                <p style={{ margin: "0.35rem 0" }}>
                                    🏍️ <strong>{ride.distance_miles} miles</strong>
                                </p>

                                {/* LOCATION */}
                                {ride.location_name && (
                                    <p style={{ margin: "0.35rem 0" }}>
                                        📍 {ride.location_name}
                                    </p>
                                )}

                                {/* WEATHER */}
                                {weather && (
                                    <p style={{ margin: "0.35rem 0" }}>
                                        {weather.icon} {weather.desc}
                                        {ride.temperature !== null && (
                                            <> — <strong>{ride.temperature}°C</strong></>
                                        )}
                                    </p>
                                )}

                                {/* NOTES */}
                                {ride.notes && (
                                    <p
                                        style={{
                                            marginTop: "0.4rem",
                                            opacity: 0.9,
                                            borderTop: "1px solid #ddd",
                                            paddingTop: "0.5rem"
                                        }}
                                    >
                                        {ride.notes}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
