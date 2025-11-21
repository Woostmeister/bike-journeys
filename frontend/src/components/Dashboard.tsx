import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../AuthContext";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Ride {
    id: number;
    date: string;
    distance_miles: number;
    notes: string | null;
    location_name: string | null;
    weather_code: number | null;
    temperature: number | null;
}

interface MonthlyData {
    month: string;
    distance: number;
    rides: number;
}

export function Dashboard() {
    const { user } = useAuth();
    const [rides, setRides] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        async function loadRides() {
            setLoading(true);
            const { data } = await supabase
                .from("rides")
                .select("*")
                .eq("user_id", user.id)
                .order("date", { ascending: true });

            setRides(data || []);
            setLoading(false);
        }

        loadRides();
    }, [user]);

    const stats = useMemo(() => {
        const totalDistance = rides.reduce((sum, ride) => sum + ride.distance_miles, 0);
        const totalRides = rides.length;
        const avgDistance = totalRides > 0 ? totalDistance / totalRides : 0;

        // Find longest ride
        const longestRide = rides.reduce(
            (max, ride) => (ride.distance_miles > max ? ride.distance_miles : max),
            0
        );

        // Calculate rides this month
        const now = new Date();
        const thisMonth = rides.filter(ride => {
            const rideDate = new Date(ride.date);
            return (
                rideDate.getMonth() === now.getMonth() &&
                rideDate.getFullYear() === now.getFullYear()
            );
        }).length;

        return {
            totalDistance: totalDistance.toFixed(1),
            totalRides,
            avgDistance: avgDistance.toFixed(1),
            longestRide: longestRide.toFixed(1),
            thisMonth
        };
    }, [rides]);

    const monthlyData = useMemo(() => {
        const dataMap = new Map<string, { distance: number; rides: number }>();

        rides.forEach(ride => {
            const date = new Date(ride.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            const monthLabel = date.toLocaleDateString("en-GB", {
                month: "short",
                year: "numeric"
            });

            if (!dataMap.has(key)) {
                dataMap.set(key, { distance: 0, rides: 0 });
            }

            const current = dataMap.get(key)!;
            current.distance += ride.distance_miles;
            current.rides += 1;
        });

        return Array.from(dataMap.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .slice(-12)
            .map(([key, data]) => {
                const [year, month] = key.split("-");
                const date = new Date(parseInt(year), parseInt(month) - 1);
                return {
                    month: date.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
                    distance: Math.round(data.distance),
                    rides: data.rides
                };
            });
    }, [rides]);

    const recentRides = useMemo(() => rides.slice(-5).reverse(), [rides]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p style={{ color: "var(--text-muted)" }}>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="animate-in">
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ marginBottom: "0.5rem" }}>🏍️ Dashboard</h1>
                <p style={{ color: "var(--text-muted)" }}>Your riding stats and insights</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-icon">🛣️</span>
                    <div className="stat-value">{stats.totalDistance}</div>
                    <div className="stat-label">Total Miles</div>
                </div>

                <div className="stat-card">
                    <span className="stat-icon">🏁</span>
                    <div className="stat-value">{stats.totalRides}</div>
                    <div className="stat-label">Total Rides</div>
                </div>

                <div className="stat-card">
                    <span className="stat-icon">📊</span>
                    <div className="stat-value">{stats.avgDistance}</div>
                    <div className="stat-label">Avg Miles/Ride</div>
                </div>

                <div className="stat-card">
                    <span className="stat-icon">🚀</span>
                    <div className="stat-value">{stats.longestRide}</div>
                    <div className="stat-label">Longest Ride</div>
                </div>

                <div className="stat-card">
                    <span className="stat-icon">📅</span>
                    <div className="stat-value">{stats.thisMonth}</div>
                    <div className="stat-label">Rides This Month</div>
                </div>
            </div>

            {/* Charts */}
            {monthlyData.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem", marginBottom: "2rem" }}>
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <span>📈</span>
                                Monthly Distance
                            </h3>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                                <XAxis dataKey="month" stroke="var(--text-muted)" />
                                <YAxis stroke="var(--text-muted)" />
                                <Tooltip
                                    contentStyle={{
                                        background: "var(--bg-secondary)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "8px",
                                        color: "var(--text-primary)"
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="distance"
                                    stroke="var(--accent-primary)"
                                    strokeWidth={3}
                                    dot={{ fill: "var(--accent-primary)", r: 5 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <span>📊</span>
                                Rides per Month
                            </h3>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                                <XAxis dataKey="month" stroke="var(--text-muted)" />
                                <YAxis stroke="var(--text-muted)" />
                                <Tooltip
                                    contentStyle={{
                                        background: "var(--bg-secondary)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "8px",
                                        color: "var(--text-primary)"
                                    }}
                                />
                                <Bar dataKey="rides" fill="var(--accent-primary)" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Recent Rides */}
            {recentRides.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <span>🕐</span>
                            Recent Rides
                        </h3>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {recentRides.map(ride => (
                            <div
                                key={ride.id}
                                style={{
                                    padding: "1rem",
                                    background: "var(--bg-secondary)",
                                    borderRadius: "12px",
                                    border: "1px solid var(--border)",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                                        {new Date(ride.date).toLocaleDateString("en-GB", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric"
                                        })}
                                    </div>
                                    {ride.location_name && (
                                        <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                                            📍 {ride.location_name}
                                        </div>
                                    )}
                                </div>
                                <div
                                    style={{
                                        fontSize: "1.25rem",
                                        fontWeight: 700,
                                        color: "var(--accent-light)"
                                    }}
                                >
                                    {ride.distance_miles} mi
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {rides.length === 0 && (
                <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                    <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🏍️</div>
                    <h3>No rides yet!</h3>
                    <p style={{ marginTop: "0.5rem", color: "var(--text-muted)" }}>
                        Add your first ride to start tracking your journeys
                    </p>
                </div>
            )}
        </div>
    );
}