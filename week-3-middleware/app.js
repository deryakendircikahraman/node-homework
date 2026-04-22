const express = require("express");
const { randomUUID } = require("crypto");
const path = require("path");
const dogsRouter = require("./routes/dogs");
const { ValidationError, NotFoundError, UnauthorizedError } = require("./errors");

const app = express();

// Request ID middleware (must run first)
app.use((req, res, next) => {
  req.requestId = randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  next();
});

// Logging middleware (runs after requestId)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}]: ${req.method} ${req.path} (${req.requestId})`);
  next();
});

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// Built-in middleware: JSON parsing with request size limit
app.use(express.json({ limit: "1mb" }));

// Content-Type validation (POST only)
app.use((req, res, next) => {
  if (req.method === "POST") {
    const contentType = req.get("Content-Type");
    if (!contentType || !contentType.toLowerCase().includes("application/json")) {
      return res.status(400).json({
        error: "Content-Type must be application/json",
        requestId: req.requestId,
      });
    }
  }
  next();
});

// Static file middleware for dog images
app.use("/images", express.static(path.join(__dirname, "../public/images")));

app.use('/', dogsRouter); // Do not remove this line

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (
    err instanceof ValidationError ||
    err instanceof NotFoundError ||
    err instanceof UnauthorizedError ||
    (statusCode >= 400 && statusCode < 500)
  ) {
    console.warn(`WARN: ${err.name} ${err.message}`);
  } else {
    console.error(`ERROR: Error ${err.message}`);
  }

  if (statusCode >= 500) {
    return res.status(500).json({ error: "Internal Server Error", requestId: req.requestId });
  }

  return res.status(statusCode).json({ error: err.message, requestId: req.requestId });
});

// 404 handler (must be last)
app.use((req, res) => {
  res.status(404).json({ error: "Route not found", requestId: req.requestId });
});

const server = app.listen(3000, () => console.log("Server listening on port 3000"));
module.exports = server;