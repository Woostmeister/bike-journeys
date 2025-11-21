import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        setLoading(false);

        if (error) {
            setError(error.message);
        } else {
            navigate("/");
        }
    }

    return (
        <div className="animate-in" style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            minHeight: "calc(100vh - 8rem)"
        }}>
            <div className="card" style={{ maxWidth: "450px", width: "100%" }}>
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🏍️</div>
                    <h2 style={{ marginBottom: "0.5rem" }}>Welcome Back</h2>
                    <p style={{ color: "var(--text-muted)" }}>
                        Log in to your account to continue
                    </p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <div className="input-with-icon">
                            <span className="input-icon">📧</span>
                            <input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-with-icon">
                            <span className="input-icon">🔒</span>
                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ width: "100%", padding: "1rem", fontSize: "1.1rem" }}
                    >
                        {loading ? "Logging in... ⏳" : "Login 🚀"}
                    </button>
                </form>

                {error && (
                    <div className="alert alert-error">
                        <span>❌</span>
                        {error}
                    </div>
                )}

                <div style={{ 
                    textAlign: "center", 
                    marginTop: "1.5rem",
                    paddingTop: "1.5rem",
                    borderTop: "1px solid var(--border)"
                }}>
                    <p style={{ color: "var(--text-muted)" }}>
                        Don't have an account?{" "}
                        <Link 
                            to="/signup" 
                            style={{ 
                                color: "var(--accent-primary)", 
                                fontWeight: 600 
                            }}
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}