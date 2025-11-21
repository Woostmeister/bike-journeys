import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../AuthContext";

// Weather code map
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

interface MonthGroup {
    year: number;
    month: number; // 0–11
    label: string; // e.g. "November 2025"
    rides: Ride[];
}

export function RideList() {
    const { user } = useAuth();

    const [rides, setRides] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Which month groups are open (key: "YYYY-MM")
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    // 🔥 Load rides on mount
    useEffect(() => {
        if (!user) return;

        async function load() {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from("rides")
                .select("*")
                .eq("user_id", user.id)
                .order("date", { ascending: false });

            if (error) setError(error.message);
            else setRides(data || []);

            setLoading(false);
        }

        load();
    }, [user]);

    // 🔥 Group rides by year + month, newest first
    const monthGroups: MonthGroup[] = useMemo(() => {
        const map = new Map<string, MonthGroup>();

        for (const ride of rides) {
            const dateObj = new Date(ride.date);
            if (Number.isNaN(dateObj.getTime())) continue;

            const year = dateObj.getFullYear();
            const month = dateObj.getMonth(); // 0–11
            const key = `${year}-${String(month + 1).padStart(2, "0")}`;

            let group = map.get(key);
            if (!group) {
                const label = dateObj.toLocaleString("en-GB", {
                    month: "long",
                    year: "numeric"
                });

                group = { year, month, label, rides: [] };
                map.set(key, group);
            }

            group.rides.push(ride);
        }

        return Array.from(map.values()).sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
        });
    }, [rides]);

    const toggleGroup = (key: string) => {
        setOpenGroups(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    if (loading) return <p>Loading rides…</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div>
            <h2 style={{ marginBottom: "1rem" }}>Your Rides</h2>

            {monthGroups.length === 0 && (
                <p>No rides yet. Add one!</p>
            )}

            {monthGroups.map(group => {
                const key = `${group.year}-${String(group.month + 1).padStart(2, "0")}`;
                const isOpen = !!openGroups[key];

                return (
                    <div
                        key={key}
                        style={{
                            marginBottom: "1.25rem",
                            borderRadius: "10px",
                            overflow: "hidden",
                            border: "1px solid #e5e7eb",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                            background: "#f9fafb"
                        }}
                    >
                        {/* Collapsible header */}
                        <button
                            type="button"
                            onClick={() => toggleGroup(key)}
                            style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "0.75rem 1rem",
                                background: "#111827",
                                color: "#f9fafb",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "1rem",
                                fontWeight: 600
                            }}
                        >
                            <span>{group.label}</span>
                            <span
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "1.75rem",
                                    height: "1.75rem",
                                    borderRadius: "999px",
                                    background: isOpen ? "#f9fafb" : "#4b5563",
                                    color: isOpen ? "#111827" : "#f9fafb",
                                    fontSize: "1.1rem",
                                    fontWeight: 700,
                                    transition: "all 0.15s ease-in-out"
                                }}
                            >
                                {isOpen ? "–" : "+"}
                            </span>
                        </button>

                        {/* Collapsible content */}
                        {isOpen && (
                            <div style={{ padding: "0.75rem 1rem 0.9rem" }}>
                                {group.rides.map(ride => {
                                    const weather =
                                        ride.weather_code !== null
                                            ? weatherCodeMap[ride.weather_code] ?? null
                                            : null;

                                    const formattedDate = new Date(ride.date).toLocaleDateString(
                                        "en-GB",
                                        {
                                            weekday: "short",
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric"
                                        }
                                    );

                                    return (
                                        <div
                                            key={ride.id}
                                            style={{
                                                background: "#ffffff",
                                                padding: "0.9rem 1rem",
                                                marginBottom: "0.75rem",
                                                borderRadius: "8px",
                                                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                                                color: "#000",
                                                border: "1px solid #e5e7eb"
                                            }}
                                        >
                                            <h4
                                                style={{
                                                    margin: 0,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "0.35rem",
                                                    fontSize: "0.98rem"
                                                }}
                                            >
                                                <span role="img" aria-label="motorbike">
                                                    🏍️
                                                </span>
                                                <span>{formattedDate}</span>
                                            </h4>

                                            <p style={{ margin: "0.35rem 0" }}>
                                                <strong>{ride.distance_miles} miles</strong>
                                            </p>

                                            {ride.location_name && (
                                                <p style={{ margin: "0.2rem 0" }}>
                                                    <span role="img" aria-label="location">
                                                        📍
                                                    </span>{" "}
                                                    {ride.location_name}
                                                </p>
                                            )}

                                            {weather && (
                                                <p style={{ margin: "0.2rem 0" }}>
                                                    {weather.icon} {weather.desc}
                                                    {ride.temperature !== null && (
                                                        <> – {ride.temperature.toFixed(1)}°C</>
                                                    )}
                                                </p>
                                            )}

                                            {ride.notes && (
                                                <p
                                                    style={{
                                                        marginTop: "0.45rem",
                                                        opacity: 0.85,
                                                        fontSize: "0.95rem"
                                                    }}
                                                >
                                                    {ride.notes}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}




