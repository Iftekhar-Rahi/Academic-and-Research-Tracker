import React, { useState, useEffect } from "react";
import { fetchStudyPlans, createStudyPlan, togglePlanStatus, deleteStudyPlan } from "./api";
import "./StudyPlanner.css";

function StudyPlanner() {
  const [plans, setPlans] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    course: "",
    date: new Date().toISOString().split("T")[0],
    timeSlot: "10:00 AM - 12:00 PM", // Customizable input
    category: "Exam Prep",
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await fetchStudyPlans();
      if (Array.isArray(data)) {
        setPlans(data);
        setErrorMsg("");
      } else if (data?.message) {
        setErrorMsg(`Backend message: ${data.message}`);
      }
    } catch (err) {
      setErrorMsg("Could not connect to backend server.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.title.trim() || !formData.course.trim()) {
      setErrorMsg("Please fill out both Task / Topic and Course fields.");
      return;
    }

    setLoading(true);
    try {
      const result = await createStudyPlan(formData);
      
      if (result && result._id) {
        setFormData({
          ...formData,
          title: "",
          course: "",
          timeSlot: "10:00 AM - 12:00 PM",
        });
        await loadPlans();
      } else {
        setErrorMsg(result?.message || "Failed to save task.");
      }
    } catch (err) {
      setErrorMsg("Error submitting task. Make sure backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await togglePlanStatus(id, !currentStatus);
      loadPlans();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteStudyPlan(id);
      loadPlans();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="study-planner-container">
      <h2>📅 Study Planner (Daily / Monthly)</h2>

      {errorMsg && (
        <div style={{ padding: "10px", background: "#f8d7da", color: "#721c24", borderRadius: "4px", marginBottom: "15px" }}>
          ⚠️ {errorMsg}
        </div>
      )}

      <form className="study-planner-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Task / Topic (e.g. Chapter 3 Review)"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Course (e.g. CSE220)"
          value={formData.course}
          onChange={(e) => setFormData({ ...formData, course: e.target.value })}
          required
        />
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Time Slot (e.g. 02:00 PM - 04:00 PM)"
          value={formData.timeSlot}
          onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
          required
        />
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        >
          <option value="Exam Prep">Exam Prep</option>
          <option value="Assignment">Assignment</option>
          <option value="Daily Review">Daily Review</option>
          <option value="Project">Project</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Add to Schedule"}
        </button>
      </form>

      <div className="study-plans-list">
        <h3>Your Scheduled Tasks</h3>
        {plans.length === 0 ? (
          <p>No study tasks planned yet. Add one above!</p>
        ) : (
          plans.map((plan) => (
            <div
              key={plan._id}
              className={`study-card ${plan.isCompleted ? "completed" : ""}`}
            >
              <div className="study-card-info">
                <span className="category-badge">{plan.category}</span>
                <h4>{plan.title} ({plan.course})</h4>
                <p>📆 {new Date(plan.date).toLocaleDateString()} | ⏰ {plan.timeSlot}</p>
              </div>
              <div className="study-card-actions">
                <button onClick={() => handleToggle(plan._id, plan.isCompleted)}>
                  {plan.isCompleted ? "Undo" : "Mark Done"}
                </button>
                <button className="delete-btn" onClick={() => handleDelete(plan._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default StudyPlanner;