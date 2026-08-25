const express = require("express");
const courseResourceController = require("../controllers/courseResourceController");

const router = express.Router();

// kept above the / route so the fixed course list is easy to spot
router.get("/courses", courseResourceController.listCourses);

router.get("/", courseResourceController.listResources);
router.post("/", courseResourceController.createResource);
router.put("/:id", courseResourceController.updateResource);
router.delete("/:id", courseResourceController.deleteResource);

module.exports = router;
