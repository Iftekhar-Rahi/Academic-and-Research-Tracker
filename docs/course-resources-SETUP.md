# Course Resources (backend)

Board where students share links to course materials (slides, notes, question banks,
videos, books/PDFs) tagged by course code and type. Links only, no file uploads.

## Files
- `config/constants.js` — `COURSE_CODES` (hardcoded list of BRAC University CSE course
  codes) and `RESOURCE_TYPES`. Not a database collection, since the department doesn't
  add/remove courses through the app.
- `models/Resource.js` — Mongoose model, collection `resources`. `courseCode` and `type`
  are both restricted with a schema `enum` as a backstop; `url` requires an `http(s)://`
  prefix.
- `services/courseResourceService.js` — all the rules: validates `courseCode`/`type`/`url`
  before `.create()`/`.save()` so bad input gets a clear 400 instead of a generic mongoose
  validation error, and checks that the caller owns the resource before an edit or delete.
- `controllers/courseResourceController.js` — reads the request, calls the service, sends
  the JSON response. No rules live here.
- `routes/courseResourceRoutes.js` — maps URLs to controller functions (`GET /`,
  `GET /courses`, `POST /`, `PUT /:id`, `DELETE /:id`). Ownership is checked against
  `req.userId`, so it must be mounted behind auth middleware that sets it.

## Integrate
1. Copy the files listed above into the matching folders of your project.
2. Mount the router in [`routes/index.js`](../routes/index.js):
   ```js
   const courseResourceRoutes = require("./courseResourceRoutes");
   router.use("/course-resources", requireAuth, courseResourceRoutes); // requireAuth must set req.userId
   ```
3. No data load needed — resources are created directly through the API as students share links.
