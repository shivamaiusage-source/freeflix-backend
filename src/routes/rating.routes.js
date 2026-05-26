const express = require('express');
const router = express.Router();
const { rateVideo, getVideoRating } = require('../controllers/rating.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, rateVideo);
router.get('/:videoId', authMiddleware, getVideoRating);

module.exports = router;
