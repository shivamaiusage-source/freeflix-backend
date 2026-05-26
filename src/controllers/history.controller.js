const pool = require('../config/db');

// Save watch history
const saveHistory = async (req, res) => {
  try {
    const { video_id, progress_seconds } = req.body;
    const user_id = req.user.id;

    // Insert or update if already exists
    await pool.query(
      `INSERT INTO watch_history (user_id, video_id, progress_seconds, watched_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, video_id) 
       DO UPDATE SET progress_seconds = $3, watched_at = NOW()`,
      [user_id, video_id, progress_seconds || 0]
    );

    res.json({ message: 'Watch history saved' });
  } catch (err) {
    console.error('History error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user watch history
const getHistory = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await pool.query(
      `SELECT wh.*, v.title, v.thumbnail_url, v.duration, v.genre
       FROM watch_history wh
       JOIN videos v ON wh.video_id = v.id
       WHERE wh.user_id = $1
       ORDER BY wh.watched_at DESC`,
      [user_id]
    );

    res.json({ history: result.rows });
  } catch (err) {
    console.error('Get history error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { saveHistory, getHistory };
