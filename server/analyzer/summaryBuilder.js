function buildSummary(analysis) {
  return `This project uses ${analysis.tech.languages.join(", ")} 
with ${analysis.tech.frameworks.join(", ") || "no major framework"}.
Total files scanned: ${analysis.fileCount}.`;
}

module.exports = { buildSummary };
