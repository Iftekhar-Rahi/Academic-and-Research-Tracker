const express = require("express");
const Faculty = require("./Faculty");
const escapeRegExp = require("./escapeRegExp");
const { ALL_TAGS } = require("./tagging");
const scrapeJob = require("./scrapeJob");

const router = express.Router();

// runs when the "Update data" button on the page is pressed (POST /api/faculty/scrape).
// scraping takes a couple of minutes, so we start it in the background and reply right away with
// 202 ("accepted, still working on it") - the page then follows along via /scrape/status below
router.post("/scrape", (req, res) => {
  const result = scrapeJob.start();

  if (result === "running") {
    return res.status(409).json({ message: "An update is already running", status: scrapeJob.getStatus() });
  }

  if (result === "cooldown") {
    const seconds = Math.round(scrapeJob.COOLDOWN_MS / 1000);
    return res.status(429).json({
      message: `The data was just updated. Please wait about ${seconds} seconds before updating again.`,
      status: scrapeJob.getStatus(),
    });
  }

  res.status(202).json({ message: "Update started", status: scrapeJob.getStatus() });
});

// runs every couple of seconds while an update is going, so the page can show the progress
// (GET /api/faculty/scrape/status)
router.get("/scrape/status", (req, res) => {
  res.json({ status: scrapeJob.getStatus() });
});

// runs when the page wants the list of research tags and how many faculty have each
// (GET /api/faculty/tags) - kept above the /:facId route so express doesn't mistake "tags" for an id
router.get("/tags", async (req, res) => {
  try {
    const counts = await Faculty.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
    ]);

    const countByTag = Object.fromEntries(counts.map((c) => [c._id, c.count]));
    const tags = ALL_TAGS
      .map((name) => ({ name, count: countByTag[name] || 0 }))
      .sort((a, b) => b.count - a.count);

    res.json({ tags });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong, please try again" });
  }
});

// runs when the page wants the faculty list, with optional filters
// (GET /api/faculty?tag=...&search=...&accepting=true|false)
router.get("/", async (req, res) => {
  try {
    const { tag, search, accepting } = req.query;
    const filter = { isAlumni: { $ne: true } }; // never show alumni, even if one slips through the scraper

    // only faculty with this exact tag
    if (tag) filter.tags = tag;

    // only faculty currently accepting (or not accepting) students
    if (accepting === "true" || accepting === "false") {
      filter.accepting = accepting === "true";
    }

    // search box: match the text against name, position, or research interest
    if (search) {
      const re = new RegExp(escapeRegExp(search), "i");
      filter.$or = [{ name: re }, { position: re }, { researchInterestText: re }];
    }

    const faculty = await Faculty.find(filter)
      .select("-__v -isAlumni -isSupervise")
      .sort({ name: 1 });

    res.json({ count: faculty.length, faculty });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong, please try again" });
  }
});

// runs when the page wants one faculty member's full details (GET /api/faculty/:facId)
router.get("/:facId", async (req, res) => {
  try {
    const facId = Number(req.params.facId);
    if (Number.isNaN(facId)) {
      return res.status(400).json({ message: "Invalid faculty id" });
    }

    const faculty = await Faculty.findOne({ facId }).select("-__v -isAlumni -isSupervise");
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    res.json({ faculty });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong, please try again" });
  }
});

module.exports = router;
