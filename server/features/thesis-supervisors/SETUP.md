# Thesis Supervisors (backend)

Self-contained feature: scrapes BRAC University CSE's thesis-supervisor
directory and serves it from MongoDB. Nothing in this folder requires any
other file in this project — only npm packages and a `MONGO_URI` env var.

## Files
- `Faculty.js` — Mongoose model.
- `routes.js` — Express router (`GET /`, `GET /tags`, `GET /:facId`,
  `POST /scrape`, `GET /scrape/status`). Does **not** check authentication
  itself — mount it behind whatever auth middleware your project uses (or
  none, if it should be public).
- `scraper.js` — scraping/parsing logic (`scrapeAll`, `parseListPage`,
  `fetchAndParseProfile`).
- `scrapeJob.js` — runs `scrapeAll` in the background for `POST /scrape` and
  keeps the progress in memory for `GET /scrape/status`. Only one scrape at a
  time, with a 60-second cooldown between runs.
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

## Scraping from the website instead of the terminal
The same scrape can be triggered from the browser, so you don't need terminal
access to refill the data:

- `POST /scrape` — starts a scrape in the background and replies immediately
  with `202` and the current status. Replies `409` if one is already running,
  or `429` if one finished less than 60 seconds ago.
- `GET /scrape/status` — returns `{ status: { running, done, total, current,
  summary, error, startedAt, finishedAt } }`. Poll this every couple of
  seconds to show progress.

The request never waits for the scrape to finish — a full run takes minutes,
far longer than a browser will hold a connection open. Progress lives in
memory, so a server restart mid-scrape loses the progress info (the faculty
already saved to MongoDB are unaffected).

Note that anyone who can reach `POST /scrape` can make your server hit BRACU's
site. The single-run guard and cooldown keep that in check, but if you add
user roles later, this is a route worth restricting to admins.
