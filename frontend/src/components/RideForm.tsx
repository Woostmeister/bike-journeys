import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../AuthContext";

export function RideForm() {
    const { user } = useAuth();

    const [date, setDate] = useState("");
    const [distance, setDistance] = useState("");
    const [notes, setNotes] = useState("");

    const [locationQuery, setLocationQuery] = useState("");
    const [locationResults, setLocationResults] = useState<any[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<any | null>(null);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // ----------------------------------------------------------------
    // SEARCH LOCATIONS (Open-Meteo Geocoding API)
    // ----------------------------------------------------------------
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

            const json = await response.json();

            if (!json.results) {
                setLocationResults([]);
                return;
            }

            const mapped = json.results.map((loc: any) => ({
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

    // ----------------------------------------------------------------
    // SUBMIT RIDE + GET WEATHER
    // ----------------------------------------------------------------
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

        const { lat, lon } = selectedLocation;

        let weather_code = null;
        let temperature = null;

        try {
            const weatherResponse = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=weathercode,temperature_2m&start_date=${date}&end_date=${date}`
            );

            const weatherData = await weatherResponse.json();

            if (weatherData.hourly?.weathercode?.length > 0) {
                weather_code = weatherData.hourly.weathercode[0];
                temperature = weatherData.hourly.temperature_2m[0];
            }
        } catch {
            console.warn("Weather fetch failed");
        }

        const { error } = await supabase.from("rides").insert([
            {
                user_id: user.id,
                date,
                distance_miles: Number(distance),
                notes,
                location_name: selectedLocation.display,
                latitude: Number(lat),
                longitude: Number(lon),
                weather_code,
                temperature
            }
        ]);

        setLoading(false);

        if (error) {
            setError(error.message);
        } else {
            setMessage("Ride saved!");

            // Reset form
            setDate("");
            setDistance("");
            setNotes("");
            setLocationQuery("");
            setLocationResults([]);
            setSelectedLocation(null);
        }
    }

    // ----------------------------------------------------------------
    // UI
    // ----------------------------------------------------------------
    return (
        <div style={{ maxWidth: "500px", margin: "2rem auto", color: "#fff" }}>
            <h2>Add Ride</h2>

            <form onSubmit={handleSubmit}>
                {/* DATE */}
                <div style={{ marginBottom: "1rem" }}>
                    <label>Date:</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        style={{ width: "100%", padding: "0.5rem" }}
                    />
                </div>

                {/* DISTANCE */}
                <div style={{ marginBottom: "1rem" }}>
                    <label>Distance (miles):</label>
                    <input
                        type="number"
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                        required
                        style={{ width: "100%", padding: "0.5rem" }}
                    />
                </div>

                {/* LOCATION SEARCH */}
                <div style={{ marginBottom: "1rem" }}>
                    <label>Location:</label>
                    <input
                        type="text"
                        value={locationQuery}
                        onChange={(e) => searchLocations(e.target.value)}
                        placeholder="Start typing a location…"
                        style={{ width: "100%", padding: "0.5rem" }}
                        required
                    />

                    {/* DROPDOWN */}
                    {locationResults.length > 0 && (
                        <div
                            style={{
                                background: "#fff",
                                color: "#000",
                                marginTop: "0.5rem",
                                borderRadius: "4px",
                                padding: "0.5rem"
                            }}
                        >
                            {locationResults.map((loc) => (
                                <div
                                    key={loc.id}
                                    style={{ padding: "0.5rem", cursor: "pointer" }}
                                    onClick={() => {
                                        setSelectedLocation(loc);
                                        setLocationQuery(loc.display);
                                        setLocationResults([]);
                                    }}
                                >
                                    📍 {loc.display}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* NOTES */}
                <div style={{ marginBottom: "1rem" }}>
                    <label>Notes:</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        style={{ width: "100%", padding: "0.5rem" }}
                    />
                </div>

                {/* SUBMIT BUTTON */}
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: "0.75rem",
                        background: "#6366f1",
                        color: "#fff",
                        borderRadius: "4px",
                        cursor: "pointer",
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? "Saving…" : "Save Ride"}
                </button>
            </form>

            {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
            {message && <p style={{ color: "lightgreen", marginTop: "1rem" }}>{message}</p>}
        </div>
    );
}
