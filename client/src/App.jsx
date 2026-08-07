import StudyPlanner from "./features/study-planner/StudyPlanner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Faculty from "./features/thesis-supervisors/Faculty";
import Browse from "./features/thesis-groups/Browse";
import CreatePost from "./features/thesis-groups/CreatePost";
import MyPosts from "./features/thesis-groups/MyPosts";
import CourseResources from "./features/course-resources/CourseResources";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
  path="/study-planner"
  element={
    <ProtectedRoute>
      <StudyPlanner />
    </ProtectedRoute>
  }
/>
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

        {/* thesis group finder board - find groupmates or a group to join */}
        <Route
          path="/thesis-groups"
          element={
            <ProtectedRoute>
              <Browse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/thesis-groups/new"
          element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/thesis-groups/mine"
          element={
            <ProtectedRoute>
              <MyPosts />
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