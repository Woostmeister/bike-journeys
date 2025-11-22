import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../AuthContext";
import type { WeatherResponse } from "../types/WeatherTypes";

interface Buddy {
    id: string;
    name: string;
}

interface LocationResult {
    id: number;
    display: string;
    lat: number;
    lon: number;
}

interface GeoApiResult {
    id: number;
    name: string;
    admin1?: string;
    country: string;
    latitude: number;
    longitude: number;
}

interface GeoSearchResponse {
    results?: GeoApiResult[];
}

export function RideForm() {
    const { user } = useAuth();

    const [date, setDate] = useState("");
    const [distance, setDistance] = useState("");
    const [notes, setNotes] = useState("");

    const [locationQuery, setLocationQuery] = useState("");
    const [locationResults, setLocationResults] = useState<LocationResult[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);

    const [buddies, setBuddies] = useState<Buddy[]>([]);
    const [selectedBuddyId, setSelectedBuddyId] = useState<string>("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const userId = user?.id;
        if (!userId) return;

        async function loadBuddies() {
            const { data, error } = await supabase
                .from("buddies")
                .select("id, name")
                .eq("user_id", userId)
                .order("name", { ascending: true });

            if (!error && data) setBuddies(data);
        }

        loadBuddies();
    }, [user]);

    async function searchLocations(query: string) {
        setLocationQuery(query);

        if (!query.trim()) {
            setLocationResults([]);
            return;
        }

        try {
            const response = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
                    query
                )}&count=5&language=en&format=json`
            );

            const json: GeoSearchResponse = await response.json();

            if (!json.results) {
                setLocationResults([]);
                return;
            }

            const mapped = json.results.map((loc) => ({
                id: loc.id,
                display: `${loc.name}${loc.admin1 ? ", " + loc.admin1 : ""}, ${loc.country}`,
                lat: loc.latitude,
                lon: loc.longitude
            }));

            setLocationResults(mapped);
        } catch (err) {
            console.error(err);
            setLocationResults([]);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        if (!selectedLocation) {
            setError("Please select a location from the list.");
            setLoading(false);
            return;
        }

        if (!user) {
            setError("You need to be signed in to save a ride.");
            setLoading(false);
            return;
        }

        const { lat, lon } = selectedLocation;
        const cleanedNotes = notes.trim();

        let weather_code = null;
        let temperature = null;

        const rideDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const useArchiveApi = rideDate < today;

        const params = new URLSearchParams({
            latitude: String(lat),
            longitude: String(lon),
            hourly: "weathercode,temperature_2m",
            start_date: date,
            end_date: date
        });

        try {
            const baseUrl = useArchiveApi
                ? "https://archive-api.open-meteo.com/v1/archive"
                : "https://api.open-meteo.com/v1/forecast";

            const weatherResponse = await fetch(`${baseUrl}?${params.toString()}`);

            const weatherData: WeatherResponse = await weatherResponse.json();

            const weatherCodeSample = weatherData.hourly?.weathercode?.[0];
            const temperatureSample = weatherData.hourly?.temperature_2m?.[0];

            if (typeof weatherCodeSample === "number") {
                weather_code = weatherCodeSample;
            }

            if (typeof temperatureSample === "number") {
                temperature = temperatureSample;
            }
        } catch {
            console.warn("Weather fetch failed");
        }

        const { error } = await supabase.from("rides").insert([
            {
                user_id: user.id,
                date,
                distance_miles: Number(distance),
                notes: cleanedNotes || null,
                location_name: selectedLocation.display,
                latitude: Number(lat),
                longitude: Number(lon),
                weather_code,
                temperature,
                buddy_id: selectedBuddyId || null
            }
        ]);

        setLoading(false);

        if (error) {
            setError(error.message);
        } else {
            setMessage("Ride saved successfully! 🎉");

            setDate("");
            setDistance("");
            setNotes("");
            setLocationQuery("");
            setLocationResults([]);
            setSelectedLocation(null);
            setSelectedBuddyId("");
        }
    }

    return (
        <div className="animate-in">
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ marginBottom: "0.5rem" }}>✏️ Add Ride</h1>
                <p style={{ color: "var(--text-muted)" }}>Record your latest journey</p>
            </div>

            <div className="card" style={{ maxWidth: "700px", margin: "0 auto" }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="date">Date</label>
                            <input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="distance">Distance (miles)</label>
                            <div className="input-with-icon">
                                <span className="input-icon">🛣️</span>
                                <input
                                    id="distance"
                                    type="number"
                                    step="0.1"
                                    value={distance}
                                    onChange={(e) => setDistance(e.target.value)}
                                    required
                                    placeholder="0.0"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="location">Location</label>
                        <div style={{ position: "relative" }}>
                            <div className="input-with-icon">
                                <span className="input-icon">📍</span>
                                <input
                                    id="location"
                                    type="text"
                                    value={locationQuery}
                                    onChange={(e) => searchLocations(e.target.value)}
                                    placeholder="Start typing a location..."
                                    required
                                />
                            </div>

                            {locationResults.length > 0 && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "100%",
                                        left: 0,
                                        right: 0,
                                        background: "var(--bg-secondary)",
                                        border: "2px solid var(--border)",
                                        borderRadius: "12px",
                                        marginTop: "0.5rem",
                                        overflow: "hidden",
                                        zIndex: 10,
                                        boxShadow: "0 10px 40px var(--shadow)"
                                    }}
                                >
                                    {locationResults.map((loc) => (
                                        <div
                                            key={loc.id}
                                            style={{
                                                padding: "1rem",
                                                cursor: "pointer",
                                                transition: "all 0.2s ease",
                                                borderBottom: "1px solid var(--border)",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "0.75rem"
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = "var(--bg-tertiary)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = "transparent";
                                            }}
                                            onClick={() => {
                                                setSelectedLocation(loc);
                                                setLocationQuery(loc.display);
                                                setLocationResults([]);
                                            }}
                                        >
                                            <span style={{ fontSize: "1.25rem" }}>📍</span>
                                            <span>{loc.display}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="buddy">Buddy (optional)</label>
                        <select
                            id="buddy"
                            value={selectedBuddyId}
                            onChange={(e) => setSelectedBuddyId(e.target.value)}
                        >
                            <option value="">Solo ride</option>
                            {buddies.map(buddy => (
                                <option key={buddy.id} value={buddy.id}>
                                    {buddy.name}
                                </option>
                            ))}
                        </select>
                        <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
                            Manage buddies from the Buddies page.
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="notes">Notes (optional)</label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any memorable moments or observations..."
                            rows={4}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "1rem",
                            fontSize: "1.1rem"
                        }}
                    >
                        {loading ? "Saving... ⏳" : "Save Ride 🏍️"}
                    </button>
                </form>

                {error && (
                    <div className="alert alert-error">
                        <span>❌</span>
                        {error}
                    </div>
                )}

                {message && (
                    <div className="alert alert-success">
                        <span>✅</span>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}