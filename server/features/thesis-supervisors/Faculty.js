const mongoose = require("mongoose");

// this describes what fields a faculty member has in the database
// one document = one BRACU CSE faculty member, filled in by the scrape script (see scrape.js)
const facultySchema = new mongoose.Schema({
  facId: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true, // bracket tag stripped, e.g. "Dr. Badhan Das"
  },
  shortTag: {
    type: String,
    default: null, // e.g. "NBD" pulled out of "[NBD]"
  },
  profileUrl: {
    type: String,
    required: true,
  },
  photoUrl: {
    type: String,
    default: "",
  },
  position: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    default: "",
    lowercase: true,
  },
  accepting: {
    type: Boolean,
    default: false,
  },
  levelRaw: {
    type: String,
    default: "", // raw badge text from the list page, e.g. "U & P"
  },
  supervisesUndergrad: {
    type: Boolean,
    default: false,
  },
  supervisesGrad: {
    type: Boolean,
    default: false,
  },
  isSupervise: {
    type: Boolean,
    default: true, // kept from the source site's data, for reference
  },
  isAlumni: {
    type: Boolean,
    default: false, // scraper skips alumni at insert time, but the field is kept in case that policy changes
  },
  researchInterestText: {
    type: String,
    default: "",
  },
  roles: {
    type: [String],
    default: [], // e.g. ["Supervisor", "Co-supervisor"], from the profile page's Thesis "As:" row
  },
  tags: {
    type: [String],
    default: [],
  },
  lastScrapedAt: {
    type: Date,
  },
}, { timestamps: true });

facultySchema.index({ tags: 1 });

module.exports = mongoose.model("Faculty", facultySchema);
