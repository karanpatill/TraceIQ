function detectTech(files) {
  const languages = new Set();
  const frameworks = new Set();

  for (const f of files) {
    if (f.path.endsWith(".js")) languages.add("JavaScript");
    if (f.path.endsWith(".py")) languages.add("Python");

    if (f.path.includes("react")) frameworks.add("React");
    if (f.path.includes("express")) frameworks.add("Express");
  }

  return {
    languages: [...languages],
    frameworks: [...frameworks],
  };
}

module.exports = { detectTech };
