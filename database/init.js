const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { initDb, getDb, getOne, getAll, run, runMany, saveDb } = require('./db');

async function initDatabase() {
  await initDb();
  const db = getDb();

  db.run(`CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT DEFAULT 'Selva Jeyakrishnan',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY,
    name TEXT DEFAULT 'Selva Jeyakrishnan',
    title TEXT DEFAULT 'Software Developer',
    subtitle TEXT DEFAULT 'AI/ML • Full Stack • Automation',
    introduction TEXT DEFAULT '',
    about TEXT DEFAULT '',
    status TEXT DEFAULT 'Open to Opportunities & Freelance Projects',
    profile_image TEXT DEFAULT 'selva_profile.jpg',
    location TEXT DEFAULT '',
    email TEXT DEFAULT '',
    hero_tagline TEXT DEFAULT 'I Build Software That Solves Real Problems.',
    hero_description TEXT DEFAULT 'Software developer specializing in AI/ML, full-stack applications, automation, dashboards, and intelligent software solutions.',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Programming',
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    icon TEXT DEFAULT '🌐',
    technologies TEXT DEFAULT '',
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS experience (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    employment_type TEXT DEFAULT 'Full-time',
    start_date TEXT DEFAULT '',
    end_date TEXT DEFAULT '',
    description TEXT DEFAULT '',
    technologies TEXT DEFAULT '',
    location TEXT DEFAULT '',
    is_current INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'fullstack',
    category_label TEXT DEFAULT '',
    short_description TEXT DEFAULT '',
    long_description TEXT DEFAULT '',
    problem TEXT DEFAULT '',
    solution TEXT DEFAULT '',
    features TEXT DEFAULT '[]',
    technologies TEXT DEFAULT '[]',
    github_url TEXT DEFAULT '',
    demo_url TEXT DEFAULT '',
    thumbnail TEXT DEFAULT '',
    status TEXT DEFAULT 'completed',
    is_featured INTEGER DEFAULT 0,
    is_published INTEGER DEFAULT 1,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS project_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    image_path TEXT NOT NULL,
    caption TEXT DEFAULT '',
    is_featured INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS project_videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    title TEXT DEFAULT '',
    description TEXT DEFAULT '',
    video_type TEXT DEFAULT 'url',
    video_path TEXT DEFAULT '',
    video_url TEXT DEFAULT '',
    thumbnail TEXT DEFAULT '',
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER DEFAULT 0,
    category TEXT DEFAULT 'general',
    project_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS social_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    url TEXT DEFAULT '',
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT DEFAULT '',
    project_type TEXT DEFAULT '',
    budget TEXT DEFAULT '',
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT DEFAULT ''
  )`);

  saveDb();

  // Seed admin user
  const existingAdmin = getOne('SELECT id FROM admin_users WHERE email = ?', [process.env.ADMIN_EMAIL || 'selva@portfolio.com']);
  if (!existingAdmin) {
    const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Admin@123', 10);
    run('INSERT INTO admin_users (email, password, name) VALUES (?, ?, ?)', [process.env.ADMIN_EMAIL || 'selva@portfolio.com', hash, 'Selva Jeyakrishnan']);
    console.log('Admin user created.');
  }

  // Seed profile
  const existingProfile = getOne('SELECT id FROM profile WHERE id = 1');
  if (!existingProfile) {
    run(`INSERT INTO profile (id, name, title, subtitle, introduction, about, status, profile_image, email)
      VALUES (1, 'Selva Jeyakrishnan', 'Software Developer', 'AI/ML • Full Stack • Automation',
      'I''m a software developer passionate about building practical software, AI-powered applications, and modern web experiences.',
      'I enjoy taking an idea or real-world problem, breaking it down, and turning it into a working product using software development, AI/ML, automation, and full-stack technologies. My focus is not just writing code — it''s building solutions that are useful, scalable, and easy to use.',
      'Open to Opportunities & Freelance Projects',
      'selva_profile.jpg',
      'selvajeyakrishnan@email.com'
    )`);
    console.log('Profile seeded.');
  }

  // Seed skills
  const skillCount = getOne('SELECT COUNT(*) as c FROM skills');
  if (skillCount.c === 0) {
    const defaultSkills = [
      ['Python', 'Programming', 1], ['Java', 'Programming', 2], ['SQL', 'Programming', 3], ['JavaScript', 'Programming', 4],
      ['Machine Learning', 'AI / ML', 5], ['Deep Learning', 'AI / ML', 6], ['NLP', 'AI / ML', 7], ['Computer Vision', 'AI / ML', 8],
      ['TensorFlow', 'AI / ML', 9], ['Scikit-learn', 'AI / ML', 10], ['Pandas', 'AI / ML', 11], ['NumPy', 'AI / ML', 12],
      ['Flask', 'Backend', 13], ['FastAPI', 'Backend', 14], ['REST APIs', 'Backend', 15], ['SQLAlchemy', 'Backend', 16],
      ['HTML', 'Frontend', 17], ['CSS', 'Frontend', 18], ['Responsive Design', 'Frontend', 19],
      ['SQLite', 'Databases', 20], ['MySQL', 'Databases', 21], ['PostgreSQL', 'Databases', 22],
      ['Git', 'Tools', 23], ['GitHub', 'Tools', 24], ['VS Code', 'Tools', 25], ['Docker', 'Tools', 26], ['API Integration', 'Tools', 27]
    ];
    runMany('INSERT INTO skills (name, category, display_order) VALUES (?, ?, ?)', defaultSkills);
    console.log('Default skills seeded.');
  }

  // Seed services
  const serviceCount = getOne('SELECT COUNT(*) as c FROM services');
  if (serviceCount.c === 0) {
    const defaultServices = [
      ['Custom Websites', 'Modern responsive websites for individuals and businesses.', '🌐', 'HTML,CSS,JavaScript', 1],
      ['Web Applications', 'Full-stack web apps with authentication, databases, dashboards, and APIs.', '⚡', 'Python,Flask,FastAPI,JavaScript', 2],
      ['AI Solutions', 'AI-powered applications for document processing, recommendations, classification, and intelligent workflows.', '🧠', 'Python,ML,NLP,TensorFlow', 3],
      ['Automation', 'Automate repetitive business processes and workflows.', '🔄', 'Python,APIs,Automation', 4],
      ['AI/ML Applications', 'Machine learning and NLP-based applications for real-world problems.', '📈', 'Python,ML,Scikit-learn,Pandas', 5],
      ['Dashboards', 'Interactive dashboards for monitoring and analyzing business data.', '📊', 'Python,JavaScript,HTML,CSS', 6],
      ['API Development', 'Backend APIs and integrations for web and AI applications.', '🔌', 'Python,FastAPI,Flask,REST', 7],
      ['Custom Software', 'Software tailored to specific business requirements.', '🛠️', 'Python,SQL,Docker,APIs', 8]
    ];
    runMany('INSERT INTO services (title, description, icon, technologies, display_order) VALUES (?, ?, ?, ?, ?)', defaultServices);
    console.log('Default services seeded.');
  }

  // Seed experience
  const expCount = getOne('SELECT COUNT(*) as c FROM experience');
  if (expCount.c === 0) {
    run(`INSERT INTO experience (company, role, employment_type, start_date, end_date, description, technologies, location, is_current, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Cognifyz IT Solutions Pvt. Ltd.', 'Software Development Intern', 'Internship',
       '2026-07', '2026-08',
       'Completed a software development internship focused on practical programming tasks, problem solving, and building real-world software solutions.',
       'Python,Software Development,Programming', 'Remote', 0, 1]);
    console.log('Default experience seeded.');
  }

  // Seed projects
  const projCount = getOne('SELECT COUNT(*) as c FROM projects');
  if (projCount.c === 0) {
    const defaultProjects = [
      ['Dayflow HRMS', 'fullstack', 'Full Stack • HR Management • Web Application',
        'A modern Human Resource Management System designed to manage employee information, attendance, leave management, payroll, authentication, and HR workflows.',
        'Dayflow HRMS is a comprehensive human resource management solution built to streamline HR operations.',
        'Managing employee information, attendance, payroll, and HR workflows manually is time-consuming, error-prone, and difficult to scale.',
        'Built a full-stack web application with a clean interface that centralizes all HR operations.',
        JSON.stringify(['Employee management','Authentication & authorization','Attendance tracking','Leave management','Payroll processing','HR dashboard','Database integration','Role-based access control']),
        JSON.stringify(['Python','Flask','SQLAlchemy','SQLite','HTML','CSS','JavaScript']),
        '', '', 'completed', 1, 1, 1],
      ['AI Resume Screening System', 'ai', 'AI/ML • NLP • Recruitment',
        'An AI-powered resume screening system that analyzes resumes and helps identify candidate-job relevance.',
        'An intelligent resume screening platform that leverages NLP and ML to automate recruitment.',
        'Recruiters spend hours manually screening resumes. The process is slow, inconsistent, and prone to human bias.',
        'Developed an AI-powered system that automatically parses resumes, extracts skills, and ranks candidates.',
        JSON.stringify(['Resume upload & parsing','Skill extraction using NLP','Candidate analysis','Job matching algorithm','ATS-style evaluation','Candidate ranking','Batch processing','Match scoring']),
        JSON.stringify(['Python','Flask / FastAPI','NLP','Machine Learning','SQL','HTML','CSS','JavaScript']),
        '', '', 'completed', 1, 1, 2],
      ['AI Job Recommendation & Auto-Application', 'ai', 'AI • Automation • Job Search',
        'An AI-powered system that analyzes a user\'s resume and recommends relevant job opportunities.',
        'An intelligent job matching platform that combines resume analysis with job market data.',
        'Job seekers spend countless hours searching through job boards and filling out repetitive application forms.',
        'Built an AI system that automatically analyzes a user\'s profile and matches skills to available positions.',
        JSON.stringify(['Resume analysis','Skill extraction','Job recommendation engine','Job matching algorithm','Automated application workflow','Application tracking','Personalized recommendations']),
        JSON.stringify(['Python','NLP','Machine Learning','API Integration','HTML','CSS','JavaScript']),
        '', '', 'in_progress', 1, 1, 3],
      ['Intelligent Invoice Processing Automation', 'automation', 'AI • Document Processing • Automation',
        'An automation system designed to process large numbers of invoices using AI-powered document understanding.',
        'An intelligent document processing system that automates extraction and categorization of invoice data.',
        'Businesses process thousands of invoices manually each month, consuming significant time and introducing errors.',
        'Developed an AI-powered automation system that handles the entire invoice processing pipeline.',
        JSON.stringify(['Invoice upload & batch processing','AI/OCR document extraction','Data validation & cleaning','Structured database storage','Dashboard & reporting','Export capabilities','Error flagging','Audit trail']),
        JSON.stringify(['Python','AI/OCR','Machine Learning','Database','Dashboard','HTML','CSS','JavaScript']),
        '', '', 'completed', 1, 1, 4],
      ['Resume & Job Matching Platform', 'ai', 'AI • NLP • Web Application',
        'An intelligent platform that compares resumes against job descriptions to provide detailed match analysis.',
        'A web application that provides deep analysis of resume-to-job matching.',
        'Job applicants often wonder how well their resume matches a specific job posting.',
        'Created an intelligent platform that performs detailed resume-to-job comparison and provides recommendations.',
        JSON.stringify(['Resume parsing','Job description analysis','Skill matching algorithm','Match score generation','Missing skills identification','Improvement recommendations','Candidate comparison']),
        JSON.stringify(['Python','NLP','Machine Learning','Flask','HTML','CSS','JavaScript']),
        '', '', 'completed', 1, 1, 5]
    ];
    runMany(`INSERT INTO projects (title, category, category_label, short_description, long_description, problem, solution, features, technologies, github_url, demo_url, status, is_featured, is_published, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, defaultProjects);
    console.log('Default projects seeded.');
  }

  // Seed social links
  const socialCount = getOne('SELECT COUNT(*) as c FROM social_links');
  if (socialCount.c === 0) {
    runMany('INSERT INTO social_links (platform, url, display_order) VALUES (?, ?, ?)', [
      ['GitHub', 'https://github.com/selvajeyakrishnan', 1],
      ['LinkedIn', 'https://linkedin.com/in/selvajeyakrishnan', 2],
      ['Email', 'mailto:selvajeyakrishnan@email.com', 3]
    ]);
    console.log('Default social links seeded.');
  }

  // Seed settings
  const settingsCount = getOne('SELECT COUNT(*) as c FROM settings');
  if (settingsCount.c === 0) {
    runMany('INSERT INTO settings (key, value) VALUES (?, ?)', [
      ['site_title', 'Selva Jeyakrishnan — Software Developer'],
      ['footer_text', 'Software Developer • AI/ML • Full Stack • Automation'],
      ['available_for_freelance', 'true']
    ]);
    console.log('Default settings seeded.');
  }

  console.log('Database initialized successfully at', require('./db').DB_PATH);
}

if (require.main === module) {
  initDatabase().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
}

module.exports = { initDatabase };
