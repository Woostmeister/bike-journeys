import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });


        setLoading(false);

        if (error) {
            setError(error.message);
            return;
        }

        // Supabase sends an email confirmation link by default
        setMessage("Signup successful! Check your email to confirm your account.");
    }

    return (
        <div style={{ maxWidth: "400px", margin: "2rem auto" }}>
            <h2 style={{ marginBottom: "1rem" }}>Create an Account</h2>

            <form onSubmit={handleSignup}>
                <div style={{ marginBottom: "1rem" }}>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: "100%", padding: "0.5rem" }}
                    />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: "100%", padding: "0.5rem" }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: "0.75rem",
                        background: "#2563eb",
                        color: "white",
                        borderRadius: "4px",
                        cursor: "pointer",
                        opacity: loading ? 0.7 : 1,
                    }}
                >
                    {loading ? "Signing up..." : "Sign Up"}
                </button>
            </form>

            {error && (
                <p style={{ color: "red", marginTop: "1rem" }}>
                    {error}
                </p>
            )}

            {message && (
                <p style={{ color: "green", marginTop: "1rem" }}>
                    {message}
                </p>
            )}
        </div>
    );
}
