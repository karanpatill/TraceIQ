const express = require("express");
const app = express();
const port = 3000;

const cors = require("cors");
const multer = require("multer");
const unzipper = require("unzipper");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const cookieParser = require("cookie-parser");

require("dotenv").config();

const { scanDirectory } = require("../analyzer/scandirectory");
const Project = require("./models/Project");
const User = require("./models/User");
const auth = require("./middleware/auth");

// OpenAI SDK
const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Multer with size limit (50MB)
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // Allow cookies
  })
);

app.use(express.json());
app.use(cookieParser());

// Session middleware with MongoDB store
app.use(
  session({
    secret: process.env.JWT_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 24 * 60 * 60, // 24 hours
    }),
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "lax",
    },
  })
);

// =======================
// AI EXPLAIN ENDPOINT
// =======================

app.post("/ai/explain", auth, async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!projectId) {
      return res.status(400).json({ message: "projectId required" });
    }

    const project = await Project.findOne({
      _id: projectId,
      user: req.userId,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const analysis = project.analysis || {};

    const lightSummary = {
      fileCount: analysis.files?.length || 0,
      routeCount: analysis.routes?.length || 0,
      controllerCount: analysis.controllers?.length || 0,
      modelCount: analysis.models?.length || 0,
    };

    const prompt = `
You are a senior backend engineer.

This project was scanned and has:
- ${lightSummary.fileCount} files
- ${lightSummary.routeCount} routes
- ${lightSummary.controllerCount} controllers
- ${lightSummary.modelCount} models

Based on this, do the following:

1. Explain what kind of backend this probably is.
2. Describe the architecture in simple words.
3. Give 3 practical interview-ready explanations.
4. Mention 2 potential improvements.
5. Summarize all this in less than 200 words.
6. Make the user interview-ready to explain this project to a senior engineer.

Keep the answer concise.
`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      max_output_tokens: 500,
    });

    const text =
      response.output_text ||
      response.output?.[0]?.content?.[0]?.text ||
      JSON.stringify(response, null, 2);

    return res.json({ explanation: text });
  } catch (err) {
    console.error("AI explain error:", err);
    if (err.name === "APIConnectionTimeoutError") {
      return res.status(504).json({
        message: "AI took too long. Try again.",
      });
    }
    return res
      .status(500)
      .json({ message: "AI explain failed", error: err.message });
  }
});

// =======================
// GOOGLE AUTH ENDPOINT
// =======================

app.post("/auth/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "No credential sent" });
    }

    const expectedAudience = process.env.GOOGLE_CLIENT_ID?.trim();

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: expectedAudience,
    });

    const payload = ticket.getPayload();

    console.log("TOKEN PAYLOAD AUD:", payload.aud);
    console.log("BACKEND EXPECTED:", expectedAudience);

    if (payload.aud !== expectedAudience) {
      return res.status(401).json({
        message: "Invalid audience",
        tokenAud: payload.aud,
        expected: expectedAudience,
      });
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: "No email in Google payload" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        googleId,
        email,
        name,
        avatar: picture,
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Google auth error:", err);
    return res.status(500).json({ message: "Auth failed" });
  }
});

// =======================
// UPLOAD + SCAN ENDPOINT
// =======================

app.post("/upload", auth, upload.single("project"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("Uploaded file:", req.file);

    const zipPath = req.file.path;

    const extractBase = path.join(__dirname, "..", "projects_store");

    if (!fs.existsSync(extractBase)) {
      fs.mkdirSync(extractBase, { recursive: true });
    }

    const projectFolder = path.join(extractBase, Date.now().toString());
    fs.mkdirSync(projectFolder);

    await fs
      .createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: projectFolder }))
      .promise();

    const analysis = await scanDirectory(projectFolder);

    const projectDoc = await Project.create({
      user: req.userId || null,
      name: req.file.originalname.replace(".zip", ""),
      originalFileName: req.file.originalname,
      folderPath: projectFolder,
      analysis,
      source: "upload",
    });

    return res.json({
      message: "Folder scanned successfully",
      projectFolder,
      scanResult: analysis,
      projectDoc,
    });
  } catch (err) {
    console.error("Error in /upload:", err);
    return res
      .status(500)
      .json({ message: "Server error during upload", error: err.message });
  }
});

// =======================
// HEALTH CHECK
// =======================

app.get("/health", (req, res) => {
  res.send({ status: "ok" });
});

// =======================
// MULTER ERROR HANDLER
// =======================

app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res
      .status(413)
      .json({ message: "File too large. Max 50MB allowed." });
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Server error" });
});

// =======================
// MONGODB + SERVER START
// =======================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Mongo error:", err));

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
