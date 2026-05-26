const pool = require('../config/db');

// GET all videos — with optional search and genre filter
const getAllVideos = async (req, res) => {
  try {
    const { search, genre } = req.query;

    let query = 'SELECT * FROM videos';
    let params = [];
    let conditions = [];

    // Add search filter if provided
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(title ILIKE $${params.length} OR description ILIKE $${params.length})`);
    }

    // Add genre filter if provided
    if (genre) {
      params.push(genre);
      conditions.push(`genre = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({ videos: result.rows });

  } catch (err) {
    console.error('Get videos error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET single video by ID
const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM videos WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json({ video: result.rows[0] });

  } catch (err) {
    console.error('Get video error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getAllVideos, getVideoById };
