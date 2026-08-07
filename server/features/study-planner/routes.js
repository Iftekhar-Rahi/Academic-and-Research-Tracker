const express = require("express");
const router = express.Router();
const StudyPlan = require("./StudyPlan");
const auth = require("../../middleware/auth");

// Comprehensive User ID Extractor
const getUserId = (req) => {
  if (!req.user) return null;

  // Check all standard JWT & Mongoose user representations
  if (req.user._id) return req.user._id;
  if (req.user.id) return req.user.id;
  if (req.user.userId) return req.user.userId;
  if (req.user.sub) return req.user.sub;

  // Check nested structures (e.g. req.user.user or req.user._doc)
  if (req.user.user) {
    return req.user.user._id || req.user.user.id || req.user.user.userId;
  }
  if (req.user._doc) {
    return req.user._doc._id || req.user._doc.id;
  }

  // If req.user is a string ID
  if (typeof req.user === "string") return req.user;

  return null;
};

// GET all study plans
router.get("/", auth, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      console.log("👉 GET DEBUG req.user:", req.user);
      return res.status(401).json({ message: "Authentication required. Please log in again." });
    }

    const plans = await StudyPlan.find({ user: userId }).sort({ date: 1 });
    res.json(plans);
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ message: "Server error fetching study plans" });
  }
});

// POST new study plan
router.post("/", auth, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      console.log("👉 POST DEBUG req.user:", req.user);
      console.log("👉 POST DEBUG req.headers:", req.headers);
      return res.status(401).json({ message: "Authentication required. Please log in again." });
    }

    const { title, course, date, timeSlot, category } = req.body;

    const newPlan = new StudyPlan({
      user: userId,
      title,
      course,
      date: new Date(date),
      timeSlot: timeSlot || "Flexible",
      category: category || "Exam Prep",
    });

    const savedPlan = await newPlan.save();
    res.status(201).json(savedPlan);
  } catch (err) {
    console.error("Create Error:", err);
    res.status(400).json({ message: err.message || "Failed to create study plan" });
  }
});

// PATCH update task
router.patch("/:id", auth, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const plan = await StudyPlan.findOne({ _id: req.params.id, user: userId });
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    if (req.body.isCompleted !== undefined) plan.isCompleted = req.body.isCompleted;
    if (req.body.title) plan.title = req.body.title;
    if (req.body.date) plan.date = req.body.date;

    await plan.save();
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: "Error updating study plan" });
  }
});

// DELETE task
router.delete("/:id", auth, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const plan = await StudyPlan.findOneAndDelete({ _id: req.params.id, user: userId });
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    res.json({ message: "Study plan deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting study plan" });
  }
});

module.exports = router;