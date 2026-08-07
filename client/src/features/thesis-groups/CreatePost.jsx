import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authFetch } from "./api";
import "./ThesisGroups.css";

const EMPTY_FORM = {
  researchAreas: [],
  description: "",
  topic: "",
  proposedSupervisor: "",
  currentMembers: "",
  membersNeeded: "",
  skillsNeeded: "",
  skills: "",
};

function CreatePost() {
  const navigate = useNavigate();

  const [type, setType] = useState(null); // "group" | "individual", chosen first
  const [tags, setTags] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // loads the shared research-area tag list once, for the tag picker below
  useEffect(() => {
    async function loadTags() {
      const res = await authFetch("/api/thesis-groups/tags");
      if (res.ok) {
        const data = await res.json();
        setTags(data.tags);
      }
    }
    loadTags();
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleTag(tag) {
    setForm((prev) => ({
      ...prev,
      researchAreas: prev.researchAreas.includes(tag)
        ? prev.researchAreas.filter((t) => t !== tag)
        : [...prev.researchAreas, tag],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const body = {
      type,
      researchAreas: form.researchAreas,
      description: form.description,
      ...(type === "group"
        ? {
            topic: form.topic,
            proposedSupervisor: form.proposedSupervisor,
            currentMembers: form.currentMembers === "" ? undefined : Number(form.currentMembers),
            membersNeeded: form.membersNeeded === "" ? undefined : Number(form.membersNeeded),
            skillsNeeded: form.skillsNeeded,
          }
        : { skills: form.skills }),
    };

    try {
      const res = await authFetch("/api/thesis-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Could not create post");
        setSubmitting(false);
        return;
      }

      navigate("/thesis-groups/mine");
    } catch {
      setError("Could not create post. Please try again later.");
      setSubmitting(false);
    }
  }

  return (
    <div className="thesis-groups-page">
      <div className="navbar">
        <h2>New Post</h2>
        <Link to="/thesis-groups" className="back-link">← Back to Board</Link>
      </div>

      <div className="thesis-groups-content">
        {type === null && (
          <div className="type-picker">
            <p className="form-intro">What would you like to post?</p>
            <button type="button" className="type-option" onClick={() => setType("group")}>
              <h3>I have a group</h3>
              <p>Your thesis group is looking for more members.</p>
            </button>
            <button type="button" className="type-option" onClick={() => setType("individual")}>
              <h3>I'm looking for a group</h3>
              <p>You're a student looking to join an existing group.</p>
            </button>
          </div>
        )}

        {type !== null && (
          <form className="post-form" onSubmit={handleSubmit}>
            <button type="button" className="change-type-link" onClick={() => setType(null)}>
              ← Change post type
            </button>

            {type === "group" ? (
              <>
                <label>
                  Topic
                  <input
                    type="text"
                    value={form.topic}
                    onChange={(e) => updateField("topic", e.target.value)}
                    required
                  />
                </label>

                <label>
                  Proposed supervisor (optional)
                  <input
                    type="text"
                    value={form.proposedSupervisor}
                    onChange={(e) => updateField("proposedSupervisor", e.target.value)}
                  />
                </label>

                <div className="form-row">
                  <label>
                    Current members
                    <input
                      type="number"
                      min="0"
                      value={form.currentMembers}
                      onChange={(e) => updateField("currentMembers", e.target.value)}
                      required
                    />
                  </label>

                  <label>
                    Members needed
                    <input
                      type="number"
                      min="1"
                      value={form.membersNeeded}
                      onChange={(e) => updateField("membersNeeded", e.target.value)}
                      required
                    />
                  </label>
                </div>

                <label>
                  Skills needed
                  <input
                    type="text"
                    placeholder="e.g. React, data analysis, technical writing"
                    value={form.skillsNeeded}
                    onChange={(e) => updateField("skillsNeeded", e.target.value)}
                  />
                </label>
              </>
            ) : (
              <label>
                Your skills
                <input
                  type="text"
                  placeholder="e.g. React, data analysis, technical writing"
                  value={form.skills}
                  onChange={(e) => updateField("skills", e.target.value)}
                />
              </label>
            )}

            <label>Research areas</label>
            <div className="tag-chips">
              {tags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  className={`tag-chip ${form.researchAreas.includes(tag) ? "active" : ""}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>

            <label>
              Description
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                required
              />
            </label>

            {error && <p className="status-text error">{error}</p>}

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? "Posting..." : "Post"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default CreatePost;
