# TraceIQ Deployment Guide

## Upload Folder Organization

### **Local Development Structure**
```
server/uploads/
├── temp/
│   └── {userId}/
│       └── {timestamp}.zip
├── projects/
│   └── {userId}/
│       └── {projectId}/
│           ├── {timestamp}.zip
│           ├── extracted/
│           ├── analysis-results.json
│           └── metrics.json
```

### **File Lifecycle**
1. **Upload** → File saved to `uploads/temp/{userId}/`
2. **Analysis** → File moved to `uploads/projects/{userId}/{projectId}/`
3. **Extraction** → ZIP extracted to `uploads/projects/{userId}/{projectId}/extracted/`
4. **Cleanup** → Temp files removed after 24 hours
5. **Archive** → Old project data moved to cold storage (optional)

---

## Deployment Checklist

### **Before Deployment**

- [ ] Copy `.env.example` to `.env` and fill in values
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Verify `UPLOAD_DIR` path is writable
- [ ] Configure MongoDB connection string
- [ ] Set up Google OAuth credentials
- [ ] Generate JWT secret key
- [ ] Add OpenAI API key

### **Production Upload Directory Setup**

#### **Linux/Mac**
```bash
# Create upload directories with proper permissions
mkdir -p uploads/temp uploads/projects
chmod 755 uploads
chmod 777 uploads/temp
chmod 755 uploads/projects

# Or use the upload config to auto-create
npm start
```

#### **Windows**
```powershell
# Create directories (auto-created by uploadConfig.js)
# Ensure IIS/Node.js app pool has write permissions
```

---

## Cloud Storage Integration (Recommended)

### **Option 1: Azure Blob Storage** (Recommended for Azure deployments)

```javascript
// Install dependencies
npm install @azure/storage-blob

// Create: server/config/azureStorage.js
const { BlobServiceClient } = require("@azure/storage-blob");

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);

const containerClient = blobServiceClient.getContainerClient(
  process.env.AZURE_STORAGE_CONTAINER_NAME
);

const uploadToAzure = async (filePath, blobName) => {
  const fileStream = fs.createReadStream(filePath);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadStream(fileStream);
};

module.exports = { uploadToAzure, containerClient };
```

### **Option 2: AWS S3**

```javascript
// Install dependencies
npm install aws-sdk

// Create: server/config/s3Storage.js
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const uploadToS3 = async (filePath, key) => {
  const fileContent = fs.readFileSync(filePath);
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: fileContent,
  };
  return s3.upload(params).promise();
};

module.exports = { uploadToS3 };
```

---

## Hosting Recommendations

### **For Azure**
- **App Service** with persistent storage mount
- **Container App** with volume mounts
- **Blob Storage** for file storage (recommended)
- **Cosmos DB** for MongoDB compatibility

### **For AWS**
- **EC2** with EBS volumes
- **ECS/Fargate** with S3 storage
- **Lambda** with S3 (for serverless)

### **For Self-Hosted**
- Use `uploads/` on persistent volume
- Mount network storage (NFS/SMB)
- Regular backups of upload directory

---

## Performance & Security

### **Upload Folder Best Practices**

1. **Size Management**
   - Set max file size: 50MB
   - Implement quota per user
   - Archive old projects automatically

2. **Security**
   - Never expose upload paths directly
   - Serve downloads through API with auth check
   - Use signed URLs for cloud storage
   - Scan uploads for malware (optional)

3. **Cleanup**
   - Auto-delete temp files after 24 hours
   - Archive projects older than 30 days
   - Implement manual cleanup endpoint for admins

4. **Monitoring**
   - Track upload disk usage
   - Alert when disk > 80% full
   - Monitor failed uploads
   - Log all file operations

---

## Database Schema for File References

```javascript
// In Project model
const projectSchema = new Schema({
  userId: ObjectId,
  name: String,
  uploadedFile: {
    originalName: String,
    uploadedPath: String,  // projects/{userId}/{projectId}/file.zip
    uploadedAt: Date,
    fileSize: Number,
  },
  analysis: {
    status: String, // pending, processing, completed, failed
    extractedPath: String,
    results: Object,
    completedAt: Date,
  },
});
```

---

## Environment Variables

```env
# Production
NODE_ENV=production
UPLOAD_DIR=/var/uploads/traceiq  # Use absolute path
MAX_FILE_SIZE=52428800

# For Azure
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;...
AZURE_STORAGE_CONTAINER_NAME=traceiq-uploads

# For AWS
AWS_S3_BUCKET=traceiq-uploads
AWS_REGION=us-east-1
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Permission denied" on upload | Check directory permissions: `chmod 755 uploads` |
| Disk space issues | Implement cleanup, use cloud storage |
| Slow uploads | Increase max file size limit, use S3 direct upload |
| Lost files after restart | Use persistent volume or cloud storage |

---

## Migration Strategy

### **From Local to Cloud**

```bash
# 1. Backup local uploads
tar -czf uploads-backup.tar.gz uploads/

# 2. Upload to cloud (use Azure/S3 tools)
az storage blob upload-batch --account-name myaccount \
  --source uploads/projects --destination-path traceiq

# 3. Update code to use cloud storage
# 4. Verify all files are accessible
# 5. Keep local backup for 30 days
# 6. Remove local uploads after verification
```

---

## Next Steps

1. ✅ Configure upload paths in `.env`
2. ✅ Set up proper folder permissions
3. ✅ Choose cloud storage (Azure/AWS)
4. ✅ Implement cleanup jobs
5. ✅ Set up monitoring and alerts
6. ✅ Regular backups
