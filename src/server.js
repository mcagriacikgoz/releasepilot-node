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
 * Cloud Run captures stdout, so console.log is fine.
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
        version: VERSION,
        commit: COMMIT_SHA,
        reqId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        duration_ms: ms,
      })
    );
  });

  next();
});

/**
 * Root endpoint: HTML dashboard (visual proof)
 */
app.get("/", (req, res) => {
  const html = `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${SERVICE_NAME} – ${ENV}</title>
  <style>
    :root { color-scheme: dark; }
    body {
      margin:0;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
      background:#0b1020;
      color:#e8ebff;
    }
    .wrap { max-width: 920px; margin: 0 auto; padding: 32px 18px; }
    .card {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 18px;
      padding: 22px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.25);
    }
    .topbar { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
    .pill {
      display:inline-block;
      padding: 6px 10px;
      border-radius: 999px;
      background: rgba(79, 131, 255, 0.18);
      border:1px solid rgba(79, 131, 255, 0.35);
    }
    .envbadge {
      padding: 6px 10px;
      border-radius: 999px;
      background: rgba(34,197,94,0.14);
      border: 1px solid rgba(34,197,94,0.35);
      font-size: 12px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: rgba(232,235,255,0.92);
      white-space: nowrap;
    }
    h1 { margin: 10px 0 6px; font-size: 28px; }
    p { margin: 0 0 14px; color: rgba(232,235,255,0.75); }
    .grid { display:grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }
    .kv {
      background: rgba(0,0,0,0.18);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 14px;
      padding: 12px;
    }
    .k { font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(232,235,255,0.6); }
    .v { margin-top: 6px; font-size: 14px; word-break: break-word; }
    .actions { display:flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }
    a.btn {
      text-decoration:none;
      color:#e8ebff;
      padding: 10px 12px;
      border-radius: 12px;
      background: rgba(255,255,255,0.08);
      border:1px solid rgba(255,255,255,0.14);
      display:inline-block;
    }
    a.btn:hover { background: rgba(255,255,255,0.12); }
    footer { margin-top: 14px; font-size: 12px; color: rgba(232,235,255,0.55); }
    .signature { margin-top: 10px; font-size: 12px; color: rgba(232,235,255,0.7); }
    .signature strong { color: rgba(232,235,255,0.95); }
    @media (max-width:720px){ .grid{ grid-template-columns:1fr; } }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="topbar">
        <div>
          <span class="pill">ReleasePilot • Cloud Run</span>
          <h1>${SERVICE_NAME}</h1>
          <p>Live environment dashboard (CI/CD proof).</p>
        </div>
        <div class="envbadge">${ENV}</div>
      </div>

      <div class="grid">
        <div class="kv"><div class="k">Environment</div><div class="v">${ENV}</div></div>
        <div class="kv"><div class="k">Version</div><div class="v">${VERSION}</div></div>
        <div class="kv"><div class="k">Commit</div><div class="v">${COMMIT_SHA}</div></div>
        <div class="kv"><div class="k">Timestamp</div><div class="v">${new Date().toISOString()}</div></div>
      </div>

      <div class="actions">
        <a class="btn" href="/health">/health</a>
        <a class="btn" href="/info">/info</a>
      </div>

      <footer>Tip: different branches deploy to different environments (dev/qa/staging).</footer>

      <div class="signature">
        Created by <strong>Çağrı Açıkgöz</strong><br/>
        Intel Cloud DevOps Competency
      </div>
    </div>
  </div>
</body>
</html>`;

  res.status(200).type("html").send(html);
});

/**
 * Health checks - liveness
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
    timestamp: new Date().toISOString(),
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
      commit: COMMIT_SHA,
    },
  });
});

/**
 * 404 handler (keeps responses consistent)
 */
app.use((req, res) => {
  res.status(404).json({
    error: "not_found",
    message: "Route does not exist",
    path: req.originalUrl,
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
      version: VERSION,
      commit: COMMIT_SHA,
      reqId: req.reqId,
      message: err?.message || "unknown_error",
      stack: err?.stack,
    })
  );

  res.status(500).json({
    error: "internal_error",
    message: "Something went wrong",
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
      port: PORT,
    })
  );
});