import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { RideForm } from "./components/RideForm";
import { RideList } from "./components/RideList";

import Signup from "./Signup";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabaseClient";


function App() {
  const { user } = useAuth();

  return (
    <Router>
      <nav style={{ padding: "1rem", background: "#222" }}>
        <Link to="/" style={{ marginRight: "1rem", color: "white" }}>
          Add Ride
        </Link>
        <Link to="/rides" style={{ marginRight: "1rem", color: "white" }}>
          View Rides
        </Link>

        {!user && (
          <>
            <Link to="/login" style={{ marginRight: "1rem", color: "white" }}>
              Login
            </Link>
            <Link to="/signup" style={{ color: "white" }}>
              Signup
            </Link>
          </>
        )}

        {user && (
          <button
            onClick={() => supabase.auth.signOut()}
            style={{
              marginLeft: "1rem",
              background: "transparent",
              border: "1px solid white",
              color: "white",
              padding: "0.25rem 0.5rem",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        )}
      </nav>

      <div className="container" style={{ padding: "1rem", maxWidth: "600px", margin: "0 auto" }}>
        <Routes>
          {/* Protected routes */}
          <Route
            path="/"
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

          {/* Public routes */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;




