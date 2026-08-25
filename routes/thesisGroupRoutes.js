const express = require("express");
const thesisGroupController = require("../controllers/thesisGroupController");

const router = express.Router();

router.get("/tags", thesisGroupController.listTags);

// kept above the /:id route so express doesn't mistake "mine" for an id
router.get("/mine", thesisGroupController.listMyPosts);

router.get("/", thesisGroupController.listPosts);
router.post("/", thesisGroupController.createPost);
router.patch("/:id", thesisGroupController.updatePost);
router.delete("/:id", thesisGroupController.deletePost);

module.exports = router;
