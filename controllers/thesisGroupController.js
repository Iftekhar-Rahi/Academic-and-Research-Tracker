const asyncHandler = require("../utils/asyncHandler");
const thesisGroupService = require("../services/thesisGroupService");

// GET /api/thesis-groups/tags - research tags to filter/tag posts by
const listTags = asyncHandler(async (req, res) => {
  res.json({ tags: thesisGroupService.listTags() });
});

// GET /api/thesis-groups/mine - the current user's own posts, open and closed
const listMyPosts = asyncHandler(async (req, res) => {
  const posts = await thesisGroupService.listPostsByUser(req.userId);
  res.json({ count: posts.length, posts });
});

// GET /api/thesis-groups?type=group|individual&researchArea=... - the board of open posts
const listPosts = asyncHandler(async (req, res) => {
  const { type, researchArea } = req.query;
  const posts = await thesisGroupService.listOpenPosts({ type, researchArea });
  res.json({ count: posts.length, posts });
});

// POST /api/thesis-groups - a logged-in student creates a post
const createPost = asyncHandler(async (req, res) => {
  const post = await thesisGroupService.createPost(req.userId, req.body);
  res.status(201).json({ post });
});

// PATCH /api/thesis-groups/:id - the owner edits their post's fields and/or its status
const updatePost = asyncHandler(async (req, res) => {
  const post = await thesisGroupService.updatePost(req.params.id, req.userId, req.body);
  res.json({ post });
});

// DELETE /api/thesis-groups/:id - the owner deletes their own post
const deletePost = asyncHandler(async (req, res) => {
  await thesisGroupService.deletePost(req.params.id, req.userId);
  res.json({ message: "Post deleted" });
});

module.exports = { listTags, listMyPosts, listPosts, createPost, updatePost, deletePost };
