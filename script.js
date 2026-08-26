/* ============================================
   SELVA JEYAKRISHNAN — PORTFOLIO SCRIPT
   ============================================ */

const API = '/api';

// --- Data stores ---
let projects = [];
let skills = [];
let services = [];
let experienceData = [];
let socialLinks = [];
let profileData = {};

// --- Process Data (static) ---
const processSteps = [
  { number: '01', title: 'Discover', description: 'Understand requirements and the business problem.' },
  { number: '02', title: 'Plan', description: 'Define architecture, features, and project scope.' },
  { number: '03', title: 'Build', description: 'Develop with clean, maintainable code.' },
  { number: '04', title: 'Test', description: 'Test functionality, performance, and reliability.' },
  { number: '05', title: 'Deploy', description: 'Deploy and configure infrastructure.' },
  { number: '06', title: 'Improve', description: 'Maintain, optimize, and add features.' }
];

// --- API Fetcher ---
async function apiFetch(endpoint) {
  try {
    const res = await fetch(API + endpoint);
    if (!res.ok) throw new Error('Failed to load');
    return await res.json();
  } catch (e) {
    console.warn('API fetch failed for', endpoint, e);
    return null;
  }
}

async function loadPortfolioData() {
  const [projData, skillData, svcData, expData, socialData, profileResult] = await Promise.all([
    apiFetch('/projects'),
    apiFetch('/skills'),
    apiFetch('/services'),
    apiFetch('/experience'),
    apiFetch('/social'),
    apiFetch('/profile')
  ]);

  if (projData) projects = projData.map(p => ({ ...p, id: String(p.id) }));
  if (skillData) skills = skillData;
  if (svcData) services = svcData;
  if (expData) experienceData = expData;
  if (socialData) socialLinks = socialData;
  if (profileResult) {
    profileData = profileResult;
    applyProfileData(profileResult);
  }
}

// --- Apply profile data to DOM ---
function applyProfileData(p) {
  if (!p) return;
  if (p.name) document.querySelectorAll('.identity-name, .footer-brand p').forEach(el => {
    if (el.classList.contains('identity-name')) el.textContent = p.name;
  });
  if (p.title) { const el = document.querySelector('.identity-role'); if (el) el.textContent = p.title; }
  if (p.subtitle) { const el = document.querySelector('.identity-spec'); if (el) el.textContent = p.subtitle; }
  if (p.status) { const el = document.querySelector('.identity-status span:last-child'); if (el) el.textContent = p.status; }
  if (p.email) { const el = document.querySelector('a[href^="mailto:"] span:last-child'); if (el) el.textContent = p.email; }
}

// --- Initialize Skills ---
function initSkills() {
  const grid = document.getElementById('skillsGrid');
  const grouped = {};
  skills.forEach(s => {
    if (!grouped[s.category]) grouped[s.category] = [];
    grouped[s.category].push(s.name);
  });
  const cats = Object.entries(grouped).map(([category, items]) => ({ category, items }));
  grid.innerHTML = cats.map(cat => `
    <div class="skill-category" data-animate>
      <h3 class="skill-category-title">${cat.category}</h3>
      <div class="skill-tags">
        ${cat.items.map(item => `<span class="skill-tag">${item}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

// --- Initialize Projects ---
function initProjects() {
  const grid = document.getElementById('projectsGrid');
  const gradients = [
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #4facfe, #00f2fe)',
    'linear-gradient(135deg, #a8edea, #fed6e3)',
    'linear-gradient(135deg, #ffecd2, #fcb69f)',
    'linear-gradient(135deg, #a18cd1, #fbc2eb)'
  ];
  const icons = { fullstack: '🏢', ai: '📄', automation: '🧾' };
  grid.innerHTML = projects.map((p, i) => `
    <div class="project-card" data-category="${p.category}" data-animate>
      <div class="project-card-image" style="background: ${p.thumbnail || gradients[i % gradients.length]}">
        <span class="project-icon">${icons[p.category] || '💻'}</span>
      </div>
      <div class="project-card-body">
        <span class="project-card-category">${p.category_label || p.category}</span>
        <h3 class="project-card-title">${p.title}</h3>
        <p class="project-card-desc">${p.short_description || p.description || ''}</p>
        <span class="project-card-status ${p.status === 'completed' ? 'status-completed' : 'status-development'}">${p.status || 'completed'}</span>
        <div class="project-card-tech">
          ${(p.technologies || []).slice(0, 5).map(t => `<span class="project-tech-tag">${t}</span>`).join('')}
        </div>
        <div class="project-card-actions">
          <button class="btn btn-primary" onclick="openProjectModal('${p.id}')">View Details</button>
          ${p.github_url ? `<a href="${p.github_url}" target="_blank" rel="noopener" class="btn btn-secondary">GitHub</a>` : ''}
          ${p.demo_url ? `<a href="${p.demo_url}" target="_blank" rel="noopener" class="btn btn-secondary">Live Demo</a>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

// --- Initialize Services ---
function initServices() {
  const grid = document.getElementById('servicesGrid');
  grid.innerHTML = services.map(s => `
    <div class="service-card" data-animate>
      <div class="service-icon">${s.icon}</div>
      <h3>${s.title}</h3>
      <p>${s.description}</p>
    </div>
  `).join('');
}

// --- Initialize Process ---
function initProcess() {
  const timeline = document.getElementById('processTimeline');
  timeline.innerHTML = processSteps.map(s => `
    <div class="process-step" data-animate>
      <div class="process-number">${s.number}</div>
      <h3>${s.title}</h3>
      <p>${s.description}</p>
    </div>
  `).join('');
}

// --- Project Modal ---
function openProjectModal(id) {
  const project = projects.find(p => String(p.id) === String(id));
  if (!project) return;

  const modal = document.getElementById('projectModal');
  const body = document.getElementById('modalBody');
  const features = project.features || [];
  const techs = project.technologies || [];
  const images = project.images || [];
  const videos = project.videos || [];

  let imagesHtml = '';
  if (images.length > 0) {
    imagesHtml = `<div class="modal-section"><h3>Screenshots</h3><div class="modal-gallery">${images.map(img => `<div class="modal-gallery-item"><img src="${img.image_path}" alt="${img.caption || 'Screenshot'}" loading="lazy"></div>`).join('')}</div></div>`;
  }

  let videosHtml = '';
  if (videos.length > 0) {
    videosHtml = `<div class="modal-section"><h3>Demo Videos</h3><div class="modal-videos">${videos.map(v => {
      if (v.video_type === 'url' && v.video_url) {
        let embedUrl = v.video_url;
        if (v.video_url.includes('youtube.com') || v.video_url.includes('youtu.be')) {
          const vid = v.video_url.match(/(?:v=|youtu\.be\/)([^&\s]+)/);
          embedUrl = vid ? `https://www.youtube.com/embed/${vid[1]}` : v.video_url;
        }
        return `<div class="modal-video-item"><h4>${v.title || 'Demo Video'}</h4><div class="video-embed"><iframe src="${embedUrl}" frameborder="0" allowfullscreen></iframe></div></div>`;
      } else if (v.video_path) {
        return `<div class="modal-video-item"><h4>${v.title || 'Demo Video'}</h4><div class="video-embed"><video controls src="${v.video_path}"></video></div></div>`;
      }
      return '';
    }).join('')}</div></div>`;
  }

  body.innerHTML = `
    <h2>${project.title}</h2>
    <p class="modal-category">${project.category_label || project.category}</p>
    
    <div class="modal-section">
      <h3>Overview</h3>
      <p>${project.long_description || project.short_description || ''}</p>
    </div>

    ${project.problem ? `<div class="modal-section"><h3>Problem</h3><p>${project.problem}</p></div>` : ''}
    ${project.solution ? `<div class="modal-section"><h3>Solution</h3><p>${project.solution}</p></div>` : ''}

    ${features.length > 0 ? `<div class="modal-section"><h3>Features</h3><ul>${features.map(f => `<li>${f}</li>`).join('')}</ul></div>` : ''}

    ${techs.length > 0 ? `<div class="modal-section"><h3>Tech Stack</h3><div class="modal-tech">${techs.map(t => `<span>${t}</span>`).join('')}</div></div>` : ''}

    ${imagesHtml}
    ${videosHtml}

    <div class="modal-actions">
      ${project.github_url ? `<a href="${project.github_url}" target="_blank" rel="noopener" class="btn btn-primary">GitHub</a>` : ''}
      ${project.demo_url ? `<a href="${project.demo_url}" target="_blank" rel="noopener" class="btn btn-primary">Live Demo</a>` : ''}
      <span class="project-card-status ${project.status === 'completed' ? 'status-completed' : 'status-development'}" style="margin: 0;">${project.status || 'completed'}</span>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('projectModal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// --- Project Filtering ---
function initFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      document.querySelectorAll('.project-card').forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('hidden');
          card.style.display = '';
        } else {
          card.classList.add('hidden');
          card.style.display = 'none';
        }
      });
    });
  });
}

// --- Navigation ---
function initNav() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  const links = document.querySelectorAll('.nav-link');

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    menu.classList.toggle('active');
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      menu.classList.remove('active');
    });
  });

  // Scroll handling
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
        updateActiveNav();
        ticking = false;
      });
      ticking = true;
    }
  });
}

function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-link');
  let current = '';

  sections.forEach(section => {
    const top = section.offsetTop - 120;
    if (window.scrollY >= top) {
      current = section.getAttribute('id');
    }
  });

  links.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}

// --- Scroll Animations ---
function initAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
}

// --- Contact Form ---
function initForm() {
  const form = document.getElementById('contactForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formParent = form.parentNode;
    form.remove();
    const success = document.createElement('div');
    success.className = 'contact-form form-success';
    success.innerHTML = `
      <h3>Message Sent!</h3>
      <p>Thank you for reaching out. I'll get back to you soon.</p>
    `;
    formParent.appendChild(success);
  });
}

// --- Hero Canvas (Particle Network) ---
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;
  const PARTICLE_COUNT = 60;
  const MAX_DIST = 150;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.r = Math.random() * 2 + 1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(108, 92, 231, 0.4)';
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(108, 92, 231, ${0.12 * (1 - dist / MAX_DIST)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    animId = requestAnimationFrame(animate);
  }

  init();
  animate();
  window.addEventListener('resize', () => { resize(); });
}

// --- About Profile Particles ---
function initAboutParticles() {
  const canvas = document.getElementById('aboutParticles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let isHovering = false;
  const wrapper = document.getElementById('aboutImageWrapper');

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = (Math.random() - 0.5) * 0.8;
      this.r = Math.random() * 2 + 0.5;
      this.alpha = 0;
      this.targetAlpha = 0;
    }
    update() {
      this.alpha += (this.targetAlpha - this.alpha) * 0.05;
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
    draw() {
      if (this.alpha < 0.01) return;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(108, 92, 231, ${this.alpha * 0.6})`;
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < 25; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.targetAlpha = isHovering ? 1 : 0; p.update(); p.draw(); });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80 && isHovering) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(108, 92, 231, ${0.2 * (1 - dist / 80)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }

  if (wrapper) {
    wrapper.addEventListener('mouseenter', () => { isHovering = true; });
    wrapper.addEventListener('mouseleave', () => { isHovering = false; });
  }

  init();
  animate();
  window.addEventListener('resize', resize);
}

// --- Modal Close ---
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('projectModal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// --- Initialize Everything ---
document.addEventListener('DOMContentLoaded', async () => {
  // Load data from API
  await loadPortfolioData();

  // Initialize all sections
  initSkills();
  initProjects();
  initServices();
  initProcess();
  initFilters();
  initNav();
  initHeroCanvas();
  initAboutParticles();
  initForm();

  // Also update skills strip from API data
  initSkillsStrip();

  // Delay animations to ensure DOM is ready
  requestAnimationFrame(() => {
    initAnimations();
  });
});

// --- Skills Strip ---
function initSkillsStrip() {
  if (!skills.length) return;
  const strip = document.querySelector('.skills-strip');
  if (!strip) return;
  const names = skills.map(s => s.name);
  strip.innerHTML = names.map(n => `<span class="strip-tag">${n}</span>`).join('');
}

/* ============================================
   OWNER MODE — CMS Management System
   ============================================ */

let ownerMode = false;

// --- Owner API Helper ---
async function ownerFetch(endpoint, options = {}) {
  const token = localStorage.getItem('owner_token');
  if (!token) { logoutOwner(); return null; }
  try {
    const res = await fetch('/api' + endpoint, {
      ...options,
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token, ...options.headers }
    });
    if (res.status === 401) { logoutOwner(); return null; }
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Request failed'); }
    return await res.json();
  } catch (e) { showToast(e.message, 'error'); throw e; }
}

async function ownerUpload(endpoint, formData) {
  const token = localStorage.getItem('owner_token');
  const res = await fetch('/api' + endpoint, { method: 'POST', headers: { 'Authorization': 'Bearer ' + token }, body: formData });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Upload failed'); }
  return await res.json();
}

// --- Toast ---
function showToast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = 'owner-toast ' + type;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// --- Confirm ---
function confirmAction(title, text) {
  return new Promise(resolve => {
    const ov = document.createElement('div');
    ov.className = 'owner-confirm-overlay';
    ov.innerHTML = `<div class="owner-confirm-box"><h4>${title}</h4><p>${text}</p><div class="owner-confirm-actions"><button class="owner-btn owner-btn-secondary" data-a="no">Cancel</button><button class="owner-btn owner-btn-danger" data-a="yes">Confirm</button></div></div>`;
    document.body.appendChild(ov);
    ov.addEventListener('click', e => { const a = e.target.dataset.a; if (a) { resolve(a === 'yes'); ov.remove(); } });
  });
}

// --- Login / Logout ---
async function loginOwner(email, password) {
  const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  localStorage.setItem('owner_token', data.token);
  return data;
}

function logoutOwner() {
  localStorage.removeItem('owner_token');
  fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  deactivateOwnerMode();
}

// --- Owner Mode Activate/Deactivate ---
function activateOwnerMode() {
  ownerMode = true;
  document.getElementById('ownerBar').classList.add('active');
  document.getElementById('ownerSection').classList.add('active');
  document.getElementById('ownerTrigger').textContent = '⚙';
  document.querySelectorAll('body > section, body > footer').forEach(el => el.style.display = 'none');
  document.getElementById('heroCanvas').style.display = 'none';
  loadOwnerSection('overview');
}

function deactivateOwnerMode() {
  ownerMode = false;
  document.getElementById('ownerBar').classList.remove('active');
  document.getElementById('ownerSection').classList.remove('active');
  document.getElementById('ownerTrigger').textContent = '🔒';
  document.querySelectorAll('body > section, body > footer').forEach(el => el.style.display = '');
  document.getElementById('heroCanvas').style.display = '';
}

// --- Section Router ---
async function loadOwnerSection(section) {
  document.querySelectorAll('.owner-nav-btn').forEach(b => b.classList.toggle('active', b.dataset.section === section));
  const c = document.getElementById('ownerSectionContent');
  c.innerHTML = '<div style="text-align:center;padding:60px;color:var(--text-muted)">Loading...</div>';
  try {
    switch (section) {
      case 'overview': await renderOverview(c); break;
      case 'profile': await renderProfile(c); break;
      case 'skills': await renderSkills(c); break;
      case 'projects': await renderProjects(c); break;
      case 'services': await renderServices(c); break;
      case 'experience': await renderExperience(c); break;
      case 'media': await renderMedia(c); break;
      case 'messages': await renderMessages(c); break;
      case 'social': await renderSocial(c); break;
      case 'settings': await renderSettings(c); break;
    }
  } catch (e) { c.innerHTML = `<div class="owner-empty"><div class="owner-empty-icon">⚠️</div><div class="owner-empty-text">Failed to load</div></div>`; }
}

// --- OVERVIEW ---
async function renderOverview(c) {
  const d = await ownerFetch('/admin/overview');
  if (!d) return;
  c.innerHTML = `
    <h2 class="oh-title">Portfolio Control Center</h2>
    <p class="oh-subtitle">Manage your portfolio content from here.</p>
    <div class="owner-stats-grid">
      <div class="owner-stat-card"><span class="owner-stat-num">${d.projects}</span><span class="owner-stat-label">Projects</span></div>
      <div class="owner-stat-card"><span class="owner-stat-num">${d.skills}</span><span class="owner-stat-label">Skills</span></div>
      <div class="owner-stat-card"><span class="owner-stat-num">${d.services}</span><span class="owner-stat-label">Services</span></div>
      <div class="owner-stat-card"><span class="owner-stat-num">${d.unreadMessages || d.messages}</span><span class="owner-stat-label">Messages${d.unreadMessages ? ' (' + d.unreadMessages + ' unread)' : ''}</span></div>
      <div class="owner-stat-card"><span class="owner-stat-num">${(d.recentMedia || []).length}</span><span class="owner-stat-label">Media Files</span></div>
    </div>
    ${d.recentProjects && d.recentProjects.length ? `
      <div class="owner-recent-title">Recent Projects</div>
      ${d.recentProjects.map(p => `<div class="owner-project-card"><div class="owner-project-info"><h4>${p.title}</h4><div class="owner-project-meta"><span class="owner-badge ${p.status === 'completed' ? 'owner-badge-green' : 'owner-badge-yellow'}">${p.status}</span></div></div></div>`).join('')}
    ` : ''}
  `;
}

// --- PROFILE ---
async function renderProfile(c) {
  const p = await ownerFetch('/profile');
  if (!p) return;
  c.innerHTML = `
    <h2 class="oh-title">Edit Profile</h2>
    <p class="oh-subtitle">Update your public profile information.</p>
    <div class="owner-form">
      <div class="owner-form-group"><label>Profile Image</label><div style="display:flex;gap:16px;align-items:center"><img src="${p.profile_image || 'selva_profile.jpg'}" class="owner-img-preview" id="profileImgPreview"><div><input type="file" id="profileImageInput" accept="image/*" style="display:none"><button class="owner-btn owner-btn-secondary owner-btn-sm" onclick="document.getElementById('profileImageInput').click()">Replace Image</button></div></div></div>
      <div class="owner-form-row">
        <div class="owner-form-group"><label>Name</label><input id="pf_name" value="${esc(p.name || '')}"></div>
        <div class="owner-form-group"><label>Title</label><input id="pf_title" value="${esc(p.title || '')}"></div>
      </div>
      <div class="owner-form-group"><label>Subtitle</label><input id="pf_subtitle" value="${esc(p.subtitle || '')}"></div>
      <div class="owner-form-group"><label>Introduction</label><textarea id="pf_intro" rows="2">${esc(p.introduction || '')}</textarea></div>
      <div class="owner-form-group"><label>About</label><textarea id="pf_about" rows="4">${esc(p.about || '')}</textarea></div>
      <div class="owner-form-row">
        <div class="owner-form-group"><label>Availability Status</label><input id="pf_status" value="${esc(p.status || '')}"></div>
        <div class="owner-form-group"><label>Email</label><input id="pf_email" value="${esc(p.email || '')}"></div>
      </div>
      <div class="owner-form-row">
        <div class="owner-form-group"><label>Hero Tagline</label><input id="pf_tagline" value="${esc(p.hero_tagline || '')}"></div>
        <div class="owner-form-group"><label>Hero Description</label><input id="pf_hero_desc" value="${esc(p.hero_description || '')}"></div>
      </div>
      <div class="owner-form-group"><label>Location</label><input id="pf_location" value="${esc(p.location || '')}"></div>
      <div class="owner-form-actions"><button class="owner-btn owner-btn-primary" onclick="saveProfile()">Save Changes</button></div>
    </div>
  `;
  document.getElementById('profileImageInput').addEventListener('change', async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append('image', file);
    try { const r = await ownerUpload('/admin/profile/image', fd); document.getElementById('profileImgPreview').src = r.image_path; showToast('Image updated'); } catch(e) { showToast('Upload failed', 'error'); }
  });
}

async function saveProfile() {
  const body = { name: g('pf_name'), title: g('pf_title'), subtitle: g('pf_subtitle'), introduction: g('pf_intro'), about: g('pf_about'), status: g('pf_status'), email: g('pf_email'), location: g('pf_location'), hero_tagline: g('pf_tagline'), hero_description: g('pf_hero_desc') };
  try { await ownerFetch('/admin/profile', { method: 'PUT', body: JSON.stringify(body) }); showToast('Profile saved'); } catch(e) {}
}

// --- SKILLS ---
async function renderSkills(c) {
  const list = await ownerFetch('/admin/skills');
  if (!list) return;
  c.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px"><h2 class="oh-title" style="margin:0">Skills</h2><button class="owner-btn owner-btn-primary owner-btn-sm" onclick="showAddSkill()">+ Add Skill</button></div>
    <div id="skillForm"></div>
    <div class="owner-table-wrap"><table class="owner-table">
      <thead><tr><th>Name</th><th>Category</th><th>Order</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${list.map(s => `<tr><td>${esc(s.name)}</td><td>${esc(s.category)}</td><td>${s.display_order}</td><td><span class="owner-badge ${s.is_active ? 'owner-badge-green' : 'owner-badge-red'}">${s.is_active ? 'Active' : 'Hidden'}</span></td>
      <td><button class="owner-btn owner-btn-secondary owner-btn-sm" onclick='editSkill(${JSON.stringify(s)})'>Edit</button> <button class="owner-btn owner-btn-danger owner-btn-sm" onclick="deleteSkill(${s.id})">Delete</button></td></tr>`).join('')}</tbody>
    </table></div>
  `;
}

function showAddSkill() {
  document.getElementById('skillForm').innerHTML = `<div class="owner-form" style="margin-bottom:24px"><div class="owner-form-row">
    <div class="owner-form-group"><label>Name</label><input id="sk_name"></div>
    <div class="owner-form-group"><label>Category</label><select id="sk_cat"><option>Programming</option><option>AI / ML</option><option>Backend</option><option>Frontend</option><option>Databases</option><option>Tools</option></select></div>
  </div><div class="owner-form-row"><div class="owner-form-group"><label>Order</label><input id="sk_order" type="number" value="0"></div><div class="owner-form-group"><label>Status</label><select id="sk_active"><option value="1">Active</option><option value="0">Hidden</option></select></div></div>
  <div class="owner-form-actions"><button class="owner-btn owner-btn-primary" onclick="saveSkill()">Save</button><button class="owner-btn owner-btn-secondary" onclick="document.getElementById('skillForm').innerHTML=''">Cancel</button></div></div>`;
}

function editSkill(s) {
  document.getElementById('skillForm').innerHTML = `<div class="owner-form" style="margin-bottom:24px"><div class="owner-form-row">
    <div class="owner-form-group"><label>Name</label><input id="sk_name" value="${esc(s.name)}"></div>
    <div class="owner-form-group"><label>Category</label><select id="sk_cat">${['Programming','AI / ML','Backend','Frontend','Databases','Tools'].map(c => `<option${c===s.category?' selected':''}>${c}</option>`).join('')}</select></div>
  </div><div class="owner-form-row"><div class="owner-form-group"><label>Order</label><input id="sk_order" type="number" value="${s.display_order}"></div><div class="owner-form-group"><label>Status</label><select id="sk_active"><option value="1"${s.is_active?' selected':''}>Active</option><option value="0"${!s.is_active?' selected':''}>Hidden</option></select></div></div>
  <div class="owner-form-actions"><button class="owner-btn owner-btn-primary" onclick="saveSkill(${s.id})">Update</button><button class="owner-btn owner-btn-secondary" onclick="document.getElementById('skillForm').innerHTML=''">Cancel</button></div></div>`;
}

async function saveSkill(id) {
  const body = { name: g('sk_name'), category: g('sk_cat'), display_order: parseInt(g('sk_order')) || 0, is_active: parseInt(g('sk_active')) };
  try { await ownerFetch(id ? `/admin/skills/${id}` : '/admin/skills', { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) }); showToast('Skill saved'); loadOwnerSection('skills'); } catch(e) {}
}

async function deleteSkill(id) {
  if (!await confirmAction('Delete Skill', 'Are you sure?')) return;
  try { await ownerFetch(`/admin/skills/${id}`, { method: 'DELETE' }); showToast('Skill deleted'); loadOwnerSection('skills'); } catch(e) {}
}

// --- PROJECTS ---
async function renderProjects(c) {
  const list = await ownerFetch('/admin/projects');
  if (!list) return;
  c.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px"><h2 class="oh-title" style="margin:0">Projects</h2><button class="owner-btn owner-btn-primary owner-btn-sm" onclick="showProjectForm()">+ Add New Project</button></div>
    <div id="projectForm"></div>
    <div id="projectList">${list.map(p => `<div class="owner-project-card"><div class="owner-project-info"><h4>${esc(p.title)}</h4><div class="owner-project-meta"><span class="owner-badge owner-badge-purple">${esc(p.category)}</span><span class="owner-badge ${p.is_published ? 'owner-badge-green' : 'owner-badge-yellow'}">${p.is_published ? 'Published' : 'Draft'}</span><span>${p.image_count || 0} images</span><span>${p.video_count || 0} videos</span></div></div><div class="owner-project-actions"><button class="owner-btn owner-btn-secondary owner-btn-sm" onclick="editProject(${p.id})">Edit</button><button class="owner-btn owner-btn-secondary owner-btn-sm" onclick="editProjectMedia(${p.id})">Media</button><button class="owner-btn owner-btn-danger owner-btn-sm" onclick="deleteProject(${p.id})">Delete</button></div></div>`).join('')}</div>
  `;
}

function showProjectForm(data) {
  const isEdit = !!data;
  const pf = document.getElementById('projectForm');
  pf.innerHTML = `<div class="owner-form" style="margin-bottom:24px"><h3 style="margin-bottom:16px">${isEdit ? 'Edit' : 'New'} Project</h3>
    <div class="owner-form-row"><div class="owner-form-group"><label>Project Name *</label><input id="pj_title" value="${esc(data?.title || '')}"></div>
    <div class="owner-form-group"><label>Category</label><select id="pj_cat">${['fullstack','ai','automation'].map(c => `<option${c===(data?.category||'fullstack')?' selected':''}>${c}</option>`).join('')}</select></div></div>
    <div class="owner-form-group"><label>Category Label</label><input id="pj_clabel" value="${esc(data?.category_label || '')}"></div>
    <div class="owner-form-group"><label>Short Description</label><textarea id="pj_short" rows="2">${esc(data?.short_description || '')}</textarea></div>
    <div class="owner-form-group"><label>Detailed Description</label><textarea id="pj_long" rows="4">${esc(data?.long_description || '')}</textarea></div>
    <div class="owner-form-group"><label>Problem</label><textarea id="pj_problem" rows="2">${esc(data?.problem || '')}</textarea></div>
    <div class="owner-form-group"><label>Solution</label><textarea id="pj_solution" rows="2">${esc(data?.solution || '')}</textarea></div>
    <div class="owner-form-group"><label>Features (press Enter to add)</label><div id="pj_features_tags" class="owner-tags">${(data?.features||[]).map((f,i) => `<span class="owner-tag">${esc(f)}<span class="owner-tag-remove" onclick="this.parentElement.remove()">×</span></span>`).join('')}</div><div class="owner-tag-input"><input id="pj_feat_input" placeholder="Add feature..."></div></div>
    <div class="owner-form-group"><label>Technologies (press Enter to add)</label><div id="pj_techs_tags" class="owner-tags">${(data?.technologies||[]).map(t => `<span class="owner-tag">${esc(t)}<span class="owner-tag-remove" onclick="this.parentElement.remove()">×</span></span>`).join('')}</div><div class="owner-tag-input"><input id="pj_tech_input" placeholder="Add technology..."></div></div>
    <div class="owner-form-row"><div class="owner-form-group"><label>GitHub URL</label><input id="pj_github" value="${esc(data?.github_url || '')}"></div>
    <div class="owner-form-group"><label>Demo URL</label><input id="pj_demo" value="${esc(data?.demo_url || '')}"></div></div>
    <div class="owner-form-row"><div class="owner-form-group"><label>Status</label><select id="pj_status">${['completed','in_progress','draft'].map(s => `<option${s===(data?.status||'completed')?' selected':''}>${s}</option>`).join('')}</select></div>
    <div class="owner-form-group"><label>Published</label><select id="pj_pub"><option value="1"${data?.is_published!==0?' selected':''}>Yes</option><option value="0"${data?.is_published===0?' selected':''}>No (Draft)</option></select></div></div>
    <div class="owner-form-group"><label>Display Order</label><input id="pj_order" type="number" value="${data?.display_order || 0}"></div>
    <div class="owner-form-actions"><button class="owner-btn owner-btn-primary" onclick="saveProject(${data?.id || 'null'})">${isEdit ? 'Update' : 'Create'} Project</button><button class="owner-btn owner-btn-secondary" onclick="document.getElementById('projectForm').innerHTML=''">Cancel</button></div></div>`;
  document.getElementById('pj_feat_input').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('pj_features_tags').insertAdjacentHTML('beforeend', `<span class="owner-tag">${esc(e.target.value)}<span class="owner-tag-remove" onclick="this.parentElement.remove()">×</span></span>`); e.target.value = ''; } });
  document.getElementById('pj_tech_input').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('pj_techs_tags').insertAdjacentHTML('beforeend', `<span class="owner-tag">${esc(e.target.value)}<span class="owner-tag-remove" onclick="this.parentElement.remove()">×</span></span>`); e.target.value = ''; } });
  pf.scrollIntoView({ behavior: 'smooth' });
}

function getTagTexts(containerId) {
  return [...document.querySelectorAll(`#${containerId} .owner-tag`)].map(t => t.textContent.replace('×', '').trim());
}

async function saveProject(id) {
  const body = { title: g('pj_title'), category: g('pj_cat'), category_label: g('pj_clabel'), short_description: g('pj_short'), long_description: g('pj_long'), problem: g('pj_problem'), solution: g('pj_solution'), features: getTagTexts('pj_features_tags'), technologies: getTagTexts('pj_techs_tags'), github_url: g('pj_github'), demo_url: g('pj_demo'), status: g('pj_status'), is_published: parseInt(g('pj_pub')), display_order: parseInt(g('pj_order')) || 0 };
  try { await ownerFetch(id ? `/admin/projects/${id}` : '/admin/projects', { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) }); showToast('Project saved'); loadOwnerSection('projects'); } catch(e) {}
}

async function editProject(id) {
  const p = await ownerFetch(`/projects/${id}`);
  if (p) showProjectForm(p);
}

async function deleteProject(id) {
  if (!await confirmAction('Delete Project', 'This will also delete all images and videos. Continue?')) return;
  try { await ownerFetch(`/admin/projects/${id}`, { method: 'DELETE' }); showToast('Project deleted'); loadOwnerSection('projects'); } catch(e) {}
}

// --- PROJECT MEDIA ---
async function editProjectMedia(id) {
  const c = document.getElementById('projectForm');
  c.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted)">Loading...</div>';
  c.scrollIntoView({ behavior: 'smooth' });
  const p = await ownerFetch(`/projects/${id}`);
  if (!p) return;
  const images = p.images || [];
  const videos = p.videos || [];
  c.innerHTML = `
    <div class="owner-form" style="margin-bottom:24px">
      <h3 style="margin-bottom:8px">Media — ${esc(p.title)}</h3>
      <p class="oh-subtitle">Manage screenshots and demo videos.</p>
      <h4 style="margin:20px 0 12px;font-size:0.9375rem">Screenshots</h4>
      <div style="margin-bottom:16px"><input type="file" id="pjImgUpload" multiple accept="image/*" style="display:none"><button class="owner-btn owner-btn-secondary owner-btn-sm" onclick="document.getElementById('pjImgUpload').click()">+ Upload Images</button></div>
      <div class="owner-media-grid" id="pjImgGrid">${images.map(img => `<div class="owner-media-item"><img src="${img.image_path}" alt=""><div class="owner-media-delete" onclick="deleteProjectImage(${img.id},${id})">×</div></div>`).join('') || '<div class="owner-empty"><div class="owner-empty-text">No images yet</div></div>'}</div>
      <h4 style="margin:24px 0 12px;font-size:0.9375rem">Demo Videos</h4>
      <div style="margin-bottom:16px"><button class="owner-btn owner-btn-secondary owner-btn-sm" onclick="showAddVideoForm(${id})">+ Add Video URL</button><input type="file" id="pjVidUpload" accept="video/*" style="display:none"></div>
      <div id="videoForm"></div>
      <div id="pjVidList">${videos.map(v => `<div class="owner-project-card"><div class="owner-project-info"><h4>${esc(v.title || 'Video')}</h4><div class="owner-project-meta"><span class="owner-badge owner-badge-purple">${v.video_type}</span><span>${v.video_url || v.video_path || ''}</span></div></div><div class="owner-project-actions"><button class="owner-btn owner-btn-danger owner-btn-sm" onclick="deleteProjectVideo(${v.id},${id})">Delete</button></div></div>`).join('') || '<div class="owner-empty"><div class="owner-empty-text">No videos yet</div></div>'}</div>
      <div class="owner-form-actions" style="margin-top:24px"><button class="owner-btn owner-btn-secondary" onclick="document.getElementById('projectForm').innerHTML=''">← Back</button></div>
    </div>
  `;
  document.getElementById('pjImgUpload').addEventListener('change', async (e) => {
    const fd = new FormData();
    [...e.target.files].forEach(f => fd.append('images', f));
    try { await ownerUpload(`/admin/projects/${id}/images`, fd); showToast('Images uploaded'); editProjectMedia(id); } catch(err) { showToast('Upload failed', 'error'); }
  });
}

function showAddVideoForm(pid) {
  document.getElementById('videoForm').innerHTML = `<div class="owner-form" style="margin:16px 0"><div class="owner-form-group"><label>Title</label><input id="vid_title"></div><div class="owner-form-group"><label>Video URL (YouTube, Vimeo, or direct)</label><input id="vid_url" placeholder="https://..."></div><div class="owner-form-actions"><button class="owner-btn owner-btn-primary" onclick="saveProjectVideo(${pid})">Add Video</button><button class="owner-btn owner-btn-secondary" onclick="document.getElementById('videoForm').innerHTML=''">Cancel</button></div></div>`;
}

async function saveProjectVideo(pid) {
  const body = { title: g('vid_title'), video_url: g('vid_url'), video_type: 'url' };
  try { await ownerFetch(`/admin/projects/${pid}/videos`, { method: 'POST', body: JSON.stringify(body) }); showToast('Video added'); editProjectMedia(pid); } catch(e) {}
}

async function deleteProjectImage(imgId, pid) {
  if (!await confirmAction('Delete Image', 'Remove this image?')) return;
  try { await ownerFetch(`/admin/project-images/${imgId}`, { method: 'DELETE' }); showToast('Image deleted'); editProjectMedia(pid); } catch(e) {}
}

async function deleteProjectVideo(vidId, pid) {
  if (!await confirmAction('Delete Video', 'Remove this video?')) return;
  try { await ownerFetch(`/admin/project-videos/${vidId}`, { method: 'DELETE' }); showToast('Video deleted'); editProjectMedia(pid); } catch(e) {}
}

// --- SERVICES ---
async function renderServices(c) {
  const list = await ownerFetch('/admin/services');
  if (!list) return;
  c.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px"><h2 class="oh-title" style="margin:0">Services</h2><button class="owner-btn owner-btn-primary owner-btn-sm" onclick="showServiceForm()">+ Add Service</button></div>
    <div id="svcForm"></div>
    <div class="owner-table-wrap"><table class="owner-table"><thead><tr><th>Icon</th><th>Title</th><th>Description</th><th>Order</th><th>Actions</th></tr></thead>
    <tbody>${list.map(s => `<tr><td>${s.icon}</td><td>${esc(s.title)}</td><td style="max-width:300px">${esc(s.description).substring(0,80)}...</td><td>${s.display_order}</td>
    <td><button class="owner-btn owner-btn-secondary owner-btn-sm" onclick='editService(${JSON.stringify(s)})'>Edit</button> <button class="owner-btn owner-btn-danger owner-btn-sm" onclick="deleteService(${s.id})">Delete</button></td></tr>`).join('')}</tbody></table></div>
  `;
}

function showServiceForm(data) {
  document.getElementById('svcForm').innerHTML = `<div class="owner-form" style="margin-bottom:24px"><div class="owner-form-row">
    <div class="owner-form-group"><label>Icon (emoji)</label><input id="sv_icon" value="${esc(data?.icon || '🌐')}"></div>
    <div class="owner-form-group"><label>Title</label><input id="sv_title" value="${esc(data?.title || '')}"></div>
  </div><div class="owner-form-group"><label>Description</label><textarea id="sv_desc" rows="2">${esc(data?.description || '')}</textarea></div>
  <div class="owner-form-row"><div class="owner-form-group"><label>Technologies</label><input id="sv_tech" value="${esc(data?.technologies || '')}"></div><div class="owner-form-group"><label>Order</label><input id="sv_order" type="number" value="${data?.display_order || 0}"></div></div>
  <div class="owner-form-actions"><button class="owner-btn owner-btn-primary" onclick="saveService(${data?.id || 'null'})">Save</button><button class="owner-btn owner-btn-secondary" onclick="document.getElementById('svcForm').innerHTML=''">Cancel</button></div></div>`;
}

async function saveService(id) {
  const body = { icon: g('sv_icon'), title: g('sv_title'), description: g('sv_desc'), technologies: g('sv_tech'), display_order: parseInt(g('sv_order')) || 0 };
  try { await ownerFetch(id ? `/admin/services/${id}` : '/admin/services', { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) }); showToast('Service saved'); loadOwnerSection('services'); } catch(e) {}
}

function editService(s) { showServiceForm(s); }

async function deleteService(id) {
  if (!await confirmAction('Delete Service', 'Are you sure?')) return;
  try { await ownerFetch(`/admin/services/${id}`, { method: 'DELETE' }); showToast('Service deleted'); loadOwnerSection('services'); } catch(e) {}
}

// --- EXPERIENCE ---
async function renderExperience(c) {
  const list = await ownerFetch('/admin/experience');
  if (!list) return;
  c.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px"><h2 class="oh-title" style="margin:0">Experience</h2><button class="owner-btn owner-btn-primary owner-btn-sm" onclick="showExpForm()">+ Add Experience</button></div>
    <div id="expForm"></div>
    <div class="owner-table-wrap"><table class="owner-table"><thead><tr><th>Company</th><th>Role</th><th>Type</th><th>Dates</th><th>Actions</th></tr></thead>
    <tbody>${list.map(e => `<tr><td>${esc(e.company)}</td><td>${esc(e.role)}</td><td>${esc(e.employment_type)}</td><td>${e.start_date} — ${e.end_date || 'Present'}</td>
    <td><button class="owner-btn owner-btn-secondary owner-btn-sm" onclick='editExp(${JSON.stringify(e)})'>Edit</button> <button class="owner-btn owner-btn-danger owner-btn-sm" onclick="deleteExp(${e.id})">Delete</button></td></tr>`).join('')}</tbody></table></div>
  `;
}

function showExpForm(data) {
  document.getElementById('expForm').innerHTML = `<div class="owner-form" style="margin-bottom:24px"><div class="owner-form-row">
    <div class="owner-form-group"><label>Company</label><input id="ex_comp" value="${esc(data?.company || '')}"></div>
    <div class="owner-form-group"><label>Role</label><input id="ex_role" value="${esc(data?.role || '')}"></div>
  </div><div class="owner-form-row">
    <div class="owner-form-group"><label>Employment Type</label><select id="ex_type">${['Full-time','Part-time','Internship','Freelance','Contract'].map(t => `<option${t===(data?.employment_type||'Full-time')?' selected':''}>${t}</option>`).join('')}</select></div>
    <div class="owner-form-group"><label>Location</label><input id="ex_loc" value="${esc(data?.location || '')}"></div>
  </div><div class="owner-form-row"><div class="owner-form-group"><label>Start Date</label><input id="ex_start" type="month" value="${data?.start_date || ''}"></div>
  <div class="owner-form-group"><label>End Date</label><input id="ex_end" type="month" value="${data?.end_date || ''}"></div></div>
  <div class="owner-form-group"><label>Description</label><textarea id="ex_desc" rows="3">${esc(data?.description || '')}</textarea></div>
  <div class="owner-form-group"><label>Technologies</label><input id="ex_tech" value="${esc(data?.technologies || '')}"></div>
  <div class="owner-form-actions"><button class="owner-btn owner-btn-primary" onclick="saveExp(${data?.id || 'null'})">Save</button><button class="owner-btn owner-btn-secondary" onclick="document.getElementById('expForm').innerHTML=''">Cancel</button></div></div>`;
}

function editExp(e) { showExpForm(e); }

async function saveExp(id) {
  const body = { company: g('ex_comp'), role: g('ex_role'), employment_type: g('ex_type'), location: g('ex_loc'), start_date: g('ex_start'), end_date: g('ex_end'), description: g('ex_desc'), technologies: g('ex_tech'), display_order: 0, is_current: 0 };
  try { await ownerFetch(id ? `/admin/experience/${id}` : '/admin/experience', { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) }); showToast('Experience saved'); loadOwnerSection('experience'); } catch(e) {}
}

async function deleteExp(id) {
  if (!await confirmAction('Delete Experience', 'Are you sure?')) return;
  try { await ownerFetch(`/admin/experience/${id}`, { method: 'DELETE' }); showToast('Experience deleted'); loadOwnerSection('experience'); } catch(e) {}
}

// --- MEDIA ---
async function renderMedia(c) {
  const list = await ownerFetch('/admin/media');
  if (!list) return;
  let currentFilter = 'all';
  function render(filter) {
    currentFilter = filter;
    const filtered = filter === 'all' ? list : list.filter(m => m.file_type.startsWith(filter === 'images' ? 'image' : filter === 'videos' ? 'video' : '') || m.category === filter);
    c.querySelectorAll('.owner-tab').forEach(t => t.classList.toggle('active', t.dataset.filter === filter));
    document.getElementById('mediaGrid').innerHTML = filtered.map(m => `<div class="owner-media-item">${m.file_type.startsWith('image') ? `<img src="${m.file_path}" alt="${esc(m.original_name)}" loading="lazy">` : `<video src="${m.file_path}"></video>`}<div class="owner-media-delete" onclick="deleteMedia(${m.id})">×</div></div>`).join('') || '<div class="owner-empty"><div class="owner-empty-text">No media files</div></div>';
  }
  c.innerHTML = `
    <h2 class="oh-title">Media Library</h2>
    <p class="oh-subtitle">${list.length} files total</p>
    <div class="owner-tabs" id="mediaTabs"><button class="owner-tab active" data-filter="all">All</button><button class="owner-tab" data-filter="images">Images</button><button class="owner-tab" data-filter="videos">Videos</button><button class="owner-tab" data-filter="profile">Profile</button><button class="owner-tab" data-filter="project">Projects</button></div>
    <div class="owner-upload-zone" id="mediaUploadZone"><div class="owner-upload-icon">📁</div><div class="owner-upload-text">Drop files here or click to upload</div><input type="file" id="mediaFileInput" multiple accept="image/*,video/*" style="display:none"></div>
    <div class="owner-media-grid" id="mediaGrid"></div>
  `;
  render('all');
  document.getElementById('mediaTabs').addEventListener('click', e => { if (e.target.dataset.filter) render(e.target.dataset.filter); });
  const zone = document.getElementById('mediaUploadZone');
  zone.addEventListener('click', () => document.getElementById('mediaFileInput').click());
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('dragover'); uploadMediaFiles(e.dataTransfer.files); });
  document.getElementById('mediaFileInput').addEventListener('change', e => uploadMediaFiles(e.target.files));
}

async function uploadMediaFiles(files) {
  const fd = new FormData();
  [...files].forEach(f => fd.append('files', f));
  try { await ownerUpload('/admin/media/upload', fd); showToast('Files uploaded'); loadOwnerSection('media'); } catch(e) { showToast('Upload failed', 'error'); }
}

async function deleteMedia(id) {
  if (!await confirmAction('Delete Media', 'Remove this file?')) return;
  try { await ownerFetch(`/admin/media/${id}`, { method: 'DELETE' }); showToast('Media deleted'); loadOwnerSection('media'); } catch(e) {}
}

// --- MESSAGES ---
async function renderMessages(c) {
  const list = await ownerFetch('/admin/messages');
  if (!list) return;
  c.innerHTML = `
    <h2 class="oh-title">Contact Messages</h2>
    <p class="oh-subtitle">${list.length} messages${list.filter(m => !m.is_read).length ? ' • ' + list.filter(m => !m.is_read).length + ' unread' : ''}</p>
    ${list.length ? list.map(m => `<div class="owner-msg-card ${m.is_read ? '' : 'unread'}">
      <div class="owner-msg-header"><div><div class="owner-msg-name">${esc(m.name)}</div><div class="owner-msg-email">${esc(m.email)} ${m.company ? '• ' + esc(m.company) : ''}</div></div><div class="owner-msg-date">${m.created_at || ''}</div></div>
      <div class="owner-msg-body">"${esc(m.message)}"</div>
      ${m.project_type ? `<div style="margin-bottom:8px"><span class="owner-badge owner-badge-purple">${esc(m.project_type)}</span> ${m.budget ? `<span class="owner-badge owner-badge-yellow">${esc(m.budget)}</span>` : ''}</div>` : ''}
      <div class="owner-msg-actions">
        ${!m.is_read ? `<button class="owner-btn owner-btn-secondary owner-btn-sm" onclick="markRead(${m.id})">Mark Read</button>` : ''}
        <button class="owner-btn owner-btn-danger owner-btn-sm" onclick="deleteMessage(${m.id})">Delete</button>
      </div>
    </div>`).join('') : '<div class="owner-empty"><div class="owner-empty-icon">📭</div><div class="owner-empty-text">No messages yet</div></div>'}
  `;
}

async function markRead(id) {
  try { await ownerFetch(`/admin/messages/${id}/read`, { method: 'PUT' }); showToast('Marked as read'); loadOwnerSection('messages'); } catch(e) {}
}

async function deleteMessage(id) {
  if (!await confirmAction('Delete Message', 'Remove this message?')) return;
  try { await ownerFetch(`/admin/messages/${id}`, { method: 'DELETE' }); showToast('Message deleted'); loadOwnerSection('messages'); } catch(e) {}
}

// --- SOCIAL LINKS ---
async function renderSocial(c) {
  const list = await ownerFetch('/admin/social');
  if (!list) return;
  c.innerHTML = `
    <h2 class="oh-title">Social Links</h2>
    <p class="oh-subtitle">Manage your public social media links.</p>
    <div class="owner-form" id="socialForm">${list.map((l, i) => `<div class="owner-form-row" style="margin-bottom:12px">
      <div class="owner-form-group"><label>Platform</label><input class="sl_platform" value="${esc(l.platform)}"></div>
      <div class="owner-form-group"><label>URL</label><input class="sl_url" value="${esc(l.url)}"></div>
    </div>`).join('')}
    <div id="socialNew"></div>
    <div class="owner-form-actions"><button class="owner-btn owner-btn-primary" onclick="saveSocial()">Save Links</button><button class="owner-btn owner-btn-secondary" onclick="addSocialField()">+ Add Link</button></div></div>
  `;
}

function addSocialField() {
  document.getElementById('socialNew').insertAdjacentHTML('beforeend', `<div class="owner-form-row" style="margin-bottom:12px"><div class="owner-form-group"><label>Platform</label><input class="sl_platform" placeholder="Platform"></div><div class="owner-form-group"><label>URL</label><input class="sl_url" placeholder="https://..."></div></div>`);
}

async function saveSocial() {
  const platforms = [...document.querySelectorAll('.sl_platform')];
  const urls = [...document.querySelectorAll('.sl_url')];
  const links = platforms.map((p, i) => ({ platform: p.value, url: urls[i].value, display_order: i, is_active: 1 })).filter(l => l.platform);
  try { await ownerFetch('/admin/social', { method: 'PUT', body: JSON.stringify({ links }) }); showToast('Social links saved'); } catch(e) {}
}

// --- SETTINGS ---
async function renderSettings(c) {
  const s = await ownerFetch('/admin/settings');
  if (!s) return;
  c.innerHTML = `
    <h2 class="oh-title">Settings</h2>
    <p class="oh-subtitle">Site configuration and account settings.</p>
    <div class="owner-form">
      <div class="owner-form-group"><label>Site Title</label><input id="set_title" value="${esc(s.site_title || '')}"></div>
      <div class="owner-form-group"><label>Footer Text</label><input id="set_footer" value="${esc(s.footer_text || '')}"></div>
      <div class="owner-form-group"><label>Available for Freelance</label><select id="set_freelance"><option value="true"${s.available_for_freelance==='true'?' selected':''}>Yes</option><option value="false"${s.available_for_freelance==='false'?' selected':''}>No</option></select></div>
      <div class="owner-form-actions"><button class="owner-btn owner-btn-primary" onclick="saveSettings()">Save Settings</button></div>
    </div>
    <h3 style="margin:40px 0 16px;font-size:1.125rem">Change Password</h3>
    <div class="owner-form">
      <div class="owner-form-group"><label>Current Password</label><input type="password" id="set_curr_pw"></div>
      <div class="owner-form-group"><label>New Password</label><input type="password" id="set_new_pw"></div>
      <div class="owner-form-actions"><button class="owner-btn owner-btn-primary" onclick="changePassword()">Update Password</button></div>
    </div>
  `;
}

async function saveSettings() {
  const body = { settings: { site_title: g('set_title'), footer_text: g('set_footer'), available_for_freelance: g('set_freelance') } };
  try { await ownerFetch('/admin/settings', { method: 'PUT', body: JSON.stringify(body) }); showToast('Settings saved'); } catch(e) {}
}

async function changePassword() {
  const curr = g('set_curr_pw'), nw = g('set_new_pw');
  if (!curr || !nw) { showToast('Both fields required', 'error'); return; }
  try { await ownerFetch('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword: curr, newPassword: nw }) }); showToast('Password changed'); document.getElementById('set_curr_pw').value = ''; document.getElementById('set_new_pw').value = ''; } catch(e) {}
}

// --- Helpers ---
function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function g(id) { return document.getElementById(id)?.value || ''; }

// --- Owner Mode Event Bindings ---
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('ownerTrigger').addEventListener('click', () => {
    if (ownerMode) { deactivateOwnerMode(); return; }
    if (localStorage.getItem('owner_token')) { activateOwnerMode(); }
    else { document.getElementById('ownerLoginOverlay').classList.add('active'); }
  });

  document.getElementById('ownerLoginClose').addEventListener('click', () => document.getElementById('ownerLoginOverlay').classList.remove('active'));
  document.getElementById('ownerLoginBack').addEventListener('click', e => { e.preventDefault(); document.getElementById('ownerLoginOverlay').classList.remove('active'); });

  document.getElementById('ownerLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('ownerLoginError');
    const btn = document.getElementById('ownerLoginBtn');
    errEl.textContent = ''; btn.textContent = 'Signing in...';
    try {
      await loginOwner(document.getElementById('ownerEmail').value, document.getElementById('ownerPassword').value);
      document.getElementById('ownerLoginOverlay').classList.remove('active');
      activateOwnerMode();
      showToast('Welcome back!');
    } catch (err) { errEl.textContent = err.message; } finally { btn.textContent = 'Sign In'; }
  });

  document.getElementById('ownerBarNav').addEventListener('click', e => { const b = e.target.closest('.owner-nav-btn'); if (b) loadOwnerSection(b.dataset.section); });
  document.getElementById('ownerLogoutBtn').addEventListener('click', () => { logoutOwner(); showToast('Logged out'); });
  document.getElementById('ownerPreviewBtn').addEventListener('click', () => deactivateOwnerMode());

  if (window.location.hash === '#owner') {
    if (localStorage.getItem('owner_token')) activateOwnerMode();
    else document.getElementById('ownerLoginOverlay').classList.add('active');
  }
});
