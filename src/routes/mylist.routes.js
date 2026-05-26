const express = require('express');
const router = express.Router();
const { addToList, removeFromList, getMyList } = require('../controllers/mylist.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/:video_id', authMiddleware, addToList);
router.delete('/:video_id', authMiddleware, removeFromList);
router.get('/', authMiddleware, getMyList);

module.exports = router;
