import "dotenv/config";
import crypto from "crypto";
import fs from "fs";
import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";
import { dirname, extname, join } from "path";

/* ── environment validation ── */
const requiredEnvironment = ["JWT_SECRET"];
const missingEnvironment = requiredEnvironment.filter((key) => !process.env[key]);
if (missingEnvironment.length) {
  throw new Error(`Missing environment variables: ${missingEnvironment.join(", ")}`);
}

if (process.env.JWT_SECRET === "your-super-secret-jwt-key-change-this-in-production") {
  console.warn("[SECURITY] Using default JWT_SECRET — generate a strong random key for production.");
}

const app = express();
const port = Number(process.env.PORT || 3001);
const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "..", "database", "portfolio.db");
const uploadsDir = join(__dirname, "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const allowedImageMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);
const allowedImageExtensions = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]);

const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname || "").toLowerCase();
    const safeExt = allowedImageExtensions.has(ext) ? ext : ".bin";
    cb(null, `${crypto.randomUUID()}${safeExt}`);
  },
});

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedImageMimeTypes.has(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, GIF, WebP, and SVG images are allowed."));
    }
    return cb(null, true);
  },
});

/* ── database ── */
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) throw err;
  console.log("Connected to SQLite database");
});

const dbRun = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });

const dbAll = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });

/* ── security headers middleware ── */
app.use((_req, res, next) => {
  res.set({
    "Content-Security-Policy":
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: blob: https:; " +
      "media-src 'self' blob:; " +
      "connect-src 'self'; " +
      "frame-ancestors 'none'; " +
      "form-action 'self';",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "0",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  });
  next();
});

/* ── CORS ── */
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((s) => s.trim())
  : [];

app.use(
  cors({
    origin: allowedOrigins.length
      ? (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        }
      : false,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  })
);

app.use(express.json({ limit: "2mb" }));

/* ── static assets ── */
const distPath = join(__dirname, "..", "dist");
app.use("/media/uploads", express.static(uploadsDir));
app.use(express.static(distPath));

/* ── rate limiter (in-memory, no external dependency) ── */
const rateLimitWindow = 15 * 60 * 1000; // 15 minutes
const rateLimitMax = 100; // 100 requests per window
const authRateLimitMax = 15; // 15 login attempts per window
const rateLimitStore = new Map();

const cleanRateLimitStore = () => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now - entry.reset > rateLimitWindow) rateLimitStore.delete(key);
  }
};
setInterval(cleanRateLimitStore, 60_000);

const rateLimiter = (max = rateLimitMax) => (req, res, next) => {
  const key = req.ip || req.connection?.remoteAddress || "unknown";
  const now = Date.now();
  let entry = rateLimitStore.get(key);

  if (!entry || now - entry.reset > rateLimitWindow) {
    entry = { count: 0, reset: now };
    rateLimitStore.set(key, entry);
  }

  entry.count++;
  res.set("X-RateLimit-Limit", String(max));
  res.set("X-RateLimit-Remaining", String(Math.max(0, max - entry.count)));
  res.set("X-RateLimit-Reset", String(Math.ceil(entry.reset / 1000 + rateLimitWindow / 1000)));

  if (entry.count > max) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }
  next();
};

/* ── input sanitizers ── */
const sanitizeString = (value, maxLength = 5000) => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength).replace(/[<>]/g, "");
};

const sanitizeEmail = (value) => {
  if (typeof value !== "string") return "";
  const trimmed = value.trim().toLowerCase().slice(0, 254);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? trimmed : "";
};

const sanitizeProjectType = (value) => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 100).replace(/[<>]/g, "");
};

/* ── database init ── */
const initializeDatabase = async () => {
  const schema = `
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS site_content (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      content TEXT NOT NULL DEFAULT '{}',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      project_type TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'new' CHECK(status IN ('new', 'reviewed', 'responded', 'archived')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS media_assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL UNIQUE,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      url_path TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_inquiries_status_created ON inquiries(status, created_at);
    CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
    CREATE INDEX IF NOT EXISTS idx_media_assets_created ON media_assets(created_at);
  `;

  for (const statement of schema.split(";").filter((s) => s.trim())) {
    await dbRun(statement.trim());
  }
};

/* ── auth middleware ── */
const requireAdmin = (req, res, next) => {
  const header = req.get("authorization");
  const token = header?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Authentication required." });

  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: "Your session has expired. Sign in again." });
  }
};

/* ── content validation ── */
const validateContent = (content) =>
  content &&
  typeof content === "object" &&
  !Array.isArray(content) &&
  content.profile &&
  content.home &&
  content.social &&
  Array.isArray(content.projects) &&
  Array.isArray(content.partners) &&
  Array.isArray(content.posts);

const parseStoredContent = (content) =>
  typeof content === "string" ? JSON.parse(content) : content;

const sanitizeContentDeep = (obj) => {
  if (typeof obj === "string") return sanitizeString(obj, 10000);
  if (Array.isArray(obj)) return obj.map(sanitizeContentDeep);
  if (obj && typeof obj === "object") {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[sanitizeString(key, 256)] = sanitizeContentDeep(value);
    }
    return cleaned;
  }
  return obj;
};

const bootstrapAdmin = async () => {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) return;
  const users = await dbAll("SELECT id FROM admin_users WHERE email = ?", [
    process.env.ADMIN_EMAIL,
  ]);
  if (users.length) return;
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  await dbRun("INSERT INTO admin_users (email, password_hash) VALUES (?, ?)", [
    process.env.ADMIN_EMAIL,
    passwordHash,
  ]);
  console.log(`Created initial admin: ${process.env.ADMIN_EMAIL}`);
};

/* ── routes ── */

// Health check
app.get("/api/health", rateLimiter(30), async (_req, res) => {
  try {
    await dbAll("SELECT 1");
    res.json({ status: "ok" });
  } catch {
    res.status(500).json({ error: "Database unavailable" });
  }
});

// Public content
app.get("/api/content", rateLimiter(60), async (_req, res) => {
  try {
    const rows = await dbAll("SELECT content, updated_at FROM site_content WHERE id = 1");
    if (!rows.length) return res.status(404).json({ error: "Content has not been initialized." });
    return res.json({
      content: parseStoredContent(rows[0].content),
      updatedAt: rows[0].updated_at,
    });
  } catch {
    return res.status(500).json({ error: "Could not retrieve content." });
  }
});

// Login — strict rate limit against brute force
app.post("/api/auth/login", rateLimiter(authRateLimitMax), async (req, res) => {
  const email = sanitizeEmail(req.body?.email);
  const password = req.body?.password;

  if (!email || !password) {
    // Intentional slight delay to slow brute-force even on invalid input
    await new Promise((r) => setTimeout(r, 200 + Math.random() * 300));
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const users = await dbAll(
      "SELECT id, email, password_hash FROM admin_users WHERE email = ?",
      [email]
    );
    const user = users[0];

    // Constant-time-ish delay: always hash compare even if user doesn't exist
    const hash = user?.password_hash || "$2b$12$00000000000000000000000000000000000000000000000000000";
    const match = await bcrypt.compare(password, hash);

    if (!user || !match) {
      await new Promise((r) => setTimeout(r, 300 + Math.random() * 400));
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );
    return res.json({ token, email: user.email });
  } catch {
    return res.status(500).json({ error: "Authentication service unavailable." });
  }
});

// Update content (admin only)
app.put("/api/content", rateLimiter(20), requireAdmin, async (req, res) => {
  const { content } = req.body || {};
  if (!validateContent(content)) {
    return res.status(400).json({ error: "Content does not match the required portfolio structure." });
  }

  try {
    const sanitized = sanitizeContentDeep(content);
    const rows = await dbAll("SELECT id FROM site_content WHERE id = 1");
    if (rows.length) {
      await dbRun(
        "UPDATE site_content SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1",
        [JSON.stringify(sanitized)]
      );
    } else {
      await dbRun("INSERT INTO site_content (id, content) VALUES (1, ?)", [
        JSON.stringify(sanitized),
      ]);
    }
    return res.json({ content: sanitized });
  } catch {
    return res.status(500).json({ error: "Could not save content." });
  }
});

// Upload media (admin only)
app.post("/api/media/upload", rateLimiter(20), requireAdmin, (req, res) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      const message =
        err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE"
          ? "Image must be 5MB or smaller."
          : err.message || "Could not upload image.";
      return res.status(400).json({ error: message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Choose an image file to upload." });
    }

    const urlPath = `/media/uploads/${req.file.filename}`;

    try {
      const result = await dbRun(
        `INSERT INTO media_assets (filename, original_name, mime_type, size_bytes, url_path)
         VALUES (?, ?, ?, ?, ?)`,
        [
          req.file.filename,
          sanitizeString(req.file.originalname || req.file.filename, 255),
          sanitizeString(req.file.mimetype, 120),
          req.file.size,
          urlPath,
        ]
      );

      return res.status(201).json({
        id: result.lastID,
        url: urlPath,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
      });
    } catch {
      try {
        fs.unlinkSync(join(uploadsDir, req.file.filename));
      } catch {
        /* ignore cleanup failure */
      }
      return res.status(500).json({ error: "Could not save uploaded media." });
    }
  });
});

// Submit inquiry (public)
app.post("/api/inquiries", rateLimiter(10), async (req, res) => {
  const name = sanitizeString(req.body?.name, 200);
  const email = sanitizeEmail(req.body?.email);
  const projectType = sanitizeProjectType(req.body?.projectType);
  const message = sanitizeString(req.body?.message, 5000);

  if (!name || !email || !projectType || !message || message.length < 10) {
    return res.status(400).json({
      error:
        "Please provide a name, valid email, project type, and a message of at least 10 characters.",
    });
  }

  try {
    await dbRun(
      "INSERT INTO inquiries (full_name, email, project_type, message) VALUES (?, ?, ?, ?)",
      [name, email, projectType, message]
    );
    return res.status(201).json({ message: "Inquiry received." });
  } catch {
    return res.status(500).json({ error: "Could not submit inquiry." });
  }
});

// List inquiries (admin only)
app.get("/api/inquiries", rateLimiter(30), requireAdmin, async (_req, res) => {
  try {
    const inquiries = await dbAll(
      "SELECT id, full_name AS name, email, project_type AS projectType, message, status, created_at AS createdAt FROM inquiries ORDER BY created_at DESC"
    );
    return res.json({ inquiries });
  } catch {
    return res.status(500).json({ error: "Could not retrieve inquiries." });
  }
});

// Update inquiry status (admin only)
app.patch("/api/inquiries/:id", rateLimiter(30), requireAdmin, async (req, res) => {
  const allowedStatuses = ["new", "reviewed", "responded", "archived"];
  if (!allowedStatuses.includes(req.body?.status)) {
    return res.status(400).json({ error: "Invalid inquiry status." });
  }

  // Validate :id is a positive integer
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid inquiry ID." });
  }

  try {
    const result = await dbRun("UPDATE inquiries SET status = ? WHERE id = ?", [
      req.body.status,
      id,
    ]);
    if (!result.changes) return res.status(404).json({ error: "Inquiry not found." });
    return res.json({ status: req.body.status });
  } catch {
    return res.status(500).json({ error: "Could not update inquiry." });
  }
});

/* ── SPA fallback: serve index.html for all non-API / non-upload routes ── */
app.use((req, res) => {
  // Only serve HTML for GET requests on paths that aren't API or uploaded media
  if (req.method !== "GET" || req.path.startsWith("/api/") || req.path.startsWith("/media/uploads/")) {
    return res.status(404).json({ error: "Not found" });
  }
  res.sendFile(join(distPath, "index.html"), (err) => {
    if (err) res.status(404).json({ error: "Not found" });
  });
});

/* ── global error handler (no stack traces leaked) ── */
app.use((err, _req, res, _next) => {
  // Log the error type only, never the stack or message to stdout
  console.error(`[ERROR] ${err.name || "Error"} at ${new Date().toISOString()}`);
  res.status(500).json({ error: "The server could not complete that request." });
});

/* ── startup ── */
(async () => {
  await initializeDatabase();
  await bootstrapAdmin();
  app.listen(port, () =>
    console.log(`Portfolio API listening on http://localhost:${port}`)
  );
})();