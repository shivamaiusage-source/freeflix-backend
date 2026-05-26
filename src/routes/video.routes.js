const express = require('express');
const router = express.Router();
const { getAllVideos, getVideoById } = require('../controllers/video.controller');

// GET /api/videos
router.get('/', getAllVideos);

// GET /api/videos/:id
router.get('/:id', getVideoById);

module.exports = router;
