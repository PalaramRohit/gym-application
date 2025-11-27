const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');

// Ensure uploads directory exists
const uploadsDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter - only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
  }
};

// Multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 3145728, // 3MB default
  },
});

// Middleware to handle upload and optionally upload to Cloudinary
const handleUpload = (fieldName = 'photo') => {
  return async (req, res, next) => {
    const uploadSingle = upload.single(fieldName);

    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      // If Cloudinary is configured and file exists, upload to Cloudinary
      if (req.file && process.env.CLOUDINARY_CLOUD_NAME) {
        try {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'gym-app',
            resource_type: 'image',
          });

          // Delete local file after Cloudinary upload
          fs.unlinkSync(req.file.path);

          req.file.url = result.secure_url;
          req.file.publicId = result.public_id;
        } catch (cloudinaryError) {
          console.error('Cloudinary upload error:', cloudinaryError);
          // Fallback to local file
          req.file.url = `/uploads/${req.file.filename}`;
        }
      } else if (req.file) {
        // Use local file path
        req.file.url = `/uploads/${req.file.filename}`;
      }

      next();
    });
  };
};

module.exports = { upload, handleUpload };

