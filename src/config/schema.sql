-- USERS table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- VIDEOS table
CREATE TABLE IF NOT EXISTS videos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  genre VARCHAR(50),
  thumbnail_url TEXT,
  hls_url TEXT NOT NULL,
  duration VARCHAR(20),
  year INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- WATCH HISTORY table
CREATE TABLE IF NOT EXISTS watch_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
  progress_seconds INTEGER DEFAULT 0,
  watched_at TIMESTAMP DEFAULT NOW()
);

-- RATINGS table
CREATE TABLE IF NOT EXISTS ratings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
  stars INTEGER CHECK (stars >= 1 AND stars <= 5),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- MY LIST table
CREATE TABLE IF NOT EXISTS my_list (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
  saved_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Seed first video
INSERT INTO videos (title, description, genre, thumbnail_url, hls_url, duration, year)
VALUES (
  'Elephant''s Dream',
  'The first open movie from Blender Foundation. Two strange characters explore a mythical machine.',
  'Animation',
  'https://videos.shivamsingh.website/elephant_dream/thumbnail.jpg',
  'https://videos.shivamsingh.website/elephant_dream/master.m3u8',
  '10:54',
  2006
) ON CONFLICT DO NOTHING;
