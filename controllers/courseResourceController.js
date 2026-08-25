const asyncHandler = require("../utils/asyncHandler");
const courseResourceService = require("../services/courseResourceService");

// GET /api/course-resources/courses - the fixed list of course codes for the dropdown
const listCourses = asyncHandler(async (req, res) => {
  res.json({ courses: courseResourceService.listCourses() });
});

// GET /api/course-resources?courseCode=CSE370&type=Video - the shared resources, filtered
const listResources = asyncHandler(async (req, res) => {
  const { courseCode, type } = req.query;
  const resources = await courseResourceService.listResources({ courseCode, type });
  res.json({ count: resources.length, resources });
});

// POST /api/course-resources - a logged-in student shares a new resource
const createResource = asyncHandler(async (req, res) => {
  const resource = await courseResourceService.createResource(req.userId, req.body);
  res.status(201).json({ resource });
});

// PUT /api/course-resources/:id - the uploader edits their own resource
const updateResource = asyncHandler(async (req, res) => {
  const resource = await courseResourceService.updateResource(req.params.id, req.userId, req.body);
  res.json({ resource });
});

// DELETE /api/course-resources/:id - the uploader deletes their own resource
const deleteResource = asyncHandler(async (req, res) => {
  await courseResourceService.deleteResource(req.params.id, req.userId);
  res.json({ message: "Resource deleted" });
});

module.exports = { listCourses, listResources, createResource, updateResource, deleteResource };
