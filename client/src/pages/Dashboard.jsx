import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  // get the logged in user's info that we saved during login
  const user = JSON.parse(localStorage.getItem("user"));

  function handleLogout() {
    // remove the saved login info so the user is logged out
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <div className="dashboard-page">
      <div className="navbar">
        <h2>Academic and Research Tracker</h2>
        <div className="navbar-right">
          <span>Hi, {user?.name}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="dashboard-content">
        <h1>Dashboard</h1>
        <p>
          Welcome to the Academic and Research Tracker, built for BRAC University students to
          manage courses, track research progress, and stay on top of deadlines. This dashboard
          is the shared starting point for the project.
        </p>

        {/* My beloved teammembers please add your own feature below this */}
        <div className="placeholder-box">
          Add your feature here!
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
