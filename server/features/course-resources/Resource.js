const mongoose = require("mongoose");
const { COURSE_CODES } = require("./courseList");

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
    enum: ["Lecture Slides", "Notes", "Question Bank", "Video", "Book/PDF", "Other"],
    required: true,
  },
  url: {
    type: String,
    required: true,
    match: [/^https?:\/\/.+/i, "URL must start with http:// or https://"],
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
