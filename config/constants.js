// Fixed lists the app validates against. These live here rather than in a database collection
// because the department doesn't need to add/remove them through the app itself.

// BRAC University CSE course codes that a resource can be tagged with
const COURSE_CODES = [
  "CSE110",
  "CSE111",
  "CSE220",
  "CSE221",
  "CSE230",
  "CSE251",
  "CSE320",
  "CSE330",
  "CSE340",
  "CSE370",
  "CSE420",
  "CSE421",
  "CSE422",
  "CSE423",
  "CSE460",
  "CSE470",
  "CSE471",
  "CSE472",
  "CSE490",
];

// what kind of thing a shared course resource is
const RESOURCE_TYPES = ["Lecture Slides", "Notes", "Question Bank", "Video", "Book/PDF", "Other"];

// a thesis group post is either a group looking for members, or a student looking for a group
const POST_TYPES = ["group", "individual"];

// whether a thesis group post is still looking, or has been filled
const POST_STATUSES = ["open", "closed"];

// a shared resource must be a link, not an uploaded file
const URL_PATTERN = /^https?:\/\/.+/i;

module.exports = { COURSE_CODES, RESOURCE_TYPES, POST_TYPES, POST_STATUSES, URL_PATTERN };
