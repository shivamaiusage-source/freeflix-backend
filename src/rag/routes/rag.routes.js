const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  uploadPdf, pdfChat, portfolioChat,
  getDocuments, cleanupSessions, getModelStatus
} = require('../controllers/rag.controller');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'));
  }
});

router.post('/upload', upload.single('pdf'), uploadPdf);
router.post('/chat', pdfChat);
router.post('/portfolio', portfolioChat);
router.get('/documents', getDocuments);
router.get('/model-status', getModelStatus);
router.post('/cleanup', cleanupSessions);

module.exports = router;
