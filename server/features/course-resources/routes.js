const express = require("express");
const Resource = require("./Resource");
const { COURSE_CODES } = require("./courseList");

const router = express.Router();

const RESOURCE_TYPES = ["Lecture Slides", "Notes", "Question Bank", "Video", "Book/PDF", "Other"];
const URL_PATTERN = /^https?:\/\/.+/i;

// checks the fields a resource is created/edited with, so the caller gets a clear 400
// instead of a generic 500 from mongoose's own validation
function validateResourceFields({ courseCode, title, type, url }) {
  if (!courseCode || !COURSE_CODES.includes(courseCode)) {
    return `courseCode must be one of: ${COURSE_CODES.join(", ")}`;
  }
  if (!title) {
    return "Title is required";
  }
  if (!type || !RESOURCE_TYPES.includes(type)) {
    return `Type must be one of: ${RESOURCE_TYPES.join(", ")}`;
  }
  if (!url || !URL_PATTERN.test(url)) {
    return "Please provide a valid URL (starting with http:// or https://)";
  }
  return null;
}

// runs when the page wants the fixed list of course codes for the dropdown
// (GET /api/course-resources/courses) - kept above the / route for clarity
router.get("/courses", (req, res) => {
  res.json({ courses: COURSE_CODES });
});

// runs when the page wants the list of resources, with optional filters
// (GET /api/course-resources?courseCode=CSE370&type=Video)
router.get("/", async (req, res) => {
  try {
    const { courseCode, type } = req.query;
    const filter = {};

    if (courseCode) filter.courseCode = courseCode;
    if (type) filter.type = type;

    const resources = await Resource.find(filter)
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ count: resources.length, resources });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong, please try again" });
  }
});

// runs when a logged-in student shares a new resource (POST /api/course-resources)
router.post("/", async (req, res) => {
  try {
    const { courseCode, title, type, url, description } = req.body;

    const validationError = validateResourceFields({ courseCode, title, type, url });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const resource = await Resource.create({
      courseCode,
      title,
      type,
      url,
      description,
      uploadedBy: req.userId,
    });

    res.status(201).json({ resource });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong, please try again" });
  }
});

// runs when the uploader edits their own resource (PUT /api/course-resources/:id)
router.put("/:id", async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }
    if (resource.uploadedBy.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only edit your own resources" });
    }

    const { courseCode, title, type, url, description } = req.body;
    const validationError = validateResourceFields({ courseCode, title, type, url });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    resource.courseCode = courseCode;
    resource.title = title;
    resource.type = type;
    resource.url = url;
    resource.description = description;

    await resource.save();
    res.json({ resource });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong, please try again" });
  }
});

// runs when the uploader deletes their own resource (DELETE /api/course-resources/:id)
router.delete("/:id", async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }
    if (resource.uploadedBy.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only delete your own resources" });
    }

    await resource.deleteOne();
    res.json({ message: "Resource deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong, please try again" });
  }
});

module.exports = router;
