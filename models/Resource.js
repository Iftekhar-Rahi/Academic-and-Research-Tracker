const mongoose = require("mongoose");
const { COURSE_CODES, RESOURCE_TYPES, URL_PATTERN } = require("../config/constants");

// one document = one link to a course resource (slides, notes, a video, etc.) shared by a student
const resourceSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    enum: COURSE_CODES,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: RESOURCE_TYPES,
    required: true,
  },
  url: {
    type: String,
    required: true,
    match: [URL_PATTERN, "URL must start with http:// or https://"],
  },
  description: {
    type: String,
    default: "",
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Resource", resourceSchema, "resources");
