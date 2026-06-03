function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(error, req, res, next) {
  if (error.name === "ZodError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.errors.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const status = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(status).json({
    message: error.message || "Server error",
  });
}

module.exports = { notFound, errorHandler };
