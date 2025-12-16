const express = require("express");
const app = express();
const port = 3000;

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
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// =======================
// SESSION (Mongo-backed)
// =======================
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 24 * 60 * 60,
    }),
    cookie: {
      httpOnly: true,
      secure: false, // true in prod (HTTPS)
      sameSite: "lax",
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
    if (!credential) {
      return res.status(400).json({ message: "No credential provided" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

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

    res.json({
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
    res.status(500).json({ message: "Google auth failed" });
  }
});

// =======================
// UPLOAD ROUTE (ANALYZER + OPENAI)
// =======================
app.use("/upload", uploadRoute);

// =======================
// HEALTH CHECK
// =======================
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// =======================
// GLOBAL ERROR HANDLER
// =======================
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Server error" });
});

// =======================
// DB + SERVER START
// =======================
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(port, () =>
      console.log(`Server running on port ${port}`)
    );
  })
  .catch((err) => {
    console.error("MongoDB connection failed ❌");
    console.error(err);
    process.exit(1);
  });
