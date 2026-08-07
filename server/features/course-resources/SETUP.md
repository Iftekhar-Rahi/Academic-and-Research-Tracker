# Course Resources (backend)

Board where students share links to course materials (slides, notes, question banks,
videos, books/PDFs) tagged by course code and type. Links only, no file uploads.

## Files
- `courseList.js` — hardcoded list of BRAC University CSE course codes (`COURSE_CODES`).
  Not a database collection, since the department doesn't add/remove courses through the app.
- `Resource.js` — Mongoose model, collection `resources`. `courseCode` and `type` are both
  restricted with a schema `enum` as a backstop; `url` requires an `http(s)://` prefix.
- `routes.js` — Express router (`GET /`, `GET /courses`, `POST /`, `PUT /:id`,
  `DELETE /:id`). Validates `courseCode`/`type`/`url` manually before `.create()`/`.save()`
  so bad input gets a clear 400 instead of a generic mongoose validation error. Checks
  `req.userId` for ownership on `PUT`/`DELETE`, so it must be mounted behind auth
  middleware that sets it (see Integrate below).

## Integrate
1. Copy this whole folder into your project, e.g. `server/features/course-resources/`.
2. In your server entrypoint (e.g. `server.js`), mount the router:
   ```js
   const courseResourceRoutes = require("./features/course-resources/routes");
   app.use("/api/course-resources", requireAuth, courseResourceRoutes); // requireAuth must set req.userId
   ```
3. No data load needed — resources are created directly through the API as students share links.
