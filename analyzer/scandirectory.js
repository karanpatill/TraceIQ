const fs = require("fs");
const path = require("path");

function scanDirectory(rootDir) {
  const result = {
    files: [],
    routes: [],
    models: [],
    controllers: [],
  };

  function walk(currentPath) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (stat.isFile()) {
        result.files.push(fullPath);

        if (fullPath.toLowerCase().includes("route")) {
          result.routes.push(fullPath);
        }
        if (fullPath.toLowerCase().includes("model")) {
          result.models.push(fullPath);
        }
        if (fullPath.toLowerCase().includes("controller")) {
          result.controllers.push(fullPath);
        }
      }
    }
  }

  walk(rootDir);
  return result;
}

module.exports = { scanDirectory };
