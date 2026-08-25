// An error that carries the HTTP status code and the message we want the caller to see.
//
// Services throw this instead of writing to `res` themselves, which is what keeps the
// business logic (services) separate from the HTTP layer (controllers). The error handler
// middleware turns it back into a JSON response.
class ApiError extends Error {
  constructor(statusCode, message, extra = null) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.extra = extra; // any extra fields to merge into the JSON body, e.g. { status: ... }
  }

  static badRequest(message, extra) {
    return new ApiError(400, message, extra);
  }

  static unauthorized(message, extra) {
    return new ApiError(401, message, extra);
  }

  static forbidden(message, extra) {
    return new ApiError(403, message, extra);
  }

  static notFound(message, extra) {
    return new ApiError(404, message, extra);
  }

  static conflict(message, extra) {
    return new ApiError(409, message, extra);
  }

  static tooManyRequests(message, extra) {
    return new ApiError(429, message, extra);
  }
}

module.exports = ApiError;
