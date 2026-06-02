const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes    = require('./routes/auth.routes');
const videoRoutes   = require('./routes/video.routes');
const historyRoutes = require('./routes/history.routes');
const ratingRoutes  = require('./routes/rating.routes');
const mylistRoutes  = require('./routes/mylist.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:4200',
    'https://shivamsingh.website',
    'https://www.shivamsingh.website'
  ],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth',    authRoutes);
app.use('/api/videos',  videoRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/mylist',  mylistRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'FreeFlix API is running 🎬' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong', message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
