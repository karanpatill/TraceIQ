const { readZip } = require("./zipReader");
const { detectTech } = require("./techDetector");
const { buildSummary } = require("./summaryBuilder");

async function analyzeProject(zipPath) {
  // 1. ZIP ke andar kya hai
  const files = await readZip(zipPath);

  // 2. Tech stack detect
  const tech = detectTech(files);

  // 3. Final analysis object
  const analysis = {
    fileCount: files.length,
    tech,
  };

  // 4. Human readable summary (non-AI)
  const summary = buildSummary(analysis);

  return {
    ...analysis,
    summary,
  };
}

module.exports = { analyzeProject };
