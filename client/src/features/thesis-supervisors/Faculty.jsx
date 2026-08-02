import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authFetch } from "./api";
import "./Faculty.css";

function Faculty() {
  const navigate = useNavigate();

  const [facultyList, setFacultyList] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);

  // runs once when the page first loads, to fetch the faculty list and the tag counts
  useEffect(() => {
    async function loadData() {
      try {
        const [facultyRes, tagsRes] = await Promise.all([
          authFetch("/api/faculty"),
          authFetch("/api/faculty/tags"),
        ]);

        // token missing or expired - send the user back to the login page
        if (facultyRes.status === 401 || tagsRes.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        if (!facultyRes.ok || !tagsRes.ok) {
          setError("Could not load faculty data. Please try again later.");
          setLoading(false);
          return;
        }

        const facultyData = await facultyRes.json();
        const tagsData = await tagsRes.json();

        setFacultyList(facultyData.faculty);
        setTags(tagsData.tags);
      } catch {
        setError("Could not load faculty data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [navigate]);

  // only show faculty that match the selected tag chip and whatever's typed in the search box.
  // this runs on the list we already fetched, so filtering/searching feels instant
  const filteredFaculty = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return facultyList.filter((f) => {
      if (selectedTag && !f.tags.includes(selectedTag)) return false;

      if (term) {
        const haystack = `${f.name} ${f.shortTag || ""} ${f.position} ${f.researchInterestText}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }

      return true;
    });
  }, [facultyList, searchTerm, selectedTag]);

  return (
    <div className="faculty-page">
      <div className="navbar">
        <h2>Thesis Supervisors</h2>
        <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
      </div>

      <div className="faculty-content">
        <p className="faculty-intro">
          Browse BRAC University CSE faculty who supervise theses, grouped and searchable by research interest.
        </p>

        <input
          type="text"
          className="search-input"
          placeholder="Search by name, position, or research interest..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="tag-chips">
          <button
            className={`tag-chip ${selectedTag === null ? "active" : ""}`}
            onClick={() => setSelectedTag(null)}
          >
            All
          </button>
          {tags.map((t) => (
            <button
              key={t.name}
              className={`tag-chip ${selectedTag === t.name ? "active" : ""}`}
              onClick={() => setSelectedTag(selectedTag === t.name ? null : t.name)}
            >
              {t.name} ({t.count})
            </button>
          ))}
        </div>

        {loading && <p className="status-text">Loading faculty...</p>}
        {error && <p className="status-text error">{error}</p>}

        {!loading && !error && filteredFaculty.length === 0 && (
          <p className="status-text">No faculty match your search.</p>
        )}

        <div className="faculty-grid">
          {filteredFaculty.map((f) => (
            <div className="faculty-card" key={f.facId}>
              {f.photoUrl && (
                <img
                  src={f.photoUrl}
                  alt={f.name}
                  className="faculty-photo"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              )}

              <h3 className="faculty-name">
                {f.name}{f.shortTag && ` (${f.shortTag})`}
              </h3>
              <p className="faculty-position">{f.position}</p>

              {f.email && (
                <a href={`mailto:${f.email}`} className="faculty-email">{f.email}</a>
              )}

              <div className="faculty-status">
                <span className={`status-dot ${f.accepting ? "accepting" : "not-accepting"}`} />
                <span>{f.accepting ? "Accepting" : "Not Accepting"}</span>
              </div>

              <div className="faculty-levels">
                {f.supervisesUndergrad && <span className="level-badge">Undergrad</span>}
                {f.supervisesGrad && <span className="level-badge">Postgrad</span>}
              </div>

              {f.roles?.length > 0 && (
                <div className="faculty-roles">
                  {f.roles.map((role) => (
                    <span key={role} className="role-badge">{role}</span>
                  ))}
                </div>
              )}

              {f.tags.length > 0 && (
                <div className="faculty-tags">
                  {f.tags.map((tag) => (
                    <span key={tag} className="tag-pill">{tag}</span>
                  ))}
                </div>
              )}

              {f.researchInterestText && (
                <div className="faculty-interest">
                  <p className="interest-text">{f.researchInterestText}</p>
                </div>
              )}

              <a href={f.profileUrl} target="_blank" rel="noreferrer" className="profile-link">
                Full profile ↗
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Faculty;
