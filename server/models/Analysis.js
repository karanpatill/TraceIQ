import mongoose from "mongoose";

analysis = {
  projectType: "Frontend | Backend | Fullstack | ML | Unknown",
  techStack: {
    languages: [],
    frameworks: [],
    tools: [],
  },
  entryPoints: [],
  importantFiles: [],
  summary: "",
}

module.exports = mongoose.model("Analysis", analysis);