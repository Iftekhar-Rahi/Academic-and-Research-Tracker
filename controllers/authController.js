const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/authService");

// Controllers only deal with HTTP: read the request, call the service, send the response.
// All the rules about what makes a valid signup live in services/authService.js.

// POST /api/auth/register - someone signs up
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const result = await authService.register({ name, email, password });
  res.status(201).json(result);
});

// POST /api/auth/login - someone logs in
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  res.json(result);
});

// GET /api/auth/me - check the saved token is still valid.
// requireAuth runs first and puts the id from the token on req.userId
const me = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.userId);
  res.json({ user });
});

module.exports = { register, login, me };
