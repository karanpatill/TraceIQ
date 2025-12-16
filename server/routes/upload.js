const express = require("express");
const router = express.Router();
const fs = require("fs");

const upload = require("../utils/multer");
const auth = require("../middleware/auth");
const Project = require("../models/Project");

const { analyzeProject } = require("../analyzer");
const { explainWithAI } = require("../utils/aiExplain");

router.post("/", auth, upload.single("project"), async (req, res) => {
  try {
    const zipPath = req.file.path;

    // 1️⃣ Analyzer (facts)
    const analysis = await analyzeProject(zipPath);

    // 2️⃣ OpenAI (language)
    const explanation = await explainWithAI(analysis);

    // 3️⃣ DB save (ONLY TEXT + JSON)
    const project = await Project.create({
      user: req.userId,
      name: req.file.originalname,
      analysis,
      explanation,
    });

    // 4️⃣ Cleanup
    fs.unlinkSync(zipPath);

    res.json({
      projectId: project._id,
      analysis,
      explanation,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});

module.exports = router;
