const express = require("express");
const app = express();
require("dotenv").config();

// =======================
// CORE DEPENDENCIES
// =======================
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;

// =======================
// AUTH & MODELS
// =======================
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const auth = require("../server/middleware/auth");
const User = require("../server/models/User");
const Project = require("../server/models/Project");

// =======================
// ROUTES
// =======================
const uploadRoute = require("../server/routes/upload");

// =======================
// BASIC MIDDLEWARE
// =======================
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// =======================
// SESSION
// =======================
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 24 * 60 * 60,
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// =======================
// GOOGLE AUTH
// =======================
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post("/auth/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: "No credential" });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { sub: googleId, email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ googleId, email, name, avatar: picture });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({ message: "Google auth failed" });
  }
});

// =======================
// ROUTES
// =======================
app.use("/upload", uploadRoute);

app.get("/health", (req, res) => res.json({ status: "ok" }));

// =======================
// START SERVER
// =======================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log("Backend running on", port));
  })
  .catch((err) => {
    console.error("Mongo failed:", err);
    process.exit(1);
  });
