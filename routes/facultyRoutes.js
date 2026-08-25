const express = require("express");
const facultyController = require("../controllers/facultyController");

const router = express.Router();

router.post("/scrape", facultyController.startScrape);
router.get("/scrape/status", facultyController.getScrapeStatus);

// kept above the /:facId route so express doesn't mistake "tags" for an id
router.get("/tags", facultyController.listTags);

router.get("/", facultyController.listFaculty);
router.get("/:facId", facultyController.getFaculty);

module.exports = router;
