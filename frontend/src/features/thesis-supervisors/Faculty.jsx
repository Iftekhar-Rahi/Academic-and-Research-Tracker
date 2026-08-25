import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authFetch } from "./api";
import "./Faculty.css";

const POLL_MS = 2000; // how often we ask the server how the update is going

function Faculty() {
  const navigate = useNavigate();

  const [facultyList, setFacultyList] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);

  // everything about the "Update data" button: what the server says the scrape is doing, plus any
  // problem we hit just trying to start one
  const [scrapeStatus, setScrapeStatus] = useState(null);
  const [scrapeError, setScrapeError] = useState("");
  const scraping = !!scrapeStatus?.running;

  // fetches the faculty list and the tag counts. also called again after an update finishes,
  // so the new data shows up without the user having to reload the page
  const loadData = useCallback(async () => {
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
      setError("");
    } catch {
      setError("Could not load faculty data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // runs once when the page first loads
  useEffect(() => {
    loadData();
  }, [loadData]);

  // if an update was already running when we opened the page (say we reloaded halfway through, or
  // someone else started one), pick up where it is instead of showing nothing
  useEffect(() => {
    authFetch("/api/faculty/scrape/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.status?.running) setScrapeStatus(data.status);
      })
      .catch(() => {}); // not important enough to show an error for
  }, []);

  // while an update is running, keep asking the server how far along it is
  useEffect(() => {
    if (!scraping) return;

    const timer = setInterval(async () => {
      try {
        const res = await authFetch("/api/faculty/scrape/status");
        if (!res.ok) return;

        const { status } = await res.json();
        setScrapeStatus(status);

        // just finished - pull the freshly scraped faculty in
        if (!status.running) loadData();
      } catch {
        // a single failed check doesn't matter, the next one in two seconds will try again
      }
    }, POLL_MS);

    return () => clearInterval(timer); // stop asking once the update is done or we leave the page
  }, [scraping, loadData]);

  // runs when the "Update data" button is pressed
  async function startScrape() {
    setScrapeError("");

    try {
      const res = await authFetch("/api/faculty/scrape", { method: "POST" });

      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      const data = await res.json();

      // 409 means one was already running - that's not really an error, just follow that one
      if (!res.ok && res.status !== 409) {
        setScrapeError(data.message || "Could not start the update. Please try again.");
        return;
      }

      setScrapeStatus(data.status);
    } catch {
      setScrapeError("Could not start the update. Please try again.");
    }
  }

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
        <div className="navbar-actions">
          <button className="scrape-button" onClick={startScrape} disabled={scraping}>
            {scraping ? "Updating..." : "Update data"}
          </button>
          <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
        </div>
      </div>

      <div className="faculty-content">
        <p className="faculty-intro">
          Browse BRAC University CSE faculty who supervise theses, grouped and searchable by research interest.
        </p>

        {/* the "Update data" button re-scrapes BRACU's website - this box shows how it's going */}
        {scraping && (
          <div className="scrape-box">
            <p className="scrape-text">
              {scrapeStatus.total
                ? `Reading faculty profiles... ${scrapeStatus.done} of ${scrapeStatus.total}`
                : "Reading the faculty list from BRACU's website..."}
              {scrapeStatus.current && ` — ${scrapeStatus.current}`}
            </p>
            <div className="scrape-bar">
              <div
                className="scrape-bar-fill"
                style={{
                  width: scrapeStatus.total
                    ? `${Math.round((scrapeStatus.done / scrapeStatus.total) * 100)}%`
                    : "5%",
                }}
              />
            </div>
            <p className="scrape-hint">This takes a couple of minutes. You can keep browsing while it runs.</p>
          </div>
        )}

        {!scraping && scrapeStatus?.summary && (
          <div className="scrape-box done">
            <p className="scrape-text">
              Updated {scrapeStatus.summary.upserted} faculty
              {scrapeStatus.summary.skippedAlumni > 0 && `, skipped ${scrapeStatus.summary.skippedAlumni} alumni`}
              {scrapeStatus.summary.errors > 0 && `, ${scrapeStatus.summary.errors} profile(s) failed to load`}.
            </p>
          </div>
        )}

        {!scraping && scrapeStatus?.error && (
          <div className="scrape-box failed">
            <p className="scrape-text">Update failed: {scrapeStatus.error}</p>
          </div>
        )}

        {scrapeError && (
          <div className="scrape-box failed">
            <p className="scrape-text">{scrapeError}</p>
          </div>
        )}

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

        {/* nothing in the database at all - point the user at the button rather than making it
            look like their search was the problem */}
        {!loading && !error && !scraping && facultyList.length === 0 && (
          <p className="status-text">
            No faculty data yet. Press <strong>Update data</strong> above to fetch it from BRACU's website.
          </p>
        )}

        {!loading && !error && facultyList.length > 0 && filteredFaculty.length === 0 && (
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
