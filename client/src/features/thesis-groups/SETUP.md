# Thesis Group Finder (frontend)

Board where logged-in students post either an existing thesis group looking for more
members, or themselves looking to join one (see the matching backend feature folder).

## Files
- `Browse.jsx` — the board: type + research-area tag filters, a card grid showing each
  post's details and the poster's name/email (contact is a plain `mailto:` link, no
  in-app messaging).
- `CreatePost.jsx` — lets the user pick "group" or "individual" first, then shows only
  the fields relevant to that type.
- `MyPosts.jsx` — the current user's own posts (open and closed), with inline edit,
  open/closed toggle, and delete.
- `ThesisGroups.css` — shared styles for all three pages above.
- `api.js` — `authFetch(path, options)` helper that attaches
  `Authorization: Bearer <token>` from `localStorage.getItem("token")`.
  **If your project already has its own authenticated-fetch helper or a different auth
  convention (cookies, a different storage key, etc.), update the imports in the three
  page components to use that instead and delete this file** — it's only here so the
  folder works standalone.

## Integrate
1. Copy this whole folder into your project, e.g.
   `client/src/features/thesis-groups/`.
2. Add routes in your router (e.g. `App.jsx`), all requiring login:
   ```jsx
   import Browse from "./features/thesis-groups/Browse";
   import CreatePost from "./features/thesis-groups/CreatePost";
   import MyPosts from "./features/thesis-groups/MyPosts";
   ...
   <Route path="/thesis-groups" element={<YourProtectedRoute><Browse /></YourProtectedRoute>} />
   <Route path="/thesis-groups/new" element={<YourProtectedRoute><CreatePost /></YourProtectedRoute>} />
   <Route path="/thesis-groups/mine" element={<YourProtectedRoute><MyPosts /></YourProtectedRoute>} />
   ```
3. Make sure your backend serves `/api/thesis-groups` and its sub-routes (see the
   backend feature's `SETUP.md`), and that requests from your dev server reach it —
   either via a dev proxy (e.g. Vite's `server.proxy: { "/api": "http://localhost:5000" }`)
   or by changing the fetch paths to a full URL.
