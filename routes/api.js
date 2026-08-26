const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getOne, getAll, run, saveDb } = require('../database/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isVideo = file.mimetype.startsWith('video/');
    const dir = isVideo ? path.join(__dirname, '..', 'uploads', 'videos') : path.join(__dirname, '..', 'uploads', 'images');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif|mp4|webm|mov|avi/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Invalid file type'), false);
};

const upload = multer({
  storage, fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800') }
});

// ============ PUBLIC ROUTES (no auth) ============

router.get('/profile', (req, res) => {
  const profile = getOne('SELECT * FROM profile WHERE id = 1');
  res.json(profile || {});
});

router.get('/skills', (req, res) => {
  const skills = getAll('SELECT * FROM skills WHERE is_active = 1 ORDER BY display_order ASC');
  res.json(skills);
});

router.get('/services', (req, res) => {
  const services = getAll('SELECT * FROM services WHERE is_active = 1 ORDER BY display_order ASC');
  res.json(services);
});

router.get('/experience', (req, res) => {
  const exp = getAll('SELECT * FROM experience ORDER BY display_order ASC');
  res.json(exp);
});

router.get('/projects', (req, res) => {
  const projects = getAll('SELECT * FROM projects WHERE is_published = 1 ORDER BY display_order ASC');
  projects.forEach(p => {
    p.features = JSON.parse(p.features || '[]');
    p.technologies = JSON.parse(p.technologies || '[]');
    p.images = getAll('SELECT * FROM project_images WHERE project_id = ? ORDER BY display_order ASC', [p.id]);
    p.videos = getAll('SELECT * FROM project_videos WHERE project_id = ? ORDER BY display_order ASC', [p.id]);
  });
  res.json(projects);
});

router.get('/projects/:id', (req, res) => {
  const project = getOne('SELECT * FROM projects WHERE id = ?', [req.params.id]);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  project.features = JSON.parse(project.features || '[]');
  project.technologies = JSON.parse(project.technologies || '[]');
  project.images = getAll('SELECT * FROM project_images WHERE project_id = ? ORDER BY display_order ASC', [project.id]);
  project.videos = getAll('SELECT * FROM project_videos WHERE project_id = ? ORDER BY display_order ASC', [project.id]);
  res.json(project);
});

router.get('/social', (req, res) => {
  const links = getAll('SELECT * FROM social_links WHERE is_active = 1 ORDER BY display_order ASC');
  res.json(links);
});

router.get('/settings', (req, res) => {
  const rows = getAll('SELECT * FROM settings');
  const settings = {};
  rows.forEach(r => settings[r.key] = r.value);
  res.json(settings);
});

router.post('/contact', (req, res) => {
  const { name, email, company, project_type, budget, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'Name, email, and message are required' });
  run('INSERT INTO contact_messages (name, email, company, project_type, budget, message) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, company || '', project_type || '', budget || '', message]);
  res.json({ success: true, message: 'Message sent successfully' });
});

// ============ ADMIN ROUTES (auth required) ============

router.get('/admin/overview', authMiddleware, (req, res) => {
  const projects = getOne('SELECT COUNT(*) as c FROM projects');
  const skills = getOne('SELECT COUNT(*) as c FROM skills');
  const services = getOne('SELECT COUNT(*) as c FROM services');
  const experience = getOne('SELECT COUNT(*) as c FROM experience');
  const messages = getOne('SELECT COUNT(*) as c FROM contact_messages');
  const unreadMessages = getOne('SELECT COUNT(*) as c FROM contact_messages WHERE is_read = 0');
  const recentProjects = getAll('SELECT id, title, status, updated_at FROM projects ORDER BY updated_at DESC LIMIT 5');
  const recentMedia = getAll('SELECT * FROM media ORDER BY created_at DESC LIMIT 5');
  res.json({
    projects: projects.c, skills: skills.c, services: services.c,
    experience: experience.c, messages: messages.c, unreadMessages: unreadMessages.c,
    recentProjects, recentMedia
  });
});

// === Profile ===
router.put('/admin/profile', authMiddleware, (req, res) => {
  const { name, title, subtitle, introduction, about, status, email, location, hero_tagline, hero_description } = req.body;
  run(`UPDATE profile SET name=?, title=?, subtitle=?, introduction=?, about=?, status=?, email=?, location=?, hero_tagline=?, hero_description=?, updated_at=CURRENT_TIMESTAMP WHERE id=1`,
    [name, title, subtitle, introduction, about, status, email, location, hero_tagline, hero_description]);
  res.json({ success: true });
});

router.post('/admin/profile/image', authMiddleware, upload.single('image'), (req, res) => {
  const imagePath = '/uploads/images/' + req.file.filename;
  run('UPDATE profile SET profile_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1', [imagePath]);
  run('INSERT INTO media (filename, original_name, file_path, file_type, file_size, category) VALUES (?, ?, ?, ?, ?, ?)',
    [req.file.filename, req.file.originalname, imagePath, req.file.mimetype, req.file.size, 'profile']);
  res.json({ success: true, image_path: imagePath });
});

// === Skills CRUD ===
router.get('/admin/skills', authMiddleware, (req, res) => {
  const skills = getAll('SELECT * FROM skills ORDER BY display_order ASC');
  res.json(skills);
});

router.post('/admin/skills', authMiddleware, (req, res) => {
  const { name, category, display_order } = req.body;
  if (!name || !category) return res.status(400).json({ error: 'Name and category required' });
  const r = run('INSERT INTO skills (name, category, display_order) VALUES (?, ?, ?)', [name, category, display_order || 0]);
  res.json({ success: true, id: r.lastInsertRowid });
});

router.put('/admin/skills/:id', authMiddleware, (req, res) => {
  const { name, category, display_order, is_active } = req.body;
  run('UPDATE skills SET name=?, category=?, display_order=?, is_active=? WHERE id=?',
    [name, category, display_order || 0, is_active !== undefined ? is_active : 1, req.params.id]);
  res.json({ success: true });
});

router.delete('/admin/skills/:id', authMiddleware, (req, res) => {
  run('DELETE FROM skills WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// === Services CRUD ===
router.get('/admin/services', authMiddleware, (req, res) => {
  const services = getAll('SELECT * FROM services ORDER BY display_order ASC');
  res.json(services);
});

router.post('/admin/services', authMiddleware, (req, res) => {
  const { title, description, icon, technologies, display_order } = req.body;
  const r = run('INSERT INTO services (title, description, icon, technologies, display_order) VALUES (?, ?, ?, ?, ?)',
    [title, description || '', icon || '🌐', technologies || '', display_order || 0]);
  res.json({ success: true, id: r.lastInsertRowid });
});

router.put('/admin/services/:id', authMiddleware, (req, res) => {
  const { title, description, icon, technologies, display_order, is_active } = req.body;
  run('UPDATE services SET title=?, description=?, icon=?, technologies=?, display_order=?, is_active=? WHERE id=?',
    [title, description, icon, technologies, display_order || 0, is_active !== undefined ? is_active : 1, req.params.id]);
  res.json({ success: true });
});

router.delete('/admin/services/:id', authMiddleware, (req, res) => {
  run('DELETE FROM services WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// === Experience CRUD ===
router.get('/admin/experience', authMiddleware, (req, res) => {
  const exp = getAll('SELECT * FROM experience ORDER BY display_order ASC');
  res.json(exp);
});

router.post('/admin/experience', authMiddleware, (req, res) => {
  const { company, role, employment_type, start_date, end_date, description, technologies, location, is_current, display_order } = req.body;
  const r = run('INSERT INTO experience (company, role, employment_type, start_date, end_date, description, technologies, location, is_current, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [company, role, employment_type || 'Full-time', start_date || '', end_date || '', description || '', technologies || '', location || '', is_current || 0, display_order || 0]);
  res.json({ success: true, id: r.lastInsertRowid });
});

router.put('/admin/experience/:id', authMiddleware, (req, res) => {
  const { company, role, employment_type, start_date, end_date, description, technologies, location, is_current, display_order } = req.body;
  run('UPDATE experience SET company=?, role=?, employment_type=?, start_date=?, end_date=?, description=?, technologies=?, location=?, is_current=?, display_order=? WHERE id=?',
    [company, role, employment_type, start_date, end_date, description, technologies, location, is_current || 0, display_order || 0, req.params.id]);
  res.json({ success: true });
});

router.delete('/admin/experience/:id', authMiddleware, (req, res) => {
  run('DELETE FROM experience WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// === Projects CRUD ===
router.get('/admin/projects', authMiddleware, (req, res) => {
  const projects = getAll('SELECT * FROM projects ORDER BY display_order ASC');
  projects.forEach(p => {
    p.features = JSON.parse(p.features || '[]');
    p.technologies = JSON.parse(p.technologies || '[]');
    const imgCount = getOne('SELECT COUNT(*) as c FROM project_images WHERE project_id = ?', [p.id]);
    const vidCount = getOne('SELECT COUNT(*) as c FROM project_videos WHERE project_id = ?', [p.id]);
    p.image_count = imgCount.c;
    p.video_count = vidCount.c;
  });
  res.json(projects);
});

router.post('/admin/projects', authMiddleware, (req, res) => {
  const { title, category, category_label, short_description, long_description, problem, solution, features, technologies, github_url, demo_url, status, is_featured, is_published, display_order } = req.body;
  const r = run(`INSERT INTO projects (title, category, category_label, short_description, long_description, problem, solution, features, technologies, github_url, demo_url, status, is_featured, is_published, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, category || 'fullstack', category_label || '', short_description || '', long_description || '', problem || '', solution || '',
     JSON.stringify(features || []), JSON.stringify(technologies || []),
     github_url || '', demo_url || '', status || 'completed', is_featured || 0, is_published !== undefined ? is_published : 1, display_order || 0]);
  res.json({ success: true, id: r.lastInsertRowid });
});

router.put('/admin/projects/:id', authMiddleware, (req, res) => {
  const { title, category, category_label, short_description, long_description, problem, solution, features, technologies, github_url, demo_url, status, is_featured, is_published, display_order } = req.body;
  run(`UPDATE projects SET title=?, category=?, category_label=?, short_description=?, long_description=?, problem=?, solution=?, features=?, technologies=?, github_url=?, demo_url=?, status=?, is_featured=?, is_published=?, display_order=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    [title, category, category_label, short_description, long_description, problem, solution,
     JSON.stringify(features || []), JSON.stringify(technologies || []),
     github_url, demo_url, status, is_featured || 0, is_published !== undefined ? is_published : 1, display_order || 0, req.params.id]);
  res.json({ success: true });
});

router.delete('/admin/projects/:id', authMiddleware, (req, res) => {
  run('DELETE FROM project_images WHERE project_id = ?', [req.params.id]);
  run('DELETE FROM project_videos WHERE project_id = ?', [req.params.id]);
  run('DELETE FROM projects WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// === Project Images ===
router.post('/admin/projects/:id/images', authMiddleware, upload.array('images', 20), (req, res) => {
  const images = req.files.map((f, i) => ({
    project_id: parseInt(req.params.id),
    image_path: '/uploads/images/' + f.filename,
    caption: req.body.captions?.[i] || '',
    is_featured: i === 0 ? 1 : 0,
    display_order: i
  }));
  for (const img of images) {
    run('INSERT INTO project_images (project_id, image_path, caption, is_featured, display_order) VALUES (?, ?, ?, ?, ?)',
      [img.project_id, img.image_path, img.caption, img.is_featured, img.display_order]);
  }
  for (const f of req.files) {
    run('INSERT INTO media (filename, original_name, file_path, file_type, file_size, category, project_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [f.filename, f.originalname, '/uploads/images/' + f.filename, f.mimetype, f.size, 'project', parseInt(req.params.id)]);
  }
  res.json({ success: true, images });
});

router.delete('/admin/project-images/:id', authMiddleware, (req, res) => {
  const img = getOne('SELECT * FROM project_images WHERE id = ?', [req.params.id]);
  if (img) {
    const fp = path.join(__dirname, '..', img.image_path);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }
  run('DELETE FROM project_images WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// === Project Videos ===
router.post('/admin/projects/:id/videos', authMiddleware, (req, res) => {
  const { title, description, video_type, video_url, display_order } = req.body;
  const r = run('INSERT INTO project_videos (project_id, title, description, video_type, video_url, display_order) VALUES (?, ?, ?, ?, ?, ?)',
    [parseInt(req.params.id), title || '', description || '', video_type || 'url', video_url || '', display_order || 0]);
  res.json({ success: true, id: r.lastInsertRowid });
});

router.post('/admin/projects/:id/videos/upload', authMiddleware, upload.single('video'), (req, res) => {
  const videoPath = '/uploads/videos/' + req.file.filename;
  const r = run('INSERT INTO project_videos (project_id, title, description, video_type, video_path, display_order) VALUES (?, ?, ?, ?, ?, ?)',
    [parseInt(req.params.id), req.body.title || req.file.originalname, req.body.description || '', 'upload', videoPath, req.body.display_order || 0]);
  run('INSERT INTO media (filename, original_name, file_path, file_type, file_size, category, project_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [req.file.filename, req.file.originalname, videoPath, req.file.mimetype, req.file.size, 'video', parseInt(req.params.id)]);
  res.json({ success: true, id: r.lastInsertRowid, video_path: videoPath });
});

router.delete('/admin/project-videos/:id', authMiddleware, (req, res) => {
  const vid = getOne('SELECT * FROM project_videos WHERE id = ?', [req.params.id]);
  if (vid && vid.video_path) {
    const fp = path.join(__dirname, '..', vid.video_path);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }
  run('DELETE FROM project_videos WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// === Media Library ===
router.get('/admin/media', authMiddleware, (req, res) => {
  const media = getAll('SELECT * FROM media ORDER BY created_at DESC');
  res.json(media);
});

router.post('/admin/media/upload', authMiddleware, upload.array('files', 10), (req, res) => {
  const files = req.files.map(f => {
    const isVideo = f.mimetype.startsWith('video/');
    return [f.filename, f.originalname, '/uploads/' + (isVideo ? 'videos' : 'images') + '/' + f.filename, f.mimetype, f.size, req.body.category || 'general'];
  });
  for (const f of files) {
    run('INSERT INTO media (filename, original_name, file_path, file_type, file_size, category) VALUES (?, ?, ?, ?, ?, ?)', f);
  }
  res.json({ success: true });
});

router.delete('/admin/media/:id', authMiddleware, (req, res) => {
  const media = getOne('SELECT * FROM media WHERE id = ?', [req.params.id]);
  if (media) {
    const fp = path.join(__dirname, '..', media.file_path);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }
  run('DELETE FROM media WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// === Social Links ===
router.get('/admin/social', authMiddleware, (req, res) => {
  const links = getAll('SELECT * FROM social_links ORDER BY display_order ASC');
  res.json(links);
});

router.put('/admin/social', authMiddleware, (req, res) => {
  const { links } = req.body;
  run('DELETE FROM social_links');
  for (const item of (links || [])) {
    run('INSERT INTO social_links (platform, url, display_order, is_active) VALUES (?, ?, ?, ?)',
      [item.platform, item.url, item.display_order || 0, item.is_active !== undefined ? item.is_active : 1]);
  }
  res.json({ success: true });
});

// === Contact Messages ===
router.get('/admin/messages', authMiddleware, (req, res) => {
  const messages = getAll('SELECT * FROM contact_messages ORDER BY created_at DESC');
  res.json(messages);
});

router.put('/admin/messages/:id/read', authMiddleware, (req, res) => {
  run('UPDATE contact_messages SET is_read = 1 WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

router.delete('/admin/messages/:id', authMiddleware, (req, res) => {
  run('DELETE FROM contact_messages WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// === Settings ===
router.get('/admin/settings', authMiddleware, (req, res) => {
  const rows = getAll('SELECT * FROM settings');
  const settings = {};
  rows.forEach(r => settings[r.key] = r.value);
  res.json(settings);
});

router.put('/admin/settings', authMiddleware, (req, res) => {
  const { settings } = req.body;
  for (const [k, v] of Object.entries(settings || {})) {
    run(`INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`, [k, v]);
  }
  res.json({ success: true });
});

module.exports = router;
