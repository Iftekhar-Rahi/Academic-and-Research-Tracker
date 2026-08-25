const ApiError = require("../utils/ApiError");

// Last middleware in the stack: turns anything thrown by a controller or service into a
// JSON response. Express only treats a 4-argument function as an error handler, so `next`
// must stay in the signature even though it isn't used.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message, ...(err.extra || {}) });
  }

  // anything else is a bug or an unexpected failure - log it for us, stay vague for the user
  console.error(err);
  res.status(500).json({ message: "Something went wrong, please try again" });
}

// Runs when no route matched the request at all.
function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
}

module.exports = { errorHandler, notFoundHandler };
