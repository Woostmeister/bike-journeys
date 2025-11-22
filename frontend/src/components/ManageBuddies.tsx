import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../AuthContext";

interface Buddy {
    id: string;
    name: string;
    notes: string | null;
    created_at: string;
}

export function ManageBuddies() {
    const { user } = useAuth();

    const [buddies, setBuddies] = useState<Buddy[]>([]);
    const [name, setName] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const userId = user?.id;
        if (!userId) return;

        async function loadBuddies() {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from("buddies")
                .select("*")
                .eq("user_id", userId)
                .order("name", { ascending: true });

            if (error) setError(error.message);
            else setBuddies(data || []);

            setLoading(false);
        }

        loadBuddies();
    }, [user]);

    async function addBuddy(e: React.FormEvent) {
        e.preventDefault();
        if (!user) return;

        setError(null);
        setSuccess(null);

        if (!name.trim()) {
            setError("Please enter a buddy name.");
            return;
        }

        const { data, error } = await supabase
            .from("buddies")
            .insert([{ user_id: user.id, name: name.trim(), notes: notes.trim() || null }])
            .select()
            .single();

        if (error) {
            setError(error.message);
            return;
        }

        setBuddies(prev => [...prev, data]);
        setName("");
        setNotes("");
        setSuccess(`Added ${data.name} to your buddies.`);
    }

    async function deleteBuddy(id: string) {
        setError(null);
        setSuccess(null);

        const { error } = await supabase.from("buddies").delete().eq("id", id);

        if (error) {
            setError(error.message);
            return;
        }

        setBuddies(prev => prev.filter(b => b.id !== id));
        setSuccess("Buddy removed.");
    }

    return (
        <div className="animate-in">
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ marginBottom: "0.5rem" }}>🤝 Manage Buddies</h1>
                <p style={{ color: "var(--text-muted)" }}>
                    Keep track of friends you ride with and link them to your journeys
                </p>
            </div>

            <div className="card" style={{ maxWidth: "700px", margin: "0 auto 2rem" }}>
                <form onSubmit={addBuddy}>
                    <div className="form-group">
                        <label htmlFor="buddy-name">Buddy name</label>
                        <input
                            id="buddy-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Alex Rider"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="buddy-notes">Notes (optional)</label>
                        <textarea
                            id="buddy-notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Bike model, favorite routes, etc."
                            rows={3}
                        />
                    </div>

                    <button type="submit" style={{ width: "100%", padding: "0.9rem", fontSize: "1rem" }}>
                        ➕ Add Buddy
                    </button>
                </form>

                {error && (
                    <div className="alert alert-error" style={{ marginTop: "1rem" }}>
                        <span>❌</span>
                        {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success" style={{ marginTop: "1rem" }}>
                        <span>✅</span>
                        {success}
                    </div>
                )}
            </div>

            <div className="card" style={{ maxWidth: "900px", margin: "0 auto" }}>
                <div className="card-header" style={{ marginBottom: "1rem" }}>
                    <h3 className="card-title">
                        <span>📋</span>
                        Your Buddies
                    </h3>
                </div>

                {loading ? (
                    <div className="loading-container" style={{ padding: "1rem 0" }}>
                        <div className="spinner"></div>
                        <p style={{ color: "var(--text-muted)" }}>Loading buddies...</p>
                    </div>
                ) : buddies.length === 0 ? (
                    <p style={{ color: "var(--text-muted)", textAlign: "center" }}>
                        No buddies yet. Add your riding partners above.
                    </p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {buddies
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(buddy => (
                                <div
                                    key={buddy.id}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        background: "var(--bg-secondary)",
                                        padding: "1rem",
                                        borderRadius: "10px",
                                        border: "1px solid var(--border)",
                                        gap: "1rem"
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 700, marginBottom: "0.35rem" }}>
                                            🤝 {buddy.name}
                                        </div>
                                        {buddy.notes && (
                                            <div style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                                                {buddy.notes}
                                            </div>
                                        )}
                                        <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.35rem" }}>
                                            Added {new Date(buddy.created_at).toLocaleDateString("en-GB")}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="logout-btn"
                                        style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)" }}
                                        onClick={() => deleteBuddy(buddy.id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}
