const express = require('express');
const router = express.Router();
const { saveHistory, getHistory } = require('../controllers/history.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All history routes require authentication
router.post('/', authMiddleware, saveHistory);
router.get('/', authMiddleware, getHistory);

module.exports = router;
