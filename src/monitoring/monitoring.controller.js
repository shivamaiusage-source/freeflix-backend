const pool = require('../config/db');

// ── CREATE SESSION ──
const createSession = async (req, res) => {
  try {
    const { id, app, origin, userAgent, screenW, screenH, startedAt } = req.body;
    if (!id || !app) return res.status(400).json({ error: 'id and app are required' });

    await pool.query(
      `INSERT INTO mon_sessions (id, app, origin, user_agent, screen_w, screen_h, started_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO NOTHING`,
      [id, app, origin, userAgent, screenW, screenH, startedAt || new Date()]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('createSession error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ── BATCH INSERT EVENTS ──
const addEvents = async (req, res) => {
  try {
    const { sessionId, events } = req.body;
    if (!sessionId || !events?.length) return res.json({ ok: true });

    for (const e of events) {
      await pool.query(
        `INSERT INTO mon_events (session_id, type, ts, x, y, target, value)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [sessionId, e.type, e.ts, e.x || null, e.y || null, e.target || null,
         e.value ? JSON.stringify(e.value) : null]
      );
    }

    const clicks = events.filter(e => e.type === 'click').length;
    const errors = events.filter(e => e.type === 'error').length;
    const navs   = events.filter(e => e.type === 'nav').length;
    const lastTs = Math.max(...events.map(e => e.ts));

    await pool.query(
      `UPDATE mon_sessions SET
         click_count = click_count + $1,
         error_count = error_count + $2,
         page_count  = page_count  + $3,
         duration_ms = $4 - EXTRACT(EPOCH FROM started_at) * 1000
       WHERE id = $5`,
      [clicks, errors, navs, lastTs, sessionId]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('addEvents error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ── GET ALL SESSIONS ──
const getSessions = async (req, res) => {
  try {
    const { app, errors_only, limit = 50, offset = 0 } = req.query;

    let where = [];
    let params = [];
    let i = 1;

    if (app) { where.push(`app = $${i++}`); params.push(app); }
    if (errors_only === 'true') { where.push(`error_count > 0`); }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const result = await pool.query(
      `SELECT * FROM mon_sessions
       ${whereClause}
       ORDER BY started_at DESC
       LIMIT $${i++} OFFSET $${i++}`,
      [...params, limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM mon_sessions ${whereClause}`,
      params
    );

    res.json({
      sessions: result.rows,
      total: parseInt(countResult.rows[0].count)
    });
  } catch (err) {
    console.error('getSessions error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ── GET SESSION EVENTS (for replay) ──
const getSessionEvents = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await pool.query(
      'SELECT * FROM mon_sessions WHERE id = $1', [id]
    );

    if (!session.rows.length) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const events = await pool.query(
      'SELECT * FROM mon_events WHERE session_id = $1 ORDER BY ts ASC', [id]
    );

    res.json({ session: session.rows[0], events: events.rows });
  } catch (err) {
    console.error('getSessionEvents error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ── GET STATS ──
const getStats = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)                                              AS total_sessions,
        COALESCE(SUM(click_count), 0)                        AS total_clicks,
        COALESCE(SUM(error_count), 0)                        AS total_errors,
        COALESCE(SUM(page_count), 0)                         AS total_navigations,
        COALESCE(AVG(duration_ms), 0)                        AS avg_duration_ms,
        COUNT(*) FILTER (WHERE app = 'FreeFlix')             AS freeflix_sessions,
        COUNT(*) FILTER (WHERE app = 'RAG')                  AS rag_sessions,
        COUNT(*) FILTER (WHERE app = 'Portfolio')            AS portfolio_sessions,
        COUNT(*) FILTER (WHERE app = 'Monitoring')           AS monitoring_sessions
      FROM mon_sessions
    `);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('getStats error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ── UPDATE SESSION APP ──
const updateSessionApp = async (req, res) => {
  try {
    const { id } = req.params;
    const { app } = req.body;
    if (!app) return res.status(400).json({ error: 'app required' });
    await pool.query('UPDATE mon_sessions SET app = $1 WHERE id = $2', [app, id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── CLEANUP OLD SESSIONS ──
const cleanupSessions = async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM mon_sessions WHERE started_at < NOW() - INTERVAL '30 days'"
    );
    res.json({ message: 'Cleanup complete' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createSession, addEvents, getSessions,
  getSessionEvents, getStats, updateSessionApp, cleanupSessions
};
