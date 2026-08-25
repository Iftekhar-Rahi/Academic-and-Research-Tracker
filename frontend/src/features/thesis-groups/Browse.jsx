import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authFetch } from "./api";
import "./ThesisGroups.css";

function Browse() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [typeFilter, setTypeFilter] = useState(null); // null | "group" | "individual"
  const [tagFilter, setTagFilter] = useState(null);

  // reloads whenever a filter changes, so the query hits the server instead of filtering client-side
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (typeFilter) params.set("type", typeFilter);
        if (tagFilter) params.set("researchArea", tagFilter);

        const [postsRes, tagsRes] = await Promise.all([
          authFetch(`/api/thesis-groups?${params.toString()}`),
          authFetch("/api/thesis-groups/tags"),
        ]);

        // token missing or expired - send the user back to the login page
        if (postsRes.status === 401 || tagsRes.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        if (!postsRes.ok || !tagsRes.ok) {
          setError("Could not load posts. Please try again later.");
          setLoading(false);
          return;
        }

        const postsData = await postsRes.json();
        const tagsData = await tagsRes.json();

        setPosts(postsData.posts);
        setTags(tagsData.tags);
      } catch {
        setError("Could not load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [navigate, typeFilter, tagFilter]);

  return (
    <div className="thesis-groups-page">
      <div className="navbar">
        <h2>Thesis Group Finder</h2>
        <div className="navbar-right">
          <Link to="/thesis-groups/mine" className="back-link">My Posts</Link>
          <Link to="/thesis-groups/new" className="back-link">+ New Post</Link>
          <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
        </div>
      </div>

      <div className="thesis-groups-content">
        <p className="form-intro">
          Browse open posts from students looking for groupmates or a group to join, or post your own.
        </p>

        <div className="type-toggle">
          <button
            className={`type-chip ${typeFilter === null ? "active" : ""}`}
            onClick={() => setTypeFilter(null)}
          >
            All
          </button>
          <button
            className={`type-chip ${typeFilter === "group" ? "active" : ""}`}
            onClick={() => setTypeFilter("group")}
          >
            Groups looking for members
          </button>
          <button
            className={`type-chip ${typeFilter === "individual" ? "active" : ""}`}
            onClick={() => setTypeFilter("individual")}
          >
            Students looking for a group
          </button>
        </div>

        <div className="tag-chips">
          <button
            className={`tag-chip ${tagFilter === null ? "active" : ""}`}
            onClick={() => setTagFilter(null)}
          >
            All areas
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              className={`tag-chip ${tagFilter === tag ? "active" : ""}`}
              onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        {loading && <p className="status-text">Loading posts...</p>}
        {error && <p className="status-text error">{error}</p>}

        {!loading && !error && posts.length === 0 && (
          <p className="status-text">No open posts match your filters.</p>
        )}

        <div className="post-grid">
          {posts.map((post) => (
            <div className="post-card" key={post._id}>
              <span className={`type-badge ${post.type}`}>
                {post.type === "group" ? "Group looking for members" : "Looking for a group"}
              </span>

              {post.type === "group" ? (
                <>
                  <h3 className="post-title">{post.topic}</h3>
                  {post.proposedSupervisor && (
                    <p className="post-subtext">Proposed supervisor: {post.proposedSupervisor}</p>
                  )}
                  <p className="post-subtext">
                    {post.currentMembers} current member{post.currentMembers === 1 ? "" : "s"}, looking
                    for {post.membersNeeded} more
                  </p>
                  {post.skillsNeeded && (
                    <p className="post-subtext">Skills needed: {post.skillsNeeded}</p>
                  )}
                </>
              ) : (
                post.skills && <p className="post-subtext">Skills: {post.skills}</p>
              )}

              {post.researchAreas?.length > 0 && (
                <div className="post-tags">
                  {post.researchAreas.map((tag) => (
                    <span key={tag} className="tag-pill">{tag}</span>
                  ))}
                </div>
              )}

              {post.description && <p className="post-description">{post.description}</p>}

              <div className="post-footer">
                <span>{post.postedBy?.name}</span>
                {post.postedBy?.email && (
                  <a href={`mailto:${post.postedBy.email}`} className="post-email">
                    {post.postedBy.email}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Browse;
