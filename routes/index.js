const express = require("express");
const requireAuth = require("../middleware/authMiddleware");
const authRoutes = require("./authRoutes");
const facultyRoutes = require("./facultyRoutes");
const thesisGroupRoutes = require("./thesisGroupRoutes");
const courseResourceRoutes = require("./courseResourceRoutes");

// One place that lists every URL prefix the API answers on. Adding a feature means adding
// its model, controller and route file, then one line here.
const router = express.Router();

// register / login / check my token
router.use("/auth", authRoutes);

// thesis supervisor directory, filled in by npm run scrape (see scripts/scrape.js)
router.use("/faculty", requireAuth, facultyRoutes);

// thesis group finder board - students posting to find groupmates or a group to join
router.use("/thesis-groups", requireAuth, thesisGroupRoutes);

// course resources board - students sharing links to slides, notes, question banks, etc.
router.use("/course-resources", requireAuth, courseResourceRoutes);

module.exports = router;
