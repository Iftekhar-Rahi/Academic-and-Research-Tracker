# Thesis Supervisors (backend)

Self-contained feature: scrapes BRAC University CSE's thesis-supervisor
directory and serves it from MongoDB. Nothing in this folder requires any
other file in this project — only npm packages and a `MONGO_URI` env var.

## Files
- `Faculty.js` — Mongoose model.
- `routes.js` — Express router (`GET /`, `GET /tags`, `GET /:facId`). Does
  **not** check authentication itself — mount it behind whatever auth
  middleware your project uses (or none, if it should be public).
- `scraper.js` — scraping/parsing logic (`scrapeAll`, `parseListPage`,
  `fetchAndParseProfile`). Never called by the running server — scraping
  only happens via `scrape.js`.
- `scrape.js` — CLI entrypoint (`node scrape.js`). Connects to MongoDB using
  `MONGO_URI`, runs the scrape, then exits. Safe to re-run — upserts by
  `facId`, no duplicates.
- `tagging.js` / `escapeRegExp.js` — small utils used by the scraper and
  routes (keyword-based research-interest tagging, safe regex building).

## Dependencies
Add to your project's `package.json` if not already present:
```
npm install cheerio dotenv mongoose
```
(`cheerio` is the only one likely missing — `dotenv`/`mongoose` are standard
in most MERN setups.)

## Integrate
1. Copy this whole folder into your project, e.g. `server/features/thesis-supervisors/`.
2. In your server entrypoint (e.g. `server.js`), mount the router:
   ```js
   const facultyRoutes = require("./features/thesis-supervisors/routes");
   app.use("/api/faculty", requireAuth, facultyRoutes); // swap requireAuth for your own middleware, or drop it
   ```
3. Add an npm script and run it once (and again whenever you want fresh data):
   ```json
   "scripts": { "scrape": "node features/thesis-supervisors/scrape.js" }
   ```
   ```
   npm run scrape
   ```
   This fetches the list page plus all ~190 individual profile pages
   (politely, ~400ms apart — takes a few minutes) and upserts them into
   the `faculties` collection.
4. Make sure `MONGO_URI` is set in your `.env`.
