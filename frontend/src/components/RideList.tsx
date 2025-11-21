import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../AuthContext";

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
    month: number;
    label: string;
    rides: Ride[];
    totalDistance: number;
}

export function RideList() {
    const { user } = useAuth();

    const [rides, setRides] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
    const [searchQuery, setSearchQuery] = useState("");

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

    const filteredRides = useMemo(() => {
        if (!searchQuery.trim()) return rides;
        
        const query = searchQuery.toLowerCase();
        return rides.filter(ride => 
            ride.location_name?.toLowerCase().includes(query) ||
            ride.notes?.toLowerCase().includes(query) ||
            new Date(ride.date).toLocaleDateString("en-GB").includes(query)
        );
    }, [rides, searchQuery]);

    const monthGroups: MonthGroup[] = useMemo(() => {
        const map = new Map<string, MonthGroup>();

        for (const ride of filteredRides) {
            const dateObj = new Date(ride.date);
            if (Number.isNaN(dateObj.getTime())) continue;

            const year = dateObj.getFullYear();
            const month = dateObj.getMonth();
            const key = `${year}-${String(month + 1).padStart(2, "0")}`;

            let group = map.get(key);
            if (!group) {
                const label = dateObj.toLocaleString("en-GB", {
                    month: "long",
                    year: "numeric"
                });

                group = { year, month, label, rides: [], totalDistance: 0 };
                map.set(key, group);
            }

            group.rides.push(ride);
            group.totalDistance += ride.distance_miles;
        }

        return Array.from(map.values()).sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
        });
    }, [filteredRides]);

    const toggleGroup = (key: string) => {
        setOpenGroups(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p style={{ color: "var(--text-muted)" }}>Loading rides...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error">
                <span>❌</span>
                {error}
            </div>
        );
    }

    return (
        <div className="animate-in">
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ marginBottom: "0.5rem" }}>📖 Your Rides</h1>
                <p style={{ color: "var(--text-muted)" }}>Browse and search your riding history</p>
            </div>

            {rides.length > 0 && (
                <div className="card" style={{ marginBottom: "2rem" }}>
                    <div className="input-with-icon">
                        <span className="input-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search by location, notes, or date..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            )}

            {monthGroups.length === 0 && (
                <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                    <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔍</div>
                    <h3>{rides.length === 0 ? "No rides yet!" : "No matching rides"}</h3>
                    <p style={{ marginTop: "0.5rem", color: "var(--text-muted)" }}>
                        {rides.length === 0 
                            ? "Add your first ride to start tracking" 
                            : "Try a different search term"}
                    </p>
                </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {monthGroups.map(group => {
                    const key = `${group.year}-${String(group.month + 1).padStart(2, "0")}`;
                    const isOpen = !!openGroups[key];

                    return (
                        <div key={key} className="card" style={{ padding: 0, overflow: "hidden" }}>
                            <button
                                type="button"
                                onClick={() => toggleGroup(key)}
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "1.5rem 2rem",
                                    background: "linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)",
                                    border: "none",
                                    cursor: "pointer",
                                    textAlign: "left",
                                    transition: "all 0.2s ease"
                                }}
                            >
                                <div>
                                    <div style={{ 
                                        fontSize: "1.5rem", 
                                        fontWeight: 700, 
                                        marginBottom: "0.25rem",
                                        color: "var(--text-primary)"
                                    }}>
                                        {group.label}
                                    </div>
                                    <div style={{ 
                                        fontSize: "0.875rem", 
                                        color: "var(--text-muted)",
                                        display: "flex",
                                        gap: "1.5rem"
                                    }}>
                                        <span>🏍️ {group.rides.length} rides</span>
                                        <span>🛣️ {group.totalDistance.toFixed(1)} miles</span>
                                    </div>
                                </div>
                                <div
                                    style={{
                                        width: "2.5rem",
                                        height: "2.5rem",
                                        borderRadius: "50%",
                                        background: isOpen ? "var(--accent-primary)" : "var(--bg-primary)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "1.5rem",
                                        fontWeight: 700,
                                        transition: "all 0.3s ease",
                                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)"
                                    }}
                                >
                                    {isOpen ? "−" : "+"}
                                </div>
                            </button>

                            {isOpen && (
                                <div style={{ padding: "0 2rem 2rem" }}>
                                    {group.rides.map(ride => {
                                        const weather = ride.weather_code !== null
                                            ? weatherCodeMap[ride.weather_code] ?? null
                                            : null;

                                        const formattedDate = new Date(ride.date).toLocaleDateString(
                                            "en-GB",
                                            {
                                                weekday: "long",
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric"
                                            }
                                        );

                                        return (
                                            <div
                                                key={ride.id}
                                                style={{
                                                    background: "var(--bg-secondary)",
                                                    padding: "1.5rem",
                                                    marginTop: "1rem",
                                                    borderRadius: "12px",
                                                    border: "1px solid var(--border)",
                                                    transition: "all 0.2s ease"
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = "translateX(8px)";
                                                    e.currentTarget.style.borderColor = "var(--accent-primary)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = "translateX(0)";
                                                    e.currentTarget.style.borderColor = "var(--border)";
                                                }}
                                            >
                                                <div style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "flex-start",
                                                    marginBottom: "1rem"
                                                }}>
                                                    <div>
                                                        <h4 style={{
                                                            margin: 0,
                                                            fontSize: "1.1rem",
                                                            color: "var(--text-primary)",
                                                            marginBottom: "0.5rem"
                                                        }}>
                                                            🏍️ {formattedDate}
                                                        </h4>
                                                        {ride.location_name && (
                                                            <div style={{
                                                                color: "var(--text-secondary)",
                                                                fontSize: "0.95rem",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "0.5rem"
                                                            }}>
                                                                <span>📍</span>
                                                                <span>{ride.location_name}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div
                                                        style={{
                                                            background: "var(--accent-primary)",
                                                            color: "white",
                                                            padding: "0.5rem 1rem",
                                                            borderRadius: "8px",
                                                            fontWeight: 700,
                                                            fontSize: "1.1rem"
                                                        }}
                                                    >
                                                        {ride.distance_miles} mi
                                                    </div>
                                                </div>

                                                {weather && (
                                                    <div style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "0.5rem",
                                                        padding: "0.75rem",
                                                        background: "var(--bg-tertiary)",
                                                        borderRadius: "8px",
                                                        marginBottom: ride.notes ? "1rem" : 0,
                                                        fontSize: "0.95rem"
                                                    }}>
                                                        <span style={{ fontSize: "1.5rem" }}>{weather.icon}</span>
                                                        <span style={{ color: "var(--text-secondary)" }}>
                                                            {weather.desc}
                                                            {ride.temperature !== null && (
                                                                <> · {ride.temperature.toFixed(1)}°C</>
                                                            )}
                                                        </span>
                                                    </div>
                                                )}

                                                {ride.notes && (
                                                    <div style={{
                                                        padding: "0.75rem",
                                                        background: "var(--bg-tertiary)",
                                                        borderRadius: "8px",
                                                        color: "var(--text-secondary)",
                                                        fontStyle: "italic",
                                                        fontSize: "0.95rem",
                                                        lineHeight: 1.6
                                                    }}>
                                                        💭 {ride.notes}
                                                    </div>
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
        </div>
    );
}