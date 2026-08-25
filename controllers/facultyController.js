const asyncHandler = require("../utils/asyncHandler");
const facultyService = require("../services/facultyService");

// POST /api/faculty/scrape - the "Update data" button on the page.
// scraping takes a couple of minutes, so the job starts in the background and we reply
// right away with 202 ("accepted, still working on it") - the page then follows along
// via GET /scrape/status below
const startScrape = asyncHandler(async (req, res) => {
  const status = facultyService.startScrape();
  res.status(202).json({ message: "Update started", status });
});

// GET /api/faculty/scrape/status - polled every couple of seconds while an update is going
const getScrapeStatus = asyncHandler(async (req, res) => {
  res.json({ status: facultyService.getScrapeStatus() });
});

// GET /api/faculty/tags - the research tags and how many faculty have each
const listTags = asyncHandler(async (req, res) => {
  const tags = await facultyService.listTagsWithCounts();
  res.json({ tags });
});

// GET /api/faculty?tag=...&search=...&accepting=true|false - the faculty list, filtered
const listFaculty = asyncHandler(async (req, res) => {
  const { tag, search, accepting } = req.query;
  const faculty = await facultyService.listFaculty({ tag, search, accepting });
  res.json({ count: faculty.length, faculty });
});

// GET /api/faculty/:facId - one faculty member's full details
const getFaculty = asyncHandler(async (req, res) => {
  const faculty = await facultyService.getFacultyByFacId(req.params.facId);
  res.json({ faculty });
});

module.exports = { startScrape, getScrapeStatus, listTags, listFaculty, getFaculty };
