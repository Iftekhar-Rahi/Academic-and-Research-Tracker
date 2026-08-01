const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// runs when someone signs up (POST /api/auth/register)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // make sure nothing is empty
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // check if this email is already used
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    // hash the password before saving it, so we never store the real password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // save the new user in the database
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // create a login token for the new user
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong, please try again" });
  }
});

// runs when someone logs in (POST /api/auth/login)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    // find the user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // check the password matches the saved hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // password is correct, so give the user a login token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong, please try again" });
  }
});

// used to check if the saved token is still valid (GET /api/auth/me)
// requireAuth runs first and checks the token before this code runs
router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json({ user: { id: user._id, name: user.name, email: user.email } });
});

module.exports = router;
