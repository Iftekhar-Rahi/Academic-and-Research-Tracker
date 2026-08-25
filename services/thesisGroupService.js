const ThesisGroupPost = require("../models/ThesisGroupPost");
const ApiError = require("../utils/ApiError");
const { ALL_TAGS } = require("./taggingService");
const { POST_TYPES, POST_STATUSES } = require("../config/constants");

// group-only vs individual-only fields, so create/edit only ever touch what's relevant to the post's type
const GROUP_FIELDS = ["topic", "proposedSupervisor", "currentMembers", "membersNeeded", "skillsNeeded"];
const INDIVIDUAL_FIELDS = ["skills"];
const COMMON_FIELDS = ["researchAreas", "description"];

// pulls out only the fields that make sense for the given post type, so a "group" post
// can't end up with leftover "skills" from an individual post, and vice versa
function pickFields(type, body) {
  const allowed = [...COMMON_FIELDS, ...(type === "group" ? GROUP_FIELDS : INDIVIDUAL_FIELDS)];
  const picked = {};
  for (const field of allowed) {
    if (body[field] !== undefined) picked[field] = body[field];
  }
  return picked;
}

// finds a post and makes sure the person asking is the one who posted it
async function findOwnedPost(id, userId, action) {
  const post = await ThesisGroupPost.findById(id);
  if (!post) {
    throw ApiError.notFound("Post not found");
  }
  if (post.postedBy.toString() !== userId) {
    throw ApiError.forbidden(`You can only ${action} your own posts`);
  }
  return post;
}

// the research tags posts can be filtered and tagged by - the same list the
// Thesis Supervisors feature uses, so the two features stay in step
function listTags() {
  return ALL_TAGS;
}

// one student's own posts, open and closed, newest first
async function listPostsByUser(userId) {
  return ThesisGroupPost.find({ postedBy: userId }).sort({ createdAt: -1 });
}

// the public board: only open posts, optionally narrowed by type and/or research area
async function listOpenPosts({ type, researchArea } = {}) {
  const filter = { status: "open" };

  if (POST_TYPES.includes(type)) filter.type = type;
  if (researchArea) filter.researchAreas = researchArea;

  return ThesisGroupPost.find(filter)
    .populate("postedBy", "name email")
    .sort({ createdAt: -1 });
}

// saves a new post from a logged-in student
async function createPost(userId, body) {
  const { type } = body;
  if (!POST_TYPES.includes(type)) {
    throw ApiError.badRequest("Post type must be 'group' or 'individual'");
  }

  return ThesisGroupPost.create({
    postedBy: userId,
    type,
    ...pickFields(type, body),
  });
}

// edits a post's fields and/or toggles its status, but only for the student who posted it
async function updatePost(id, userId, body) {
  const post = await findOwnedPost(id, userId, "edit");

  Object.assign(post, pickFields(post.type, body));

  if (POST_STATUSES.includes(body.status)) {
    post.status = body.status;
  }

  await post.save();
  return post;
}

// removes a post, but only for the student who posted it
async function deletePost(id, userId) {
  const post = await findOwnedPost(id, userId, "delete");
  await post.deleteOne();
}

module.exports = { listTags, listPostsByUser, listOpenPosts, createPost, updatePost, deletePost };
