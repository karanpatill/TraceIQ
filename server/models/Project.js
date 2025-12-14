const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    originalFileName: String,
    folderPath: String,
    analysis: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
