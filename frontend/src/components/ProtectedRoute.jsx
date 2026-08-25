import { Navigate } from "react-router-dom";

// only lets logged in users see the page, otherwise sends them to login
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
