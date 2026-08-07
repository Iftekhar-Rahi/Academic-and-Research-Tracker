const express = require("express");
const ThesisGroupPost = require("./ThesisGroupPost");
const { ALL_TAGS } = require("../thesis-supervisors/tagging");

const router = express.Router();

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

// runs when the page wants the list of research tags to filter/tag posts by
// (GET /api/thesis-groups/tags) - reuses the same tag list as the Thesis Supervisors feature
router.get("/tags", (req, res) => {
  res.json({ tags: ALL_TAGS });
});

// runs when the page wants the current user's own posts, open and closed
// (GET /api/thesis-groups/mine) - kept above the /:id route so express doesn't mistake "mine" for an id
router.get("/mine", async (req, res) => {
  try {
    const posts = await ThesisGroupPost.find({ postedBy: req.userId }).sort({ createdAt: -1 });
    res.json({ count: posts.length, posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong, please try again" });
  }
});

// runs when the board wants the list of open posts, with optional filters
// (GET /api/thesis-groups?type=group|individual&researchArea=...)
router.get("/", async (req, res) => {
  try {
    const { type, researchArea } = req.query;
    const filter = { status: "open" };

    if (type === "group" || type === "individual") filter.type = type;
    if (researchArea) filter.researchAreas = researchArea;

    const posts = await ThesisGroupPost.find(filter)
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ count: posts.length, posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong, please try again" });
  }
});

// runs when a logged-in student creates a new post (POST /api/thesis-groups)
router.post("/", async (req, res) => {
  try {
    const { type } = req.body;
    if (type !== "group" && type !== "individual") {
      return res.status(400).json({ message: "Post type must be 'group' or 'individual'" });
    }

    const post = await ThesisGroupPost.create({
      postedBy: req.userId,
      type,
      ...pickFields(type, req.body),
    });

    res.status(201).json({ post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong, please try again" });
  }
});

// runs when the owner edits their own post's fields and/or toggles its status
// (PATCH /api/thesis-groups/:id)
router.patch("/:id", async (req, res) => {
  try {
    const post = await ThesisGroupPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.postedBy.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only edit your own posts" });
    }

    Object.assign(post, pickFields(post.type, req.body));

    if (req.body.status === "open" || req.body.status === "closed") {
      post.status = req.body.status;
    }

    await post.save();
    res.json({ post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong, please try again" });
  }
});

// runs when the owner deletes their own post (DELETE /api/thesis-groups/:id)
router.delete("/:id", async (req, res) => {
  try {
    const post = await ThesisGroupPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.postedBy.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong, please try again" });
  }
});

module.exports = router;
