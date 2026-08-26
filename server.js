require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 3000;

async function start() {
  // Initialize database
  await initDatabase();

  // Ensure upload directories exist
  const uploadsDir = path.join(__dirname, 'uploads');
  const imagesDir = path.join(uploadsDir, 'images');
  const videosDir = path.join(uploadsDir, 'videos');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
  if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });

  // Middleware
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Static files
  app.use(express.static(path.join(__dirname)));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // API Routes
  const authRoutes = require('./routes/auth');
  const apiRoutes = require('./routes/api');

  app.use('/api/auth', authRoutes);
  app.use('/api', apiRoutes);

  // Owner login
  app.get('/owner', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'login.html'));
  });

  // Keep legacy admin URLs on the login page.
  app.get('/admin', (req, res) => {
    res.redirect('/owner');
  });
  app.get('/admin/*', (req, res) => {
    res.redirect('/owner');
  });

  // Public portfolio
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  // Error handling
  app.use((err, req, res, next) => {
    if (err instanceof require('multer').MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
      return res.status(400).json({ error: err.message });
    }
    if (err.message === 'Invalid file type') return res.status(400).json({ error: 'Invalid file type.' });
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  app.listen(PORT, () => {
    console.log(`\n  Portfolio CMS running at http://localhost:${PORT}`);
    console.log(`  Public portfolio:  http://localhost:${PORT}/`);
    console.log(`  Admin login:       http://localhost:${PORT}/owner`);
    console.log('');
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
