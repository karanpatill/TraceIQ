const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Define upload directories
const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
const TEMP_DIR = path.join(UPLOAD_DIR, "temp");
const PROJECTS_DIR = path.join(UPLOAD_DIR, "projects");

// Ensure directories exist
[UPLOAD_DIR, TEMP_DIR, PROJECTS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user?.id || "anonymous";
    const uploadPath = path.join(TEMP_DIR, userId);
    
    // Create user-specific temp directory
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `${timestamp}${extension}`);
  },
});

// File filter - only allow ZIP files
const fileFilter = (req, file, cb) => {
  const allowedMimes = ["application/zip", "application/x-zip-compressed"];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only ZIP files are allowed"), false);
  }
};

// Multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

// Utility function to get project upload path
const getProjectPath = (userId, projectId) => {
  return path.join(PROJECTS_DIR, userId, projectId);
};

// Utility function to move file from temp to project directory
const moveToProjectDir = (userId, projectId, tempFilePath) => {
  const projectPath = getProjectPath(userId, projectId);
  
  if (!fs.existsSync(projectPath)) {
    fs.mkdirSync(projectPath, { recursive: true });
  }
  
  const filename = path.basename(tempFilePath);
  const newPath = path.join(projectPath, filename);
  
  fs.copyFileSync(tempFilePath, newPath);
  fs.unlinkSync(tempFilePath); // Remove temp file
  
  return newPath;
};

// Cleanup temp files older than specified hours
const cleanupOldFiles = (hoursOld = 24) => {
  const now = Date.now();
  const maxAge = hoursOld * 60 * 60 * 1000;
  
  const walkDir = (dir) => {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (now - stat.mtimeMs > maxAge) {
        fs.unlinkSync(filePath);
      }
    });
  };
  
  walkDir(TEMP_DIR);
};

// Schedule automatic cleanup (runs every 6 hours)
if (process.env.NODE_ENV === "production") {
  setInterval(() => {
    cleanupOldFiles(24); // Remove files older than 24 hours
  }, 6 * 60 * 60 * 1000);
}

module.exports = {
  upload,
  UPLOAD_DIR,
  TEMP_DIR,
  PROJECTS_DIR,
  getProjectPath,
  moveToProjectDir,
  cleanupOldFiles,
};
