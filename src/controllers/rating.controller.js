const pool = require('../config/db');

// Rate a video
const rateVideo = async (req, res) => {
  try {
    const { video_id, stars } = req.body;
    const user_id = req.user.id;

    if (stars < 1 || stars > 5) {
      return res.status(400).json({ error: 'Stars must be between 1 and 5' });
    }

    // Insert or update rating
    await pool.query(
      `INSERT INTO ratings (user_id, video_id, stars)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, video_id)
       DO UPDATE SET stars = $3`,
      [user_id, video_id, stars]
    );

    // Get updated average
    const avg = await pool.query(
      'SELECT ROUND(AVG(stars), 1) as average FROM ratings WHERE video_id = $1',
      [video_id]
    );

    res.json({ 
      message: 'Rating saved',
      average: avg.rows[0].average
    });
  } catch (err) {
    console.error('Rating error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get average rating for a video
const getVideoRating = async (req, res) => {
  try {
    const { videoId } = req.params;
    const user_id = req.user?.id;

    const avg = await pool.query(
      'SELECT ROUND(AVG(stars), 1) as average, COUNT(*) as total FROM ratings WHERE video_id = $1',
      [videoId]
    );

    // Get user's own rating if logged in
    let userRating = null;
    if (user_id) {
      const own = await pool.query(
        'SELECT stars FROM ratings WHERE user_id = $1 AND video_id = $2',
        [user_id, videoId]
      );
      userRating = own.rows[0]?.stars || null;
    }

    res.json({ 
      average: avg.rows[0].average,
      total: avg.rows[0].total,
      userRating
    });
  } catch (err) {
    console.error('Get rating error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { rateVideo, getVideoRating };
