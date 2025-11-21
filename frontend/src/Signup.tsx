import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        const { error } = await supabase.auth.signUp({
            email,
            password
        });

        setLoading(false);

        if (error) {
            setError(error.message);
        } else {
            setMessage("Account created successfully! Redirecting...");
            setTimeout(() => navigate("/"), 2000);
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
                    <h2 style={{ marginBottom: "0.5rem" }}>Create Account</h2>
                    <p style={{ color: "var(--text-muted)" }}>
                        Start tracking your bike journeys today
                    </p>
                </div>

                <form onSubmit={handleSignup}>
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
                                placeholder="At least 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <div className="input-with-icon">
                            <span className="input-icon">🔒</span>
                            <input
                                id="confirmPassword"
                                type="password"
                                placeholder="Re-enter your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ width: "100%", padding: "1rem", fontSize: "1.1rem" }}
                    >
                        {loading ? "Creating account... ⏳" : "Sign Up 🚀"}
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

                <div style={{ 
                    textAlign: "center", 
                    marginTop: "1.5rem",
                    paddingTop: "1.5rem",
                    borderTop: "1px solid var(--border)"
                }}>
                    <p style={{ color: "var(--text-muted)" }}>
                        Already have an account?{" "}
                        <Link 
                            to="/login" 
                            style={{ 
                                color: "var(--accent-primary)", 
                                fontWeight: 600 
                            }}
                        >
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}