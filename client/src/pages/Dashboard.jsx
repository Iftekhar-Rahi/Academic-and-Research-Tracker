import { useNavigate, Link } from "react-router-dom";
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

        {/* Thesis Supervisors feature - code lives in server/features/thesis-supervisors and client/src/features/thesis-supervisors */}
        <div className="feature-card">
          <h3>Thesis Supervisor Finder</h3>
          <p>Browse BRAC University CSE faculty who supervise thesis or Open research projects.</p>
          <Link to="/faculty" className="feature-link">Browse Supervisors →</Link>
        </div>

        {/* Thesis Group Finder feature - code lives in server/features/thesis-groups and client/src/features/thesis-groups */}
        <div className="feature-card">
          <h3>Thesis Group Finder</h3>
          <p>Find groupmates for your thesis, or a group looking for someone with your skills.</p>
          <Link to="/thesis-groups" className="feature-link">Browse Board →</Link>
        </div>

        {/* My beloved teammembers please add your own feature below this */}
        <div className="placeholder-box">
          Add your feature here!
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
