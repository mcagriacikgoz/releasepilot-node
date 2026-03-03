const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;
const ENV = process.env.ENV || "local";
const SERVICE_NAME = process.env.SERVICE_NAME || "releasepilot";
const VERSION = process.env.VERSION || "dev";
const COMMIT_SHA = process.env.COMMIT_SHA || "unknown";

app.get("/health", (req, res) => res.status(200).send("ok"));

app.get("/info", (req, res) => {
  res.json({
    service: SERVICE_NAME,
    env: ENV,
    version: VERSION,
    commit: COMMIT_SHA,
    timestamp: new Date().toISOString()
  });
});

app.post("/echo", (req, res) => res.json({ received: req.body }));

app.listen(PORT, () => {
  console.log(`[${SERVICE_NAME}] up on :${PORT} env=${ENV} version=${VERSION} commit=${COMMIT_SHA}`);
});