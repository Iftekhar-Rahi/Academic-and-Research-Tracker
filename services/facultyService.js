const Faculty = require("../models/Faculty");
const ApiError = require("../utils/ApiError");
const escapeRegExp = require("../utils/escapeRegExp");
const { ALL_TAGS } = require("./taggingService");
const scrapeJob = require("./scrapeJobService");

// fields we never send to the page - internal bookkeeping kept from the source site
const HIDDEN_FIELDS = "-__v -isAlumni -isSupervise";

// every research tag with how many faculty currently have it, busiest tag first
async function listTagsWithCounts() {
  const counts = await Faculty.aggregate([
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
  ]);

  const countByTag = Object.fromEntries(counts.map((c) => [c._id, c.count]));

  return ALL_TAGS
    .map((name) => ({ name, count: countByTag[name] || 0 }))
    .sort((a, b) => b.count - a.count);
}

// the faculty directory, in name order, optionally narrowed by tag, search text and availability
async function listFaculty({ tag, search, accepting } = {}) {
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

  return Faculty.find(filter).select(HIDDEN_FIELDS).sort({ name: 1 });
}

// one faculty member's full details, looked up by the id the source site uses
async function getFacultyByFacId(rawFacId) {
  const facId = Number(rawFacId);
  if (Number.isNaN(facId)) {
    throw ApiError.badRequest("Invalid faculty id");
  }

  const faculty = await Faculty.findOne({ facId }).select(HIDDEN_FIELDS);
  if (!faculty) {
    throw ApiError.notFound("Faculty not found");
  }

  return faculty;
}

// kicks off a background re-scrape of BRACU's site, or explains why it won't run right now
function startScrape() {
  const result = scrapeJob.start();

  if (result === "running") {
    throw ApiError.conflict("An update is already running", { status: scrapeJob.getStatus() });
  }

  if (result === "cooldown") {
    const seconds = Math.round(scrapeJob.COOLDOWN_MS / 1000);
    throw ApiError.tooManyRequests(
      `The data was just updated. Please wait about ${seconds} seconds before updating again.`,
      { status: scrapeJob.getStatus() }
    );
  }

  return scrapeJob.getStatus();
}

// how far along the running scrape is, so the page can show progress
function getScrapeStatus() {
  return scrapeJob.getStatus();
}

module.exports = {
  listTagsWithCounts,
  listFaculty,
  getFacultyByFacId,
  startScrape,
  getScrapeStatus,
};
