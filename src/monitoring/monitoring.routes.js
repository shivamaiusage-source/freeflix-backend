const express = require('express');
const router = express.Router();
const {
  createSession,
  addEvents,
  getSessions,
  getSessionEvents,
  getStats, updateSessionApp
} = require('./monitoring.controller');

router.post('/session', createSession);
router.post('/events', addEvents);
router.get('/sessions', getSessions);
router.get('/sessions/:id', getSessionEvents);
router.get('/stats', getStats, updateSessionApp);
router.patch('/session/:id/app', updateSessionApp);

module.exports = router;
