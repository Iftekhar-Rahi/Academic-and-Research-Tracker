// fixed list of BRAC University CSE course codes that a resource can be tagged with -
// kept hardcoded rather than a separate Course collection, since the department doesn't
// need to add/remove courses through the app itself
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

module.exports = { COURSE_CODES };
