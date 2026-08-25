// Wraps an async controller so a rejected promise is handed to express's error handler
// instead of being swallowed. Without this every controller needs its own try/catch.
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
