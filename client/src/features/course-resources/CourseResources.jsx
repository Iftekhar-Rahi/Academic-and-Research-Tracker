import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authFetch } from "./api";
import "./CourseResources.css";

const RESOURCE_TYPES = ["Lecture Slides", "Notes", "Question Bank", "Video", "Book/PDF", "Other"];

const EMPTY_FORM = { courseCode: "", title: "", type: "", url: "", description: "" };

// turns a type like "Book/PDF" into a CSS-safe class suffix like "book-pdf"
function typeSlug(type) {
  return type.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function CourseResources() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const [resources, setResources] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [courseFilter, setCourseFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [addError, setAddError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editError, setEditError] = useState("");

  // loads the fixed course list once, for both dropdowns
  useEffect(() => {
    async function loadCourses() {
      const res = await authFetch("/api/course-resources/courses");
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses);
      }
    }
    loadCourses();
  }, []);

  // reloads whenever a filter changes, so the query hits the server instead of filtering client-side
  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (courseFilter) params.set("courseCode", courseFilter);
      if (typeFilter) params.set("type", typeFilter);

      const res = await authFetch(`/api/course-resources?${params.toString()}`);

      // token missing or expired - send the user back to the login page
      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!res.ok) {
        setError("Could not load resources. Please try again later.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setResources(data.resources);
    } catch {
      setError("Could not load resources. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [navigate, courseFilter, typeFilter]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  function updateAddField(field, value) {
    setAddForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleAddSubmit(e) {
    e.preventDefault();
    setAddError("");
    setSubmitting(true);

    try {
      const res = await authFetch("/api/course-resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setAddError(data.message || "Could not add resource");
        setSubmitting(false);
        return;
      }

      setAddForm(EMPTY_FORM);
      setShowAddForm(false);
      loadResources();
    } catch {
      setAddError("Could not add resource. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  }

  function startEditing(resource) {
    setEditingId(resource._id);
    setEditError("");
    setEditForm({
      courseCode: resource.courseCode,
      title: resource.title,
      type: resource.type,
      url: resource.url,
      description: resource.description || "",
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
    setEditError("");
  }

  async function saveEdit(id) {
    setEditError("");

    const res = await authFetch(`/api/course-resources/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });

    const data = await res.json();
    if (res.ok) {
      cancelEditing();
      loadResources();
    } else {
      setEditError(data.message || "Could not save changes");
    }
  }

  async function deleteResource(resource) {
    if (!window.confirm("Delete this resource? This can't be undone.")) return;

    const res = await authFetch(`/api/course-resources/${resource._id}`, { method: "DELETE" });

    if (res.ok) {
      loadResources();
    } else {
      setError("Could not delete resource. Please try again later.");
    }
  }

  return (
    <div className="course-resources-page">
      <div className="navbar">
        <h2>Course Resources</h2>
        <div className="navbar-right">
          <button type="button" className="back-link add-link" onClick={() => setShowAddForm((v) => !v)}>
            {showAddForm ? "Cancel" : "+ Add Resource"}
          </button>
          <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
        </div>
      </div>

      <div className="course-resources-content">
        <p className="form-intro">
          Browse links to lecture slides, notes, question banks, videos and other course
          materials shared by students, or share your own.
        </p>

        {showAddForm && (
          <form className="resource-form" onSubmit={handleAddSubmit}>
            <label>
              Course Code
              <select
                value={addForm.courseCode}
                onChange={(e) => updateAddField("courseCode", e.target.value)}
                required
              >
                <option value="" disabled>Select a course</option>
                {courses.map((code) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </label>

            <label>
              Title
              <input
                type="text"
                value={addForm.title}
                onChange={(e) => updateAddField("title", e.target.value)}
                required
              />
            </label>

            <label>
              Type
              <select
                value={addForm.type}
                onChange={(e) => updateAddField("type", e.target.value)}
                required
              >
                <option value="" disabled>Select a type</option>
                {RESOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>

            <label>
              URL
              <input
                type="text"
                placeholder="https://..."
                value={addForm.url}
                onChange={(e) => updateAddField("url", e.target.value)}
                required
              />
            </label>

            <label>
              Description (optional)
              <textarea
                rows={3}
                value={addForm.description}
                onChange={(e) => updateAddField("description", e.target.value)}
              />
            </label>

            {addError && <p className="status-text error">{addError}</p>}

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? "Adding..." : "Add Resource"}
            </button>
          </form>
        )}

        <div className="filter-row">
          <label>
            Course Code
            <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
              <option value="">All courses</option>
              {courses.map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </label>

          <label>
            Type
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All types</option>
              {RESOURCE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>

        {loading && <p className="status-text">Loading resources...</p>}
        {error && <p className="status-text error">{error}</p>}

        {!loading && !error && resources.length === 0 && (
          <p className="status-text">No resources match your filters.</p>
        )}

        <div className="resource-grid">
          {resources.map((resource) => {
            const isOwner = currentUser && resource.uploadedBy?._id === currentUser.id;

            return (
              <div className="resource-card" key={resource._id}>
                {editingId === resource._id ? (
                  <div className="edit-form">
                    <label>
                      Course Code
                      <select
                        value={editForm.courseCode}
                        onChange={(e) => setEditForm((f) => ({ ...f, courseCode: e.target.value }))}
                      >
                        {courses.map((code) => (
                          <option key={code} value={code}>{code}</option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Title
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                      />
                    </label>

                    <label>
                      Type
                      <select
                        value={editForm.type}
                        onChange={(e) => setEditForm((f) => ({ ...f, type: e.target.value }))}
                      >
                        {RESOURCE_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </label>

                    <label>
                      URL
                      <input
                        type="text"
                        value={editForm.url}
                        onChange={(e) => setEditForm((f) => ({ ...f, url: e.target.value }))}
                      />
                    </label>

                    <label>
                      Description
                      <textarea
                        rows={3}
                        value={editForm.description}
                        onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                      />
                    </label>

                    {editError && <p className="status-text error">{editError}</p>}

                    <div className="resource-actions">
                      <button type="button" className="submit-btn" onClick={() => saveEdit(resource._id)}>Save</button>
                      <button type="button" className="secondary-btn" onClick={cancelEditing}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className={`type-badge ${typeSlug(resource.type)}`}>{resource.type}</span>
                    <h3 className="resource-title">{resource.title}</h3>
                    <p className="resource-subtext">{resource.courseCode}</p>

                    {resource.description && (
                      <p className="resource-description">{resource.description}</p>
                    )}

                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                      Open resource →
                    </a>

                    <div className="resource-footer">
                      <span>Shared by {resource.uploadedBy?.name}</span>
                    </div>

                    {isOwner && (
                      <div className="resource-actions">
                        <button type="button" className="secondary-btn" onClick={() => startEditing(resource)}>Edit</button>
                        <button type="button" className="danger-btn" onClick={() => deleteResource(resource)}>Delete</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CourseResources;
