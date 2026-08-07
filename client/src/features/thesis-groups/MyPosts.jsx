import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authFetch } from "./api";
import "./ThesisGroups.css";

function MyPosts() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/thesis-groups/mine");

      // token missing or expired - send the user back to the login page
      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!res.ok) {
        setError("Could not load your posts. Please try again later.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setPosts(data.posts);
    } catch {
      setError("Could not load your posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  function startEditing(post) {
    setEditingId(post._id);
    setEditForm({
      description: post.description || "",
      topic: post.topic || "",
      proposedSupervisor: post.proposedSupervisor || "",
      currentMembers: post.currentMembers ?? "",
      membersNeeded: post.membersNeeded ?? "",
      skillsNeeded: post.skillsNeeded || "",
      skills: post.skills || "",
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveEdit(post) {
    const body =
      post.type === "group"
        ? {
            topic: editForm.topic,
            proposedSupervisor: editForm.proposedSupervisor,
            currentMembers: editForm.currentMembers === "" ? undefined : Number(editForm.currentMembers),
            membersNeeded: editForm.membersNeeded === "" ? undefined : Number(editForm.membersNeeded),
            skillsNeeded: editForm.skillsNeeded,
            description: editForm.description,
          }
        : { skills: editForm.skills, description: editForm.description };

    const res = await authFetch(`/api/thesis-groups/${post._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      cancelEditing();
      loadPosts();
    } else {
      setError("Could not save changes. Please try again later.");
    }
  }

  async function toggleStatus(post) {
    const newStatus = post.status === "open" ? "closed" : "open";
    const res = await authFetch(`/api/thesis-groups/${post._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      loadPosts();
    } else {
      setError("Could not update status. Please try again later.");
    }
  }

  async function deletePost(post) {
    if (!window.confirm("Delete this post? This can't be undone.")) return;

    const res = await authFetch(`/api/thesis-groups/${post._id}`, { method: "DELETE" });

    if (res.ok) {
      loadPosts();
    } else {
      setError("Could not delete post. Please try again later.");
    }
  }

  return (
    <div className="thesis-groups-page">
      <div className="navbar">
        <h2>My Posts</h2>
        <div className="navbar-right">
          <Link to="/thesis-groups/new" className="back-link">+ New Post</Link>
          <Link to="/thesis-groups" className="back-link">← Back to Board</Link>
        </div>
      </div>

      <div className="thesis-groups-content">
        {loading && <p className="status-text">Loading your posts...</p>}
        {error && <p className="status-text error">{error}</p>}

        {!loading && !error && posts.length === 0 && (
          <p className="status-text">
            You haven't posted anything yet. <Link to="/thesis-groups/new">Create a post</Link>.
          </p>
        )}

        <div className="post-grid">
          {posts.map((post) => (
            <div className="post-card" key={post._id}>
              <span className={`type-badge ${post.type}`}>
                {post.type === "group" ? "Group looking for members" : "Looking for a group"}
              </span>
              <span className={`status-chip ${post.status}`}>{post.status}</span>

              {editingId === post._id ? (
                <div className="edit-form">
                  {post.type === "group" ? (
                    <>
                      <label>
                        Topic
                        <input
                          type="text"
                          value={editForm.topic}
                          onChange={(e) => setEditForm((f) => ({ ...f, topic: e.target.value }))}
                        />
                      </label>
                      <label>
                        Proposed supervisor
                        <input
                          type="text"
                          value={editForm.proposedSupervisor}
                          onChange={(e) => setEditForm((f) => ({ ...f, proposedSupervisor: e.target.value }))}
                        />
                      </label>
                      <div className="form-row">
                        <label>
                          Current members
                          <input
                            type="number"
                            min="0"
                            value={editForm.currentMembers}
                            onChange={(e) => setEditForm((f) => ({ ...f, currentMembers: e.target.value }))}
                          />
                        </label>
                        <label>
                          Members needed
                          <input
                            type="number"
                            min="1"
                            value={editForm.membersNeeded}
                            onChange={(e) => setEditForm((f) => ({ ...f, membersNeeded: e.target.value }))}
                          />
                        </label>
                      </div>
                      <label>
                        Skills needed
                        <input
                          type="text"
                          value={editForm.skillsNeeded}
                          onChange={(e) => setEditForm((f) => ({ ...f, skillsNeeded: e.target.value }))}
                        />
                      </label>
                    </>
                  ) : (
                    <label>
                      Your skills
                      <input
                        type="text"
                        value={editForm.skills}
                        onChange={(e) => setEditForm((f) => ({ ...f, skills: e.target.value }))}
                      />
                    </label>
                  )}

                  <label>
                    Description
                    <textarea
                      rows={3}
                      value={editForm.description}
                      onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                    />
                  </label>

                  <div className="post-actions">
                    <button type="button" className="submit-btn" onClick={() => saveEdit(post)}>Save</button>
                    <button type="button" className="secondary-btn" onClick={cancelEditing}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
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

                  <div className="post-actions">
                    <button type="button" className="secondary-btn" onClick={() => startEditing(post)}>Edit</button>
                    <button type="button" className="secondary-btn" onClick={() => toggleStatus(post)}>
                      {post.status === "open" ? "Mark closed" : "Reopen"}
                    </button>
                    <button type="button" className="danger-btn" onClick={() => deletePost(post)}>Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyPosts;
