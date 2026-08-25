# Academic and Research Tracker (MERN Stack)

A tool for BRAC University students to manage courses, track research progress, and stay on top of
deadlines. Built with MongoDB, Express, React, and Node.js. The Express side follows the **MVC
pattern**, with the React app in `frontend/` as the View layer.

Team of 5, all collaborators on this GitHub repo. Read this file before you start adding your
feature — it covers **how to set the project up**, **where your code goes**, and **how we work
together** so we don't step on each other's code.

## Features built so far

- **Auth + Dashboard** — register/login (JWT) and a protected dashboard page.
- **Thesis Supervisors** — scrapes BRAC CSE's thesis-supervisor directory and lets logged-in users
  browse/search faculty by research interest, on the `/faculty` page. Needs a one-time data load,
  see step 5 below.
- **Thesis Group Finder** — a board where students post an existing group looking for members, or
  themselves looking to join one, on the `/thesis-groups` page.
- **Course Resources** — a board where students share links to slides, notes and question banks
  tagged by course, on the `/course-resources` page.

Each backend feature has a write-up in [docs/](docs) listing exactly which files it owns and how to
lift it into another project. Each frontend feature has a `SETUP.md` in its own folder.

## Project structure

The Express app lives at the repo root, and every folder has exactly one job:

```
Academic-and-Research-Tracker/
│
├── models/          Mongoose schemas - User, Faculty, Resource, ThesisGroupPost
├── controllers/     reads the request, calls a service, sends the JSON response. No rules
├── services/        the actual rules: validation, ownership checks, database queries
├── routes/          maps URLs to controllers. No logic. index.js lists every mount
├── middleware/      authMiddleware.js (checks the login token), errorHandler.js
├── config/          database.js (the MongoDB connection), constants.js (course codes, etc.)
├── utils/           small shared helpers (ApiError, asyncHandler, escapeRegExp)
├── scripts/         things you run by hand, e.g. npm run scrape
├── docs/            per-feature notes on which files belong to which feature
├── public/          static files served as-is (css/, js/, images/)
│
├── frontend/        React app (Vite) — the View layer
│
├── app.js           entry point: loads .env, connects to MongoDB, wires it all up, listens
└── package.json
```

### MVC flow

```
User
  ↓
Route          routes/          just maps the URL to a controller
  ↓
Controller     controllers/     reads the request
  ↓
Service        services/        the rules: validation, ownership checks
  ↓
Model          models/          the Mongoose schema
  ↓
Database       MongoDB
  ↓
Controller     controllers/     turns the result into JSON
  ↓
View           frontend/        React renders the page
  ↓
User
```

`services/` is the one addition to the classic four folders, and it exists so controllers stay
short.

**The rule of thumb:** a controller should be short enough to read in one glance. If you're writing
an `if` that decides whether the data is *allowed*, that belongs in a service, not a controller.
Services never touch `req` or `res` — they take plain arguments, return plain data, and `throw` an
`ApiError` when something's wrong. That's what makes them easy to reuse and to test.

You'll still need to add a couple of lines to the shared files
([frontend/src/App.jsx](frontend/src/App.jsx) for the page route,
[routes/index.js](routes/index.js) for the API mount) — see "Files likely to cause
merge conflicts" below.

---

## Part 1 — Setup (do this once)

### 1. Set up MongoDB Atlas (one time, free)

> I already did this. You all don't have to do this again. I've shared the connection string.

1. Go to https://www.mongodb.com/atlas and create a free account.
2. Create a free (M0) cluster.
3. Under **Database Access**, create a database user with a username and password.
4. Under **Network Access**, add IP address `0.0.0.0/0` (allow access from anywhere) so every teammate can connect.
5. Click **Connect** on your cluster > **Drivers** > copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/
   ```
6. Replace `<username>` and `<password>` with your database user's credentials, and add a database name at the end, e.g. `/tracker`.

> Only one person needs to create the cluster. Whoever does should share the connection string with
> the team. **Never commit it to git or paste it in an issue/PR**. Everyone points their own local
> `.env` at the same connection string, so everyone reads/writes the same shared database.

### 2. Configure the backend

From the repo root, copy `.env.example` to `.env` and paste in the shared connection string:

```
MONGO_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/tracker
JWT_SECRET=change_this_to_a_long_random_string
PORT=5001
```

Keep `PORT=5001` unless you also change the dev proxy in
[frontend/vite.config.js](frontend/vite.config.js) — that's the line that forwards `/api` calls from
the React dev server to Express, and the two have to agree or every API call 404s.

`.env` is in `.gitignore` — it will never be committed. Each teammate creates their own local copy.

### 3. Install dependencies

```
npm install          # the Express app, at the repo root

cd frontend
npm install
```

### 4. Run the app

Open two terminals:

**Terminal 1 — backend (repo root):**
```
npm run dev
```
Runs on http://localhost:5001

**Terminal 2 — frontend:**
```
cd frontend
npm run dev
```
Runs on http://localhost:5173

Open http://localhost:5173 in your browser. Create an account on the Sign Up page, then log in. After
logging in you'll land on the Dashboard page — that's the shared starting point where everyone adds
their own features.

### 5. One-time data load for the Thesis Supervisors feature

The `/faculty` page reads from a `faculties` collection that isn't filled in automatically — someone
needs to run the scrape script once:

```
npm run scrape       # from the repo root
```

This fetches BRAC CSE's thesis-supervisor directory (~190 faculty) and saves it to the shared
MongoDB database, so **only one teammate needs to run this** — once it's done, everyone else already
has the data since we're all pointed at the same database. It takes a few minutes (it's deliberately
slow so we're not hammering BRACU's website) and is safe to re-run later if you want to refresh the
data.

---

## Part 2 — How we work together (git workflow)

We're 5 people committing to the same repo. To avoid overwriting each other's work:

1. **Never push directly to `main`.** `main` should always be a working version of the app.
2. **One branch per feature**, branched off the latest `main`:
   ```
   git checkout main
   git pull
   git checkout -b feature/your-name-short-description
   ```
   e.g. `feature/rahi-deadline-reminders`, `feature/nabila-course-planner`.
3. **Commit as you go**, push your branch, then open a **Pull Request into `main`** on GitHub.
4. **Get at least one other teammate to review before merging** — even a quick glance catches a lot.
5. **Pull `main` often** and merge it into your branch if your feature is taking more than a day or
   two, so you're not resolving a giant conflict at the end.

If you're not comfortable with git yet, this is the full loop:
```
git checkout main
git pull
git checkout -b feature/your-branch-name

# ... make changes ...

git add .
git commit -m "short description of what you did"
git push -u origin feature/your-branch-name
# then open a Pull Request on GitHub
```

### Files likely to cause merge conflicts

These files get touched by almost every feature, so conflicts here are the most common kind you'll hit:

- [frontend/src/App.jsx](frontend/src/App.jsx) — every new page needs a `<Route>` added here.
- [routes/index.js](routes/index.js) — every new set of API routes needs a `router.use(...)` added here.

To keep conflicts small: only add your own lines, don't reformat or reorder existing ones, and pull
`main` before you start editing these files. If two people are adding routes at the same time, a
quick heads-up in the group chat saves a headache later.

### Where do I add my feature?

- **New page:** add a component in `frontend/src/pages/` (or `frontend/src/features/<your-feature>/`),
  then add a `<Route>` for it in [frontend/src/App.jsx](frontend/src/App.jsx). Wrap it in
  `<ProtectedRoute>` if it should require login.
- **New API endpoint:** follow the MVC layers, in this order — it's four small files, not one big one:
  1. `models/YourThing.js` — the Mongoose schema (skip if you're reusing an existing one).
  2. `services/yourThingService.js` — the rules and the database queries. Throw
     `ApiError.badRequest("...")` / `.notFound(...)` / `.forbidden(...)` instead of touching `res`.
  3. `controllers/yourThingController.js` — wrap each function in `asyncHandler`, read what
     you need off `req`, call the service, `res.json(...)` the result.
  4. `routes/yourThingRoutes.js` — one line per URL, pointing at a controller function.

  Then register it in [routes/index.js](routes/index.js) with
  `router.use("/yourthing", requireAuth, yourThingRoutes)`. The `requireAuth` middleware
  ([middleware/authMiddleware.js](middleware/authMiddleware.js)) is what gives you `req.userId`,
  so add it on any route that needs to know who's logged in.

  You never need a try/catch: `asyncHandler` catches anything your service throws, and
  [middleware/errorHandler.js](middleware/errorHandler.js) turns it into the right JSON response —
  an `ApiError` keeps its status and message, anything else is logged and becomes a generic 500.
- **New database collection:** add a new Mongoose model in `models/`, following the pattern in
  [models/User.js](models/User.js).
- **Need the current logged-in user in a component?**
  `const user = JSON.parse(localStorage.getItem("user"));`
- **Calling a protected API endpoint?** Add the token by hand:
  `headers: { Authorization: \`Bearer ${localStorage.getItem("token")}\` }`.
- The Dashboard page ([frontend/src/pages/Dashboard.jsx](frontend/src/pages/Dashboard.jsx)) is
  intentionally just a placeholder — either build your feature into it, or create a new page/route
  that links off of it.
- **Got more than 2-3 files on the frontend?** Group them in `frontend/src/features/<your-feature>/`
  like [frontend/src/features/thesis-supervisors](frontend/src/features/thesis-supervisors) does,
  instead of spreading them across `pages/`. The backend doesn't need this — the MVC folders already
  say where everything goes; just add a note in [docs/](docs) listing the files your feature owns,
  so someone can lift it out later.

### Before opening a PR

- `cd frontend && npm run lint` — fix anything it flags.
- Actually run the app (`npm run dev` at the repo root and in `frontend/`) and click through your feature.
- Make sure you haven't committed your `.env` file or any real password/connection string.

---

## Questions?

If something in the existing auth code is unclear, follow one request down through the layers:
[routes/authRoutes.js](routes/authRoutes.js) →
[controllers/authController.js](controllers/authController.js) →
[services/authService.js](services/authService.js) → [models/User.js](models/User.js), plus
[middleware/authMiddleware.js](middleware/authMiddleware.js) for how the token is checked. They're
short and commented, and every other feature is built the same way.

Otherwise, ask in the group chat before guessing — better to ask than to build on a wrong
assumption.
