const Resource = require("../models/Resource");
const ApiError = require("../utils/ApiError");
const { COURSE_CODES, RESOURCE_TYPES, URL_PATTERN } = require("../config/constants");

// checks the fields a resource is created/edited with, so the caller gets a clear 400
// instead of a generic 500 from mongoose's own validation
function assertValidResourceFields({ courseCode, title, type, url }) {
  if (!courseCode || !COURSE_CODES.includes(courseCode)) {
    throw ApiError.badRequest(`courseCode must be one of: ${COURSE_CODES.join(", ")}`);
  }
  if (!title) {
    throw ApiError.badRequest("Title is required");
  }
  if (!type || !RESOURCE_TYPES.includes(type)) {
    throw ApiError.badRequest(`Type must be one of: ${RESOURCE_TYPES.join(", ")}`);
  }
  if (!url || !URL_PATTERN.test(url)) {
    throw ApiError.badRequest("Please provide a valid URL (starting with http:// or https://)");
  }
}

// finds a resource and makes sure the person asking is the one who uploaded it
async function findOwnedResource(id, userId, action) {
  const resource = await Resource.findById(id);
  if (!resource) {
    throw ApiError.notFound("Resource not found");
  }
  if (resource.uploadedBy.toString() !== userId) {
    throw ApiError.forbidden(`You can only ${action} your own resources`);
  }
  return resource;
}

// the fixed list of course codes the dropdown on the page is built from
function listCourses() {
  return COURSE_CODES;
}

// every shared resource, newest first, optionally narrowed by course and/or type
async function listResources({ courseCode, type } = {}) {
  const filter = {};

  if (courseCode) filter.courseCode = courseCode;
  if (type) filter.type = type;

  return Resource.find(filter)
    .populate("uploadedBy", "name email")
    .sort({ createdAt: -1 });
}

// saves a new resource shared by a logged-in student
async function createResource(userId, { courseCode, title, type, url, description }) {
  assertValidResourceFields({ courseCode, title, type, url });

  return Resource.create({
    courseCode,
    title,
    type,
    url,
    description,
    uploadedBy: userId,
  });
}

// updates a resource, but only for the student who uploaded it
async function updateResource(id, userId, { courseCode, title, type, url, description }) {
  const resource = await findOwnedResource(id, userId, "edit");

  assertValidResourceFields({ courseCode, title, type, url });

  resource.courseCode = courseCode;
  resource.title = title;
  resource.type = type;
  resource.url = url;
  resource.description = description;

  await resource.save();
  return resource;
}

// removes a resource, but only for the student who uploaded it
async function deleteResource(id, userId) {
  const resource = await findOwnedResource(id, userId, "delete");
  await resource.deleteOne();
}

module.exports = { listCourses, listResources, createResource, updateResource, deleteResource };
