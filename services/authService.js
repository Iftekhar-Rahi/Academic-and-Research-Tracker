const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

const TOKEN_EXPIRY = "7d";
const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 6;

// creates the login token the client stores and sends back on every protected request
function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

// the only user fields we ever send to the client - never the password hash
function toPublicUser(user) {
  return { id: user._id, name: user.name, email: user.email };
}

// signs a new student up and logs them straight in
async function register({ name, email, password }) {
  // make sure nothing is empty
  if (!name || !email || !password) {
    throw ApiError.badRequest("Please fill in all fields");
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw ApiError.badRequest(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  // check if this email is already used
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw ApiError.badRequest("An account with this email already exists");
  }

  // hash the password before saving it, so we never store the real password
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
  });

  return { token: createToken(user._id), user: toPublicUser(user) };
}

// checks an existing student's email and password and hands back a fresh token
async function login({ email, password }) {
  if (!email || !password) {
    throw ApiError.badRequest("Please fill in all fields");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // deliberately the same message as a wrong password, so this can't be used to
    // find out which emails have accounts
    throw ApiError.badRequest("Invalid email or password");
  }

  // check the password matches the saved hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw ApiError.badRequest("Invalid email or password");
  }

  return { token: createToken(user._id), user: toPublicUser(user) };
}

// used to check the saved token still points at a real user
async function getUserById(userId) {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  return toPublicUser(user);
}

module.exports = { register, login, getUserById };
