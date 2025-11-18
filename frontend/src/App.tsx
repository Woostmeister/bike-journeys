import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { RideForm } from "./components/RideForm";
import { RideList } from "./components/RideList";

function App() {
  return (
    <Router>
      <nav style={{ padding: "1rem", background: "#222" }}>
        <Link to="/" style={{ marginRight: "1rem", color: "white" }}>
          Add Ride
        </Link>
        <Link to="/rides" style={{ color: "white" }}>
          View Rides
        </Link>
      </nav>

      {/* CONTAINER STARTS HERE */}
      <div className="container" style={{ padding: "1rem", maxWidth: "600px", margin: "0 auto" }}>
        <Routes>
          <Route path="/" element={<RideForm />} />
          <Route path="/rides" element={<RideList />} />
        </Routes>
      </div>
      {/* CONTAINER ENDS HERE */}

    </Router>
  );
}

export default App;



