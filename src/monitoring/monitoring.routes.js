const express = require('express');
const router = express.Router();
const {
  createSession, addEvents, getSessions,
  getSessionEvents, getStats, updateSessionApp, cleanupSessions
} = require('./monitoring.controller');

router.post('/session',         createSession);
router.post('/events',          addEvents);
router.get('/sessions',         getSessions);
router.get('/sessions/:id',     getSessionEvents);
router.get('/stats',            getStats);
router.patch('/session/:id/app', updateSessionApp);
router.get('/cleanup',          cleanupSessions);
router.post('/cleanup',         cleanupSessions);

module.exports = router;
