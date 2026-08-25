# Course Resources (frontend)

Single page for browsing and sharing links to course materials, filterable by course code
and type.

## Files
- `api.js` — `authFetch` helper, attaches the saved login token to requests.
- `CourseResources.jsx` — one page: course/type filter dropdowns, a toggleable "Add
  Resource" form, and a grid of resource cards. Edit/Delete buttons only render on cards
  where `resource.uploadedBy._id` matches the logged-in user's id (from `localStorage`).
- `CourseResources.css` — card/badge/form styling, matching the visual language used by
  the Thesis Group Finder feature.

## Integrate
1. Copy this whole folder into your project, e.g. `frontend/src/features/course-resources/`.
2. In your router (e.g. `App.jsx`), add a protected route:
   ```jsx
   import CourseResources from "./features/course-resources/CourseResources";
   ...
   <Route
     path="/course-resources"
     element={
       <ProtectedRoute>
         <CourseResources />
       </ProtectedRoute>
     }
   />
   ```
3. Requires the matching backend routes mounted at `/api/course-resources` (see
   `docs/course-resources-SETUP.md`).
