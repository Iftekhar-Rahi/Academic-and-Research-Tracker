const API_URL = "http://localhost:5001/api/study-planner";

// Helper to grab token from localStorage
const getAuthHeaders = () => {
  let token = localStorage.getItem("token") || localStorage.getItem("userToken");

  // If token is stored inside a user object in localStorage
  if (!token && localStorage.getItem("user")) {
    try {
      const userObj = JSON.parse(localStorage.getItem("user"));
      token = userObj.token || userObj.jwt;
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
    }
  }

  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : "",
    "x-auth-token": token || "",
  };
};

export const fetchStudyPlans = async () => {
  try {
    const res = await fetch(API_URL, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch (err) {
    console.error("Fetch API error:", err);
    return { message: "Failed to connect to backend" };
  }
};

export const createStudyPlan = async (planData) => {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(planData),
    });
    return await res.json();
  } catch (err) {
    console.error("Create API error:", err);
    return { message: "Failed to connect to backend" };
  }
};

export const togglePlanStatus = async (id, isCompleted) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ isCompleted }),
    });
    return await res.json();
  } catch (err) {
    console.error("Toggle API error:", err);
  }
};

export const deleteStudyPlan = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch (err) {
    console.error("Delete API error:", err);
  }
};