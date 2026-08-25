# Thesis Supervisors (frontend)

Self-contained feature page for browsing/searching the scraped BRACU CSE
thesis-supervisor directory (see the matching backend feature folder).

## Files
- `Faculty.jsx` — the page component (search box, tag filter chips,
  faculty card grid, and the "Update data" button that re-scrapes BRACU's
  site — it starts the scrape, then polls for progress every 2 seconds and
  reloads the list when it finishes).
- `Faculty.css` — its styles.
- `api.js` — `authFetch(path, options)` helper that attaches
  `Authorization: Bearer <token>` from `localStorage.getItem("token")`.
  **If your project already has its own authenticated-fetch helper or a
  different auth convention (cookies, a different storage key, etc.),
  update the import in `Faculty.jsx` to use that instead and delete this
  file** — it's only here so the folder works standalone.

## Integrate
1. Copy this whole folder into your project, e.g.
   `frontend/src/features/thesis-supervisors/`.
2. Add a route in your router (e.g. `App.jsx`):
   ```jsx
   import Faculty from "./features/thesis-supervisors/Faculty";
   ...
   <Route path="/faculty" element={<YourProtectedRoute><Faculty /></YourProtectedRoute>} />
   ```
   (Or render it unprotected if the backend route isn't auth-gated.)
3. Make sure your backend serves `/api/faculty`, `/api/faculty/tags`,
   `/api/faculty/:facId`, `POST /api/faculty/scrape` and
   `GET /api/faculty/scrape/status` (see the backend feature's `SETUP.md`),
   and that requests from your dev server reach it — either via a dev proxy
   (e.g. Vite's `server.proxy: { "/api": "http://localhost:5000" }`) or by
   changing the fetch paths in `Faculty.jsx` to a full URL.
4. If you don't want the scrape button, delete `startScrape`, the polling
   `useEffect`, and the `.scrape-*` markup from `Faculty.jsx` — the rest of
   the page works without them.
