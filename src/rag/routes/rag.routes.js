const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  uploadPdf,
  pdfChat,
  portfolioChat,
  getDocuments,
  cleanupSessions
} = require('../controllers/rag.controller');

// Store file in memory (not disk) — we process it directly
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files allowed'));
    }
  }
});

// PDF routes
router.post('/upload', upload.single('pdf'), uploadPdf);
router.post('/chat', pdfChat);
router.get('/documents', getDocuments);

// Portfolio assistant
router.post('/portfolio', portfolioChat);

// Cleanup (called by cron-job.org daily)
router.post('/cleanup', cleanupSessions);

module.exports = router;
