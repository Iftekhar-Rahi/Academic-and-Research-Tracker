import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Faculty from "./features/thesis-supervisors/Faculty";
import CourseResources from "./features/course-resources/CourseResources";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* go to login page first when opening the site */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* dashboard needs the user to be logged in */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* browse BRACU CSE thesis supervisors by research interest */}
        <Route
          path="/faculty"
          element={
            <ProtectedRoute>
              <Faculty />
            </ProtectedRoute>
          }
        />

        {/* course resources board - links to lecture slides, notes, question banks, etc. */}
        <Route
          path="/course-resources"
          element={
            <ProtectedRoute>
              <CourseResources />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
