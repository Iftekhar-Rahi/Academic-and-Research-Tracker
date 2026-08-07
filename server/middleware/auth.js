const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // 1. Get token from either header format
  let token = req.header("x-auth-token") || req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // 2. Clean 'Bearer ' prefix if present
  if (typeof token === "string" && token.startsWith("Bearer ")) {
    token = token.slice(7).trim();
  }

  try {
    // 3. Verify token with secret key
    const secret = process.env.JWT_SECRET || "yourJWTSecret";
    const decoded = jwt.verify(token, secret);

    // 4. Attach decoded token directly to req.user
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    res.status(401).json({ message: "Token is not valid or has expired" });
  }
};