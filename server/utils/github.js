const simpleGit = require("simple-git");

/**
 * Clone a GitHub repository with auth
 * @param {string} cloneUrl - HTTPS clone URL
 * @param {string} targetPath - local folder path
 * @param {string} token - GitHub OAuth token
 */
async function cloneRepo(cloneUrl, targetPath, token) {
  const authUrl = cloneUrl.replace(
    "https://",
    `https://${token}@`
  );

  const git = simpleGit();
  await git.clone(authUrl, targetPath, ["--depth", "1"]);
}

module.exports = { cloneRepo };
