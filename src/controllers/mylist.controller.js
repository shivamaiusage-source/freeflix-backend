const pool = require('../config/db');

// Add to my list
const addToList = async (req, res) => {
  try {
    const { video_id } = req.params;
    const user_id = req.user.id;

    await pool.query(
      `INSERT INTO my_list (user_id, video_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, video_id) DO NOTHING`,
      [user_id, video_id]
    );

    res.json({ message: 'Added to My List' });
  } catch (err) {
    console.error('Add to list error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Remove from my list
const removeFromList = async (req, res) => {
  try {
    const { video_id } = req.params;
    const user_id = req.user.id;

    await pool.query(
      'DELETE FROM my_list WHERE user_id = $1 AND video_id = $2',
      [user_id, video_id]
    );

    res.json({ message: 'Removed from My List' });
  } catch (err) {
    console.error('Remove from list error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get my list
const getMyList = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await pool.query(
      `SELECT ml.*, v.title, v.thumbnail_url, v.duration, v.genre, v.hls_url
       FROM my_list ml
       JOIN videos v ON ml.video_id = v.id
       WHERE ml.user_id = $1
       ORDER BY ml.saved_at DESC`,
      [user_id]
    );

    res.json({ myList: result.rows });
  } catch (err) {
    console.error('Get list error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { addToList, removeFromList, getMyList };
