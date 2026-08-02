# Academic and Research Tracker (MERN Stack)

A tool for BRAC University students to manage courses, track research progress, and stay on top of
deadlines. Built with MongoDB, Express, React, and Node.js. This repo currently has login/register,
a protected dashboard, and a Thesis Supervisors feature — the shared starting point the rest of the
team's features build on.

Team of 5, all collaborators on this GitHub repo. Read this file before you start adding your
feature — it covers both **how to set the project up** and **how we work together** so we don't
step on each other's code.

## Features built so far

- **Auth + Dashboard** — register/login (JWT) and a protected dashboard page. Lives in the usual
  `server/models`, `server/routes`, `server/middleware`, and `client/src/pages`.
- **Thesis Supervisors** — scrapes BRAC CSE's thesis-supervisor directory and lets logged-in users
  browse/search faculty by research interest, on the `/faculty` page. Lives in its own folder on
  each side ([server/features/thesis-supervisors](server/features/thesis-supervisors),
  [client/src/features/thesis-supervisors](client/src/features/thesis-supervisors)) so it's easy to
  see everything that belongs to it, or copy it into another project — see the `SETUP.md` in each
  folder. Needs a one-time data load, see step 5 below.

## Project structure

```
client/   React app (Vite) - the frontend
server/   Express API - handles register/login and talks to MongoDB
```

Two ways to add code in this repo, pick whichever fits your feature:
- **Shared style** — add a page in `client/src/pages/`, a route file in `server/routes/`, a model in
  `server/models/`, same as the existing auth code.
- **Feature-folder style** — put everything your feature owns in its own
  `server/features/<your-feature>/` and `client/src/features/<your-feature>/` folder (see
  `thesis-supervisors` for a working example). Keeps your code easy to find, review, and even copy
  into another project later. Recommended if your feature has more than 2-3 files.

Either way, you'll still need to add a couple of lines to the shared files
([client/src/App.jsx](client/src/App.jsx) for the route, [server/server.js](server/server.js) for
the API mount) — see "Files likely to cause merge conflicts" below.

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

### 2. Configure the server

```
cd server
```

Copy `.env.example` to `.env` and paste in the shared connection string:

```
MONGO_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/tracker
JWT_SECRET=change_this_to_a_long_random_string
PORT=5000
```

`.env` is in `.gitignore` — it will never be committed. Each teammate creates their own local copy.

### 3. Install dependencies

```
cd server
npm install

cd ../client
npm install
```

### 4. Run the app

Open two terminals:

**Terminal 1 — backend:**
```
cd server
npm run dev
```
Runs on http://localhost:5000

**Terminal 2 — frontend:**
```
cd client
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
cd server
npm run scrape
```

This fetches BRAC CSE's thesis-supervisor directory (~190 faculty) and saves it to the shared
MongoDB database, so **only one teammate needs to run this** — once it's done, everyone else already
has the data since we're all pointed at the same database. It takes a few minutes (it's deliberately
slow so we're not hammering BRACU's website) and is safe to re-run later if you want to refresh the
data.

---

## Part 2 — How we work together (git workflow)

We're 4 people committing to the same repo. To avoid overwriting each other's work:

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

- [client/src/App.jsx](client/src/App.jsx) — every new page needs a `<Route>` added here.
- [server/server.js](server/server.js) — every new set of API routes needs an `app.use(...)` added here.

To keep conflicts small: only add your own lines, don't reformat or reorder existing ones, and pull
`main` before you start editing these files. If two people are adding routes at the same time, a
quick heads-up in the group chat saves a headache later.

### Where do I add my feature?

- **New page:** add a component in `client/src/pages/` (or `client/src/features/<your-feature>/` —
  see below), then add a `<Route>` for it in [client/src/App.jsx](client/src/App.jsx). Wrap it in
  `<ProtectedRoute>` if it should require login.
- **New API endpoint:** add a route file in `server/routes/` (or `server/features/<your-feature>/`),
  and register it in [server/server.js](server/server.js) with `app.use("/api/yourthing", yourRoutes)`.
  Use the `requireAuth` middleware ([server/middleware/auth.js](server/middleware/auth.js)) on any
  route that needs to know who's logged in — it gives you `req.userId`.
- **New database collection:** add a new Mongoose model, following the pattern in
  `server/models/User.js`.
- **Need the current logged-in user in a component?**
  `const user = JSON.parse(localStorage.getItem("user"));`
- **Calling a protected API endpoint?** Add the token by hand:
  `headers: { Authorization: \`Bearer ${localStorage.getItem("token")}\` }`.
- The Dashboard page ([client/src/pages/Dashboard.jsx](client/src/pages/Dashboard.jsx)) is
  intentionally just a placeholder — either build your feature into it, or create a new page/route
  that links off of it.
- **Got more than 2-3 files for your feature?** Consider the feature-folder style instead of spreading
  files across `pages/`/`routes/`/`models/`: put everything in
  `server/features/<your-feature>/` and `client/src/features/<your-feature>/`, like
  [server/features/thesis-supervisors](server/features/thesis-supervisors) and
  [client/src/features/thesis-supervisors](client/src/features/thesis-supervisors) do. Makes your
  code easy to review as one unit, and easy to lift out later if you ever want to reuse it elsewhere.

### Before opening a PR

- `cd client && npm run lint` — fix anything it flags.
- Actually run the app (`npm run dev` in both `server` and `client`) and click through your feature.
- Make sure you haven't committed your `.env` file or any real password/connection string.

---

## Questions?

If something in the existing auth code is unclear, read through
[server/routes/auth.js](server/routes/auth.js) and [server/middleware/auth.js](server/middleware/auth.js)
first — they're short and commented. Otherwise, ask in the group chat before guessing — better to ask
than to build on a wrong assumption.
