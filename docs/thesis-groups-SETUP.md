# Thesis Group Finder (backend)

Board where undergrad CS students post either an existing thesis group looking for more
members, or themselves looking to join one.

## Files
- `models/ThesisGroupPost.js` — Mongoose model. `type` is `"group"` or `"individual"`; the
  group-only fields (`topic`, `proposedSupervisor`, `currentMembers`, `membersNeeded`,
  `skillsNeeded`) and the individual-only field (`skills`) all live on the same schema,
  just left blank/unset for the other type. `researchAreas` is shared by both types (the
  group's research areas, or the areas a student is interested in).
- `services/thesisGroupService.js` — all the rules: picks only the fields that belong to
  the post's type (so a group post can't keep an individual post's `skills`), and checks
  that the caller owns the post before an edit or delete.
- `controllers/thesisGroupController.js` — reads the request, calls the service, sends the
  JSON response. No rules live here.
- `routes/thesisGroupRoutes.js` — maps URLs to controller functions (`GET /`, `GET /tags`,
  `GET /mine`, `POST /`, `PATCH /:id`, `DELETE /:id`). Ownership is checked against
  `req.userId`, so it must be mounted behind auth middleware that sets it.

## Dependency on Thesis Supervisors
This feature is **not fully standalone** — `services/thesisGroupService.js` imports
`ALL_TAGS` from `services/taggingService.js` so both features share one research-area tag
list. If you copy this feature into another project without thesis-supervisors, either
bring that file along too or replace the import with your own tag list.

## Integrate
1. Copy the files listed above into the matching folders of your project.
2. Mount the router in [`routes/index.js`](../routes/index.js):
   ```js
   const thesisGroupRoutes = require("./thesisGroupRoutes");
   router.use("/thesis-groups", requireAuth, thesisGroupRoutes); // requireAuth must set req.userId
   ```
3. No data load needed — posts are created directly through the API as students use the board.
