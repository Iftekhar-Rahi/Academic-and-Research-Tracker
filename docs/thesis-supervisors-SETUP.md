# Thesis Supervisors (backend)

Scrapes BRAC University CSE's thesis-supervisor directory and serves it from MongoDB.
Apart from `utils/` and `middleware/`, nothing here depends on the rest of the app — only
npm packages and a `MONGO_URI` env var.

## Files
- `models/Faculty.js` — Mongoose model.
- `services/facultyService.js` — the queries and filters behind the directory (tag counts,
  search, the alumni exclusion), plus the guards around starting a scrape.
- `controllers/facultyController.js` — reads the request, calls the service, sends the JSON
  response.
- `routes/facultyRoutes.js` — maps URLs to controller functions (`GET /`, `GET /tags`,
  `GET /:facId`, `POST /scrape`, `GET /scrape/status`). Does **not** check authentication
  itself — it's mounted behind `requireAuth` in `routes/index.js`; swap that for your own
  middleware, or drop it if the directory should be public.
- `services/scraperService.js` — scraping/parsing logic (`scrapeAll`, `parseListPage`,
  `fetchAndParseProfile`).
- `services/scrapeJobService.js` — runs `scrapeAll` in the background for `POST /scrape`
  and keeps the progress in memory for `GET /scrape/status`. Only one scrape at a time,
  with a 60-second cooldown between runs.
- `scripts/scrape.js` — CLI entrypoint (`npm run scrape`). Connects to MongoDB using
  `MONGO_URI`, runs the scrape, then exits. Safe to re-run — upserts by `facId`, no
  duplicates.
- `services/taggingService.js` / `utils/escapeRegExp.js` — keyword-based research-interest
  tagging, and safe regex building for the search box.

## Dependencies
Add to your project's `package.json` if not already present:
```
npm install cheerio dotenv mongoose
```
(`cheerio` is the only one likely missing — `dotenv`/`mongoose` are standard
in most MERN setups.)

## Integrate
1. Copy the files listed above into the matching folders of your project.
2. Mount the router in [`routes/index.js`](../routes/index.js):
   ```js
   const facultyRoutes = require("./facultyRoutes");
   router.use("/faculty", requireAuth, facultyRoutes); // swap requireAuth for your own middleware, or drop it
   ```
3. Add an npm script and run it once (and again whenever you want fresh data):
   ```json
   "scripts": { "scrape": "node scripts/scrape.js" }
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
