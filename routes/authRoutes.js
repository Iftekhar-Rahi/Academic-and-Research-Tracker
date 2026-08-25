const express = require("express");
const authController = require("../controllers/authController");
const requireAuth = require("../middleware/authMiddleware");

// Routes only map a URL to a controller function. No logic lives here.
const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

// requireAuth runs first and checks the token before the controller runs
router.get("/me", requireAuth, authController.me);

module.exports = router;
