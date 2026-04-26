const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

const upload = multer({
  storage,
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
});

router.post('/', protect, authorizeRoles('admin'), upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }
  res.json({
    message: 'Image uploaded successfully',
    imageUrl: `http://localhost:5000/uploads/${req.file.filename}`
  });
});

module.exports = router;
