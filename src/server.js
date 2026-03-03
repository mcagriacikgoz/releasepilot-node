const express = require("express");
const crypto = require("crypto");

const app = express();

/**
 * Basics
 * Cloud Run expects PORT=8080 by default.
 * We'll drive everything via env vars so dev/qa/staging/prod are easy.
 */
const PORT = Number(process.env.PORT) || 8080;

const ENV = process.env.ENV || "local";
const SERVICE_NAME = process.env.SERVICE_NAME || "releasepilot-node";
const VERSION = process.env.VERSION || "dev";
const COMMIT_SHA = process.env.COMMIT_SHA || "unknown";

/**
 * Middleware: JSON parsing (limit keeps you safe from stupidly large payloads)
 */
app.use(express.json({ limit: "1mb" }));

/**
 * Middleware: request id + basic request logging
 * Cloud Run already captures stdout, so console.log is fine for now.
 */
app.use((req, res, next) => {
  const reqId = req.header("x-request-id") || crypto.randomUUID();
  res.setHeader("x-request-id", reqId);
  req.reqId = reqId;

  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(
      JSON.stringify({
        level: "info",
        service: SERVICE_NAME,
        env: ENV,
        commit: COMMIT_SHA,
        reqId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        duration_ms: ms
      })
    );
  });

  next();
});

/**
 * Root endpoint: nice landing page (no more "Cannot GET /" embarrassment)
 */
app.get("/", (req, res) => {
  res.status(200).json({
    message: `${SERVICE_NAME} is live`,
    env: ENV,
    version: VERSION,
    commit: COMMIT_SHA,
    endpoints: ["/health", "/info", "/echo"]
  });
});

/**
 * Health checks
 * - liveness: is the process up?
 */
app.get("/health", (req, res) => {
  res.status(200).send("ok");
});

/**
 * Info endpoint: proves which environment & revision is running
 */
app.get("/info", (req, res) => {
  res.status(200).json({
    service: SERVICE_NAME,
    env: ENV,
    version: VERSION,
    commit: COMMIT_SHA,
    timestamp: new Date().toISOString()
  });
});

/**
 * Echo: useful for QA smoke tests
 */
app.post("/echo", (req, res) => {
  res.status(200).json({
    received: req.body,
    meta: {
      env: ENV,
      commit: COMMIT_SHA
    }
  });
});

/**
 * 404 handler (keeps responses consistent)
 */
app.use((req, res) => {
  res.status(404).json({
    error: "not_found",
    message: "Route does not exist",
    path: req.originalUrl
  });
});

/**
 * Error handler (last resort)
 */
app.use((err, req, res, next) => {
  console.error(
    JSON.stringify({
      level: "error",
      service: SERVICE_NAME,
      env: ENV,
      commit: COMMIT_SHA,
      reqId: req.reqId,
      message: err?.message || "unknown_error",
      stack: err?.stack
    })
  );

  res.status(500).json({
    error: "internal_error",
    message: "Something went wrong"
  });
});

app.listen(PORT, () => {
  console.log(
    JSON.stringify({
      level: "info",
      message: "server_started",
      service: SERVICE_NAME,
      env: ENV,
      version: VERSION,
      commit: COMMIT_SHA,
      port: PORT
    })
  );
});