import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { RideForm } from "./components/RideForm";
import { RideList } from "./components/RideList";
import { ManageBuddies } from "./components/ManageBuddies";
import { Dashboard } from "./components/Dashboard";
import Signup from "./Signup";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabaseClient";
import "./App.css";

function Navigation() {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="nav-container">
      <div className="nav-content">
        <div className="nav-brand">
          <span className="nav-brand-icon">🏍️</span>
          <span>Bike Journeys</span>
        </div>

        {user && (
          <div className="nav-links">
            <Link 
              to="/" 
              className={`nav-link ${isActive("/") ? "active" : ""}`}
            >
              📊 Dashboard
            </Link>
            <Link 
              to="/add" 
              className={`nav-link ${isActive("/add") ? "active" : ""}`}
            >
              ✏️ Add Ride
            </Link>
            <Link
              to="/rides"
              className={`nav-link ${isActive("/rides") ? "active" : ""}`}
            >
              📖 All Rides
            </Link>
            <Link
              to="/buddies"
              className={`nav-link ${isActive("/buddies") ? "active" : ""}`}
            >
              🤝 Buddies
            </Link>
          </div>
        )}

        <div className="nav-actions">
          {!user ? (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/signup" className="nav-link">
                Signup
              </Link>
            </>
          ) : (
            <>
              <div className="nav-user">
                👤 {user.email}
              </div>
              <button
                onClick={() => supabase.auth.signOut()}
                className="logout-btn"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add"
              element={
                <ProtectedRoute>
                  <RideForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rides"
              element={
                <ProtectedRoute>
                  <RideList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buddies"
              element={
                <ProtectedRoute>
                  <ManageBuddies />
                </ProtectedRoute>
              }
            />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;