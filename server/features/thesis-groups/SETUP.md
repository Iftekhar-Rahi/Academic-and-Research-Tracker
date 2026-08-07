# Thesis Group Finder (backend)

Board where undergrad CS students post either an existing thesis group looking for more
members, or themselves looking to join one.

## Files
- `ThesisGroupPost.js` — Mongoose model. `type` is `"group"` or `"individual"`; the
  group-only fields (`topic`, `proposedSupervisor`, `currentMembers`, `membersNeeded`,
  `skillsNeeded`) and the individual-only field (`skills`) all live on the same schema,
  just left blank/unset for the other type. `researchAreas` is shared by both types (the
  group's research areas, or the areas a student is interested in).
- `routes.js` — Express router (`GET /`, `GET /tags`, `GET /mine`, `POST /`, `PATCH /:id`,
  `DELETE /:id`). Checks `req.userId` for ownership on `PATCH`/`DELETE`, so it must be
  mounted behind auth middleware that sets it (see Integrate below).

## Dependency on Thesis Supervisors
Unlike thesis-supervisors, this folder is **not fully standalone** — `routes.js` imports
`ALL_TAGS` from `../thesis-supervisors/tagging` so both features share one research-area
tag list. If you copy this folder into another project without thesis-supervisors, either
bring that file along too or replace the import with your own tag list.

## Integrate
1. Copy this whole folder into your project, e.g. `server/features/thesis-groups/`.
2. In your server entrypoint (e.g. `server.js`), mount the router:
   ```js
   const thesisGroupRoutes = require("./features/thesis-groups/routes");
   app.use("/api/thesis-groups", requireAuth, thesisGroupRoutes); // requireAuth must set req.userId
   ```
3. No data load needed — posts are created directly through the API as students use the board.
