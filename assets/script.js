/* ──────────────────────────────────────────────────────────────
   BRANDBOOK PLATFORM — script.js
   Carrega brand.json, aplica o design system e renderiza todos os módulos.
────────────────────────────────────────────────────────────── */

const DATA_URL = '_data/brand.json';

// ── INIT ──────────────────────────────────────────────────────
async function init() {
  const data = await loadData();
  if (!data) return;
  applyTheme(data.brand);
  updateSidebarBrand(data.brand);
  renderResearch(data.research);
  renderAudience(data.audience);
  renderBrandCore(data.brand_core);
  renderCommunication(data.communication);
  renderVisualIdentity(data.visual_identity, data.brand);
  renderSocialMedia(data.social_media);
  renderTypography(data.visual_identity.typography, data.brand);
  initNavigation();
  initSubTabAnchors();
  initMobileMenu();
  setTimeout(() => {
    addRevealClasses();
    initScrollAnimations();
    initMouseParallax();
  }, 120);
}

async function loadData() {
  try {
    const res = await fetch(DATA_URL + '?t=' + Date.now());
    return await res.json();
  } catch {
    document.querySelector('.main').innerHTML =
      '<div style="padding:60px;color:#999;font-size:16px">Não foi possível carregar os dados da marca.</div>';
    return null;
  }
}

// ── THEME ─────────────────────────────────────────────────────
function applyTheme(brand) {
  const r = document.documentElement;
  r.style.setProperty('--brand-primary',    brand.colors.primary);
  r.style.setProperty('--brand-secondary',  brand.colors.secondary);
  r.style.setProperty('--brand-accent',     brand.colors.accent);
  r.style.setProperty('--brand-background', brand.colors.background);
  r.style.setProperty('--brand-text',       brand.colors.text);

  if (brand.fonts.heading_url) {
    const el = document.getElementById('font-heading-link');
    if (el) el.href = brand.fonts.heading_url;
  }
  if (brand.fonts.body_url) {
    const el = document.getElementById('font-body-link');
    if (el) el.href = brand.fonts.body_url;
  }
  r.style.setProperty('--font-heading', `'${brand.fonts.heading}', Georgia, serif`);
  r.style.setProperty('--font-body',    `'${brand.fonts.body}', system-ui, sans-serif`);

  document.title = (brand.name || 'Brandbook') + ' — Brandbook';
}

function updateSidebarBrand(brand) {
  const nameEl = document.getElementById('sidebar-brand-name');
  const initEl = document.getElementById('sidebar-logo-initials');
  const logoEl = document.getElementById('sidebar-logo');
  if (nameEl) nameEl.textContent = brand.name || '';
  if (brand.logo && logoEl) {
    logoEl.innerHTML = `<img src="${brand.logo}" alt="${brand.name}" />`;
  } else if (initEl && brand.name) {
    const words = brand.name.trim().split(' ');
    initEl.textContent = words.length > 1
      ? words[0][0].toUpperCase() + words[1][0].toUpperCase()
      : words[0].slice(0, 2).toUpperCase();
  }
}

// ── NAVIGATION ────────────────────────────────────────────────
function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      activateModule(link.dataset.module);
      closeMobileMenu();
    });
  });
}

function activateModule(moduleId) {
  document.querySelectorAll('.module').forEach(m => m.classList.add('hidden'));
  document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
  const mod = document.getElementById(moduleId);
  if (mod) {
    mod.classList.remove('hidden');
    window.scrollTo(0, 0);
    if (mod._updateActiveTab) mod._updateActiveTab();
    requestAnimationFrame(() => triggerRevealInModule(mod));
  }
  const link = document.querySelector(`.nav-item[data-module="${moduleId}"]`);
  if (link) link.classList.add('active');
}

// ── ANCHOR SUB-TABS ───────────────────────────────────────────
function initSubTabAnchors() {
  const topnavH = () => (document.querySelector('.topnav')?.offsetHeight || 72);

  document.querySelectorAll('.module').forEach(module => {
    const bar = module.querySelector('.sub-tabs-bar');
    if (!bar) return;
    const tabs = bar.querySelectorAll('.sub-tab');
    const sections = [...module.querySelectorAll('.subsection')];

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const sec = module.querySelector(`#${tab.dataset.section}`);
        if (!sec) return;
        const offset = topnavH() + 24;
        window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
      });
    });

    function updateActive() {
      if (module.classList.contains('hidden')) return;
      const threshold = topnavH() + 80;
      let activeId = sections[0]?.id;
      sections.forEach(sec => {
        if (sec.getBoundingClientRect().top <= threshold) activeId = sec.id;
      });
      tabs.forEach(t => t.classList.toggle('active', t.dataset.section === activeId));
    }

    window.addEventListener('scroll', updateActive, { passive: true });
    module._updateActiveTab = updateActive;
  });
}

// ── MOBILE MENU ───────────────────────────────────────────────
function initMobileMenu() {
  const ham     = document.getElementById('hamburger');
  const nav     = document.getElementById('topnav-nav');
  const overlay = document.getElementById('topnav-overlay');
  if (!ham) return;
  ham.addEventListener('click', () => {
    nav.classList.toggle('open');
    overlay.classList.toggle('active');
  });
  overlay.addEventListener('click', closeMobileMenu);
}
function closeMobileMenu() {
  document.getElementById('topnav-nav')?.classList.remove('open');
  document.getElementById('topnav-overlay')?.classList.remove('active');
}

// ── MODULE 1: RESEARCH ────────────────────────────────────────
const SOCIAL_ICONS = {
  website:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
  facebook:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  linkedin:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  youtube:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  tiktok:    `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
  twitter:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>`,
  pinterest: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>`
};

function renderResearch(data) {
  if (!data) return;
  renderBenchmarking(data.benchmarking);
  renderPositioningMap(data.positioning_map, data.benchmarking);
}

function renderBenchmarking(items) {
  const tbody = document.getElementById('bench-tbody');
  if (!tbody || !items) return;
  tbody.innerHTML = items.map(c => `
    <tr>
      <td>
        <div class="bench-brand-name">${esc(c.name)}</div>
        ${renderSocialLinks(c.social_links)}
      </td>
      <td>${esc(c.positioning)}</td>
      <td>${splitTags(c.strengths, 'strength')}</td>
      <td>${splitTags(c.weaknesses, 'weakness')}</td>
    </tr>
  `).join('');
}

function renderSocialLinks(links) {
  if (!links || !links.length) return '';
  const btns = links.map(l => {
    const icon = SOCIAL_ICONS[l.network];
    if (!icon || !l.url) return '';
    return `<a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer"
               class="bench-social-btn" title="${esc(l.network)}">${icon}</a>`;
  }).join('');
  return btns ? `<div class="bench-social-links">${btns}</div>` : '';
}

function splitTags(text, type) {
  if (!text) return '';
  return text.split(',').map(t => `<span class="bench-tag-${type}">${esc(t.trim())}</span>`).join('');
}

function renderPositioningMap(mapCfg, competitors) {
  const svg = document.getElementById('pos-map');
  const legend = document.getElementById('map-legend');
  if (!svg || !mapCfg) return;

  const W = 600, H = 480, PAD = 60;
  const toSvgX = x => PAD + (x / 100) * (W - PAD * 2);
  const toSvgY = y => H - PAD - (y / 100) * (H - PAD * 2);

  const axisColor = 'rgba(255,255,255,0.12)';
  const labelColor = 'rgba(255,255,255,0.45)';
  const brandColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--brand-accent').trim() || '#9EFF3E';

  let html = '';
  html += `<line x1="${W/2}" y1="${PAD}" x2="${W/2}" y2="${H-PAD}" stroke="${axisColor}" stroke-width="1.5"/>`;
  html += `<line x1="${PAD}" y1="${H/2}" x2="${W-PAD}" y2="${H/2}" stroke="${axisColor}" stroke-width="1.5"/>`;
  html += `<rect x="${PAD}" y="${PAD}" width="${W-PAD*2}" height="${H-PAD*2}" fill="none" stroke="${axisColor}" stroke-width="1" rx="4"/>`;

  html += label(W/2, PAD-16, mapCfg.axis_y_top, 13, labelColor, 'middle');
  html += label(W/2, H-PAD+22, mapCfg.axis_y_bottom, 13, labelColor, 'middle');
  html += label(PAD-10, H/2+5, mapCfg.axis_x_left, 13, labelColor, 'end');
  html += label(W-PAD+10, H/2+5, mapCfg.axis_x_right, 13, labelColor, 'start');

  const dotColors = [
    'rgba(255,255,255,0.45)', 'rgba(255,255,255,0.38)', 'rgba(255,255,255,0.32)',
    'rgba(255,255,255,0.42)', 'rgba(255,255,255,0.28)', 'rgba(255,255,255,0.35)'
  ];
  (competitors || []).forEach((c, i) => {
    const cx = toSvgX(c.x);
    const cy = toSvgY(c.y);
    html += `<circle cx="${cx}" cy="${cy}" r="9" fill="${dotColors[i % dotColors.length]}" class="map-dot" style="animation-delay:${i * 0.12}s"><title>${esc(c.name)}</title></circle>`;
    html += label(cx, cy - 16, c.name, 11.5, 'rgba(255,255,255,0.6)', 'middle');
  });

  const bx = toSvgX(mapCfg.brand_x);
  const by = toSvgY(mapCfg.brand_y);
  html += `<circle cx="${bx}" cy="${by}" r="26" fill="${brandColor}" opacity=".15" class="map-brand-pulse"/>`;
  html += `<circle cx="${bx}" cy="${by}" r="16" fill="${brandColor}" class="map-dot" style="animation-delay:${(competitors||[]).length * 0.12 + 0.1}s"><title>RNF Imóveis</title></circle>`;
  html += label(bx, by - 30, 'RNF', 12, brandColor, 'middle', true);

  svg.innerHTML = html;

  const legItems = (competitors || []).map((c, i) =>
    `<div class="legend-item"><div class="legend-dot" style="background:${dotColors[i % dotColors.length]}"></div><span>${esc(c.name)}</span></div>`
  ).join('');
  legend.innerHTML = `
    <div class="legend-item"><div class="legend-dot" style="background:${brandColor}"></div><strong>Marca</strong></div>
    ${legItems}
  `;
}

function label(x, y, text, size, color, anchor, bold = false) {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" fill="${color}" font-family="Inter,sans-serif" font-weight="${bold ? '700' : '400'}">${esc(text)}</text>`;
}

// ── MODULE 2: AUDIENCE ────────────────────────────────────────
function renderAudience(data) {
  if (!data) return;
  renderSegments(data.segments);
  renderPersonas(data.personas);
}

function renderSegments(items) {
  const el = document.getElementById('segments-grid');
  if (!el || !items) return;
  el.innerHTML = items.map(s => `
    <div class="card segment-card">
      <div class="segment-name">${esc(s.name)}</div>
      <div class="segment-badge">${esc(s.size)}</div>
      <div class="segment-desc">${esc(s.description)}</div>
      <div class="segment-traits">
        ${toStringArray(s.characteristics).map(c => `<div class="segment-trait">${esc(c)}</div>`).join('')}
      </div>
    </div>
  `).join('');
}

function renderPersonas(items) {
  const el = document.getElementById('personas-list');
  if (!el || !items) return;
  el.innerHTML = items.map(p => `
    <div class="persona-card">
      <div class="persona-avatar">
        ${p.avatar ? `<img src="${esc(p.avatar)}" alt="${esc(p.name)}" />` : `<span>${esc(p.emoji || '👤')}</span>`}
      </div>
      <div>
        <div class="persona-header">
          <div class="persona-name">${esc(p.name)}</div>
          <div class="persona-meta">
            <span>${esc(p.age)}</span>
            <span>${esc(p.occupation)}</span>
            <span>${esc(p.location)}</span>
          </div>
        </div>
        ${p.quote ? `<div class="persona-quote">"${esc(p.quote)}"</div>` : ''}
        <div class="persona-bio">${esc(p.bio)}</div>
        <div class="persona-sections">
          ${personaSection('Objetivos', p.goals)}
          ${personaSection('Dores', p.pains)}
          <div>
            <div class="persona-section-title">Canais</div>
            <div class="persona-channels">
              ${toStringArray(p.channels).map(c => `<span class="channel-tag">${esc(c)}</span>`).join('')}
            </div>
            ${p.frequency ? `<div class="persona-frequency">⏱ ${esc(p.frequency)}</div>` : ''}
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function personaSection(title, items) {
  const list = toStringArray(items);
  if (!list.length) return '';
  return `
    <div>
      <div class="persona-section-title">${title}</div>
      ${list.map(i => `<div class="persona-list-item">${esc(i)}</div>`).join('')}
    </div>
  `;
}

// ── MODULE 3: BRAND CORE ──────────────────────────────────────
const ARCHETYPE_COLORS = [
  { bg: '#161616', text: '#fff', accent: '#9EFF3E' },
  { bg: '#2A2A2A', text: '#fff', accent: '#9EFF3E' },
  { bg: '#9EFF3E', text: '#161616', accent: '#161616' },
];

function renderBrandCore(data) {
  if (!data) return;

  // Positioning — animated lines + full-width pillars
  const posEl = document.getElementById('positioning-text');
  if (posEl && data.positioning) {
    const pillars = data.positioning_pillars || [];
    const sentences = data.positioning.match(/[^.!?]+[.!?]+/g) || [data.positioning];
    const linesHtml = sentences.map((line, i) =>
      `<span class="pos-line" style="--delay:${0.15 + i * 0.28}s">${esc(line.trim())}</span>`
    ).join(' ');
    const pillarsHtml = pillars.length
      ? `<div class="positioning-pillars">
          ${pillars.map(p => `
            <div class="positioning-pillar">
              <div class="positioning-pillar-title">${esc(p.title)}</div>
              <div class="positioning-pillar-desc">${esc(p.description)}</div>
            </div>
          `).join('')}
        </div>`
      : '';
    posEl.innerHTML = `
      <div class="positioning-hero">
        <div class="positioning-hero-statement">
          <p class="positioning-eyebrow">Declaração de Posicionamento</p>
          <p class="positioning-statement">${linesHtml}</p>
        </div>
        ${pillarsHtml}
      </div>
    `;
  }

  // Tagline — only first, big animated display
  const tagsEl = document.getElementById('taglines-list');
  if (tagsEl && data.taglines && data.taglines.length) {
    const t = data.taglines[0];
    const words = esc(t.text).split(' ');
    const wordsHtml = words.map((w, i) =>
      `<span class="tagline-word" style="--delay:${0.1 + i * 0.07}s">${w}</span>`
    ).join(' ');
    tagsEl.innerHTML = `
      <div class="tagline-hero">
        <p class="tagline-hero-eyebrow">Tagline</p>
        <p class="tagline-display">${wordsHtml}</p>
        ${t.context ? `<p class="tagline-hero-context">${esc(t.context)}</p>` : ''}
      </div>
    `;
  }

  // Value proposition — headline quote + per-audience cards
  const vpEl = document.getElementById('value-prop-block');
  if (vpEl && data.value_proposition) {
    const vp = data.value_proposition;
    const audienceCards = (vp.audience_props || []).map(ap => `
      <div class="vp-audience-card">
        <div class="vp-audience-label">${esc(ap.audience)}</div>
        <div class="vp-audience-text">${esc(ap.text)}</div>
      </div>
    `).join('');
    vpEl.innerHTML = `
      <div class="value-main vp-main-quote">${esc(vp.main)}</div>
      ${audienceCards ? `<div class="vp-audience-grid">${audienceCards}</div>` : ''}
    `;
  }

  // Archetypes — 3 equal columns, each with its brand color
  const archEl = document.getElementById('archetypes-list');
  if (archEl && data.archetypes) {
    archEl.innerHTML = data.archetypes.map((a, i) => {
      const col = ARCHETYPE_COLORS[i % ARCHETYPE_COLORS.length];
      return `
        <div class="archetype-flip"
             onclick="this.classList.toggle('open')"
             role="button"
             tabindex="0"
             aria-label="Ver detalhes: ${esc(a.name)}"
             onkeydown="if(event.key==='Enter'||event.key===' ')this.classList.toggle('open')">
          <div class="archetype-flip-inner">
            <div class="archetype-front" style="background:${col.bg};color:${col.text}">
              <div class="archetype-front-number" style="color:${col.accent}">0${i + 1}</div>
              <div class="archetype-front-name">${esc(a.name)}</div>
              <div class="archetype-front-role" style="color:${col.accent};background:transparent;border:1px solid ${col.accent}40">${esc(a.role)}</div>
              <div class="archetype-front-hint" style="opacity:.45">↻ clique para ver mais</div>
            </div>
            <div class="archetype-back">
              <div class="archetype-back-role">${esc(a.role)}</div>
              <div class="archetype-back-name">${esc(a.name)}</div>
              <div class="archetype-back-desc">${esc(a.description)}</div>
              <div class="archetype-back-traits">
                ${toStringArray(a.traits).map(t => `<span class="archetype-back-trait">${esc(t)}</span>`).join('')}
              </div>
              <div class="archetype-back-expression">${esc(a.expression)}</div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

// ── MODULE 4: COMMUNICATION ───────────────────────────────────
function renderCommunication(data) {
  if (!data) return;

  const tovEl = document.getElementById('tov-list');
  if (tovEl && data.tone_of_voice) {
    tovEl.innerHTML = data.tone_of_voice.map(t => `
      <div class="tov-card">
        <div class="tov-header">
          <div class="tov-attribute">${esc(t.attribute)}</div>
          <div class="tov-desc">${esc(t.description)}</div>
        </div>
        <div class="tov-examples">
          <div class="tov-do">
            <div class="tov-label">✓ Assim sim</div>
            ${esc(t.do)}
          </div>
          <div class="tov-dont">
            <div class="tov-label">✗ Assim não</div>
            ${esc(t.dont)}
          </div>
        </div>
      </div>
    `).join('');
  }

  const vocabEl = document.getElementById('vocab-block');
  if (vocabEl && data.vocabulary) {
    vocabEl.innerHTML = `
      <div class="vocab-column">
        <div class="vocab-title use">✓ Palavras que usamos</div>
        <div class="vocab-tags">
          ${toStringArray(data.vocabulary.use).map(w => `<span class="vocab-tag use">${esc(w)}</span>`).join('')}
        </div>
      </div>
      <div class="vocab-column">
        <div class="vocab-title avoid">✗ Palavras que evitamos</div>
        <div class="vocab-tags">
          ${toStringArray(data.vocabulary.avoid).map(w => `<span class="vocab-tag avoid">${esc(w)}</span>`).join('')}
        </div>
      </div>
    `;
  }

  const narrativeEl = document.getElementById('narrative-text');
  if (narrativeEl && data.narrative) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitizeHtml(data.narrative);
    const paras = Array.from(tempDiv.querySelectorAll('p'));
    if (paras.length > 1) {
      _narrativeTotal = paras.length;
      _narrativeIndex = 0;
      const slidesHtml = paras.map((p, i) => `
        <div class="narrative-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
          <div class="narrative-chapter-num">${String(i + 1).padStart(2, '0')} / ${String(paras.length).padStart(2, '0')}</div>
          <div class="narrative-chapter-text">${p.innerHTML}</div>
        </div>
      `).join('');
      narrativeEl.innerHTML = `
        <div class="narrative-carousel" id="narrative-carousel">
          <div class="narrative-slides">${slidesHtml}</div>
          <div class="narrative-controls">
            <button class="narrative-btn" onclick="narrativeNav(-1)" aria-label="Capítulo anterior">←</button>
            <span class="narrative-progress" id="narrative-progress">01 / ${String(paras.length).padStart(2, '0')}</span>
            <button class="narrative-btn" onclick="narrativeNav(1)" aria-label="Próximo capítulo">→</button>
          </div>
        </div>
      `;
    } else {
      narrativeEl.innerHTML = `<div class="prose-block">${sanitizeHtml(data.narrative)}</div>`;
    }
  }

  const manifestoEl = document.getElementById('manifesto-text');
  if (manifestoEl && data.manifesto) {
    const tempDiv2 = document.createElement('div');
    tempDiv2.innerHTML = sanitizeHtml(data.manifesto);
    const paras2 = Array.from(tempDiv2.querySelectorAll('p, li, blockquote'));
    if (paras2.length > 1) {
      const html = paras2.map((p, i) => {
        p.classList.add('manifesto-para', 'reveal');
        p.style.transitionDelay = `${i * 85}ms`;
        return p.outerHTML;
      }).join('');
      manifestoEl.innerHTML = `
        <div class="manifesto-quote">
          <span class="manifesto-quote-mark" aria-hidden="true">❝</span>
          <div class="manifesto-quote-body">${html}</div>
        </div>
      `;
    } else {
      manifestoEl.innerHTML = sanitizeHtml(data.manifesto);
    }
  }
}

// ── NARRATIVE CAROUSEL ────────────────────────────────────────
let _narrativeIndex = 0;
let _narrativeTotal = 0;

window.narrativeNav = function(dir) {
  const carousel = document.getElementById('narrative-carousel');
  if (!carousel) return;
  const slides = carousel.querySelectorAll('.narrative-slide');
  if (!slides.length) return;
  const total = slides.length;
  slides[_narrativeIndex].classList.remove('active');
  _narrativeIndex = (_narrativeIndex + dir + total) % total;
  slides[_narrativeIndex].classList.add('active');
  const progress = document.getElementById('narrative-progress');
  if (progress) progress.textContent = `${String(_narrativeIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
};

// ── MODULE 5: VISUAL IDENTITY ─────────────────────────────────
function renderVisualIdentity(data, brand) {
  if (!data) return;
  renderMoodboard(data.moodboard);
  renderLogos(data.logos, brand);
  renderColors(data.colors);
  renderIcons(data.icons);
  renderSpacing(data.spacing);
  renderIncorrectUse(data.incorrect_use, brand);
  renderMaterials(data.graphic_materials);
}

function renderMoodboard(data) {
  const el = document.getElementById('moodboard-content');
  if (!el) return;
  if (!data || (!data.concept && !data.image && !(data.gallery && data.gallery.length))) {
    el.innerHTML = '<div class="placeholder-box">Adicione o moodboard e o conceito visual no painel do CMS.</div>';
    return;
  }
  const conceptHtml = data.concept
    ? `<div class="moodboard-concept prose-block">${marked.parse(data.concept)}</div>`
    : '';
  const mainImageHtml = data.image
    ? `<div class="moodboard-hero" onclick="openLightbox('${esc(data.image)}','Moodboard')">
        <img src="${esc(data.image)}" alt="Moodboard" />
        <div class="moodboard-hero-overlay">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
        </div>
      </div>`
    : '';
  const galleryHtml = data.gallery && data.gallery.length
    ? `<div class="moodboard-gallery">
        ${data.gallery.map(g => g.image ? `
          <div class="moodboard-gallery-item" onclick="openLightbox('${esc(g.image)}','${esc(g.caption || '')}')">
            <img src="${esc(g.image)}" alt="${esc(g.caption || '')}" />
            ${g.caption ? `<div class="moodboard-gallery-caption">${esc(g.caption)}</div>` : ''}
          </div>` : '').join('')}
      </div>`
    : '';
  el.innerHTML = conceptHtml + mainImageHtml + galleryHtml;
}

function renderLogos(logos, brand) {
  const el = document.getElementById('logos-grid');
  if (!el || !logos) return;
  el.innerHTML = logos.map((l, i) => `
    <div class="logo-card">
      <div class="logo-preview${i % 2 === 1 ? ' dark' : ''}"
           ${l.thumbnail ? `onclick="openLightbox('${esc(l.thumbnail)}','${esc(l.name)}')" style="cursor:pointer"` : ''}>
        ${l.thumbnail
          ? `<img src="${esc(l.thumbnail)}" alt="${esc(l.name)}" />`
          : `<div class="logo-placeholder">${esc((brand && brand.name) ? brand.name.slice(0, 2) : 'AB')}</div>`
        }
      </div>
      <div class="logo-info">
        <div class="logo-name">${esc(l.name)}</div>
        <div class="logo-desc">${esc(l.description)}</div>
        <div class="logo-downloads">
          ${l.file
            ? `<a href="${esc(l.file)}" download class="btn-download">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2v8M5 7l3 3 3-3"/><path d="M3 13h10"/></svg>
                SVG
              </a>
              <a href="${esc(l.file)}" download class="btn-download">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2v8M5 7l3 3 3-3"/><path d="M3 13h10"/></svg>
                PNG
              </a>`
            : '<span style="font-size:12px;color:#bbb">Arquivo não carregado</span>'
          }
        </div>
      </div>
    </div>
  `).join('');
}

function renderColors(colors) {
  const el = document.getElementById('colors-grid');
  if (!el || !colors) return;
  el.innerHTML = colors.map(c => `
    <div class="color-card">
      <div class="color-swatch" style="background:${esc(c.hex)}"></div>
      <div class="color-info">
        <div class="color-name">${esc(c.name)}</div>
        <div class="color-role">${esc(c.role)}</div>
        <div class="color-values">
          ${colorValueRow('HEX', c.hex)}
          ${colorValueRow('RGB', c.rgb)}
          ${colorValueRow('CMYK', c.cmyk)}
        </div>
        ${c.usage ? `<div class="color-usage">${esc(c.usage)}</div>` : ''}
      </div>
    </div>
  `).join('');

  // Activate copy buttons
  el.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.value;
      copyToClipboard(val, btn);
    });
  });
}

function colorValueRow(label, value) {
  if (!value) return '';
  const id = `color-${Math.random().toString(36).slice(2)}`;
  return `
    <div class="color-value-row">
      <span class="color-value-label">${label}</span>
      <span class="color-value-text">${esc(value)}</span>
      <button class="btn-copy" data-value="${esc(value)}" title="Copiar ${label}" aria-label="Copiar ${label}">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8">
          <rect x="4" y="4" width="9" height="10" rx="1.5"/>
          <path d="M2 3a1 1 0 011-1h7v2H4v9H2V3z"/>
        </svg>
      </button>
    </div>
  `;
}

function renderIcons(icons) {
  const el = document.getElementById('icons-grid');
  if (!el || !icons) return;
  if (!icons.length) {
    el.innerHTML = '<div class="placeholder-box">Nenhum ícone carregado ainda. Faça upload no painel do CMS.</div>';
    return;
  }
  el.innerHTML = icons.map(icon => `
    <div class="icon-card">
      <div class="icon-preview"
           ${icon.thumbnail ? `onclick="openLightbox('${esc(icon.thumbnail)}','${esc(icon.name)}')" style="cursor:pointer"` : ''}>
        ${icon.thumbnail
          ? `<img src="${esc(icon.thumbnail)}" alt="${esc(icon.name)}" />`
          : `<span class="icon-placeholder">◆</span>`
        }
      </div>
      <div class="icon-name">${esc(icon.name)}</div>
      ${icon.file ? `<div class="icon-download" onclick="window.open('${esc(icon.file)}')">⬇ Download</div>` : ''}
    </div>
  `).join('');
}

function renderSpacing(spacing) {
  const el = document.getElementById('spacing-block');
  if (!el || !spacing) return;
  el.innerHTML = `
    <div class="spacing-rule">
      <div class="spacing-rule-title">Tamanho Mínimo Impresso</div>
      <div class="spacing-rule-value">${esc(spacing.min_size_print)}</div>
    </div>
    <div class="spacing-rule">
      <div class="spacing-rule-title">Tamanho Mínimo Digital</div>
      <div class="spacing-rule-value">${esc(spacing.min_size_digital)}</div>
    </div>
    <div class="spacing-rule">
      <div class="spacing-rule-title">Área de Proteção</div>
      <div class="spacing-rule-desc">${esc(spacing.clear_space_rule)}</div>
      <div class="spacing-examples">
        ${toStringArray(spacing.examples).map(e => `<div class="spacing-example-item">${esc(e)}</div>`).join('')}
      </div>
    </div>
  `;
}

function renderIncorrectUse(items, brand) {
  const el = document.getElementById('incorrect-grid');
  if (!el || !items) return;
  el.innerHTML = items.map(item => `
    <div class="incorrect-card">
      <div class="incorrect-preview"
           ${item.image ? `onclick="openLightbox('${esc(item.image)}','${esc(item.description)}')" style="cursor:pointer"` : ''}>
        ${item.image
          ? `<img src="${esc(item.image)}" alt="" />`
          : `<div class="incorrect-placeholder">${brand && brand.name ? brand.name.slice(0, 2) : 'AB'}</div>`
        }
        <div class="incorrect-x">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 5l14 14M19 5L5 19"/></svg>
        </div>
      </div>
      <div class="incorrect-desc">${esc(item.description)}</div>
    </div>
  `).join('');
}

function renderMaterials(items) {
  const el = document.getElementById('materials-grid');
  if (!el || !items) return;
  el.innerHTML = items.map(m => `
    <div class="material-card">
      <div class="material-preview" ${m.image ? `onclick="openLightbox('${esc(m.image)}','${esc(m.name)}')"` : ''}>
        ${m.image
          ? `<img src="${esc(m.image)}" alt="${esc(m.name)}" />`
          : `<div class="material-placeholder">◆</div>`
        }
      </div>
      <div class="material-name">${esc(m.name)}</div>
      ${m.file ? `
        <div style="padding:0 18px 16px">
          <a href="${esc(m.file)}" download class="btn-download">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2v8M5 7l3 3 3-3"/><path d="M3 13h10"/></svg>
            Download
          </a>
        </div>
      ` : ''}
    </div>
  `).join('');
}

// ── MODULE 6: SOCIAL MEDIA ────────────────────────────────────
function renderSocialMedia(data) {
  if (!data) return;

  const editEl = document.getElementById('editorial-list');
  if (editEl && data.editorial_lines) {
    editEl.innerHTML = data.editorial_lines.map(e => `
      <div class="editorial-card" style="--editorial-color: ${esc(e.color || 'var(--brand-primary)')}">
        <div class="editorial-name">${esc(e.name)}</div>
        <div class="editorial-desc">${esc(e.description)}</div>
        <div class="editorial-examples">
          ${toStringArray(e.examples).map(ex => `<span class="editorial-example-tag">${esc(ex)}</span>`).join('')}
        </div>
      </div>
    `).join('');
  }

  const pillarsEl = document.getElementById('pillars-grid');
  if (pillarsEl && data.content_pillars) {
    pillarsEl.innerHTML = data.content_pillars.map(p => `
      <div class="pillar-card">
        <div class="pillar-emoji">${esc(p.emoji || '📌')}</div>
        <div class="pillar-name">${esc(p.name)}</div>
        <div class="pillar-objective">${esc(p.objective)}</div>
        <div class="pillar-examples">
          ${toStringArray(p.examples).map(ex => `<div class="pillar-example-item">${esc(ex)}</div>`).join('')}
        </div>
      </div>
    `).join('');
  }

  renderImageGrid('ref-grid', data.references, ['ref-card', 'ref-img', 'ref-placeholder', 'ref-info', 'ref-name', 'ref-desc'], false);
  renderImageGrid('viscomm-grid', data.visual_communication, ['viscomm-card', 'viscomm-img', 'viscomm-placeholder', 'viscomm-info', 'viscomm-name', 'viscomm-desc'], true);
}

function renderImageGrid(gridId, items, classes, showDownload = false) {
  const el = document.getElementById(gridId);
  if (!el || !items) return;
  const [cardCls, imgCls, phCls, infoCls, nameCls, descCls] = classes;
  el.innerHTML = items.map(item => `
    <div class="${cardCls}">
      <div class="${imgCls}" ${item.image ? `onclick="openLightbox('${esc(item.image)}','${esc(item.name)}')"` : ''}>
        ${item.image
          ? `<img src="${esc(item.image)}" alt="${esc(item.name)}" />`
          : `<span class="${phCls}">◆</span>`
        }
      </div>
      <div class="${infoCls}">
        <div class="${nameCls}">${esc(item.name)}</div>
        ${item.description ? `<div class="${descCls}">${esc(item.description)}</div>` : ''}
        ${showDownload && item.file ? `
          <a href="${esc(item.file)}" download class="btn-download" style="margin-top:10px">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2v8M5 7l3 3 3-3"/><path d="M3 13h10"/></svg>
            Download
          </a>
        ` : ''}
      </div>
    </div>
  `).join('');
}

// ── MODULE 7: TYPOGRAPHY ──────────────────────────────────────
function renderTypography(data, brand) {
  const el = document.getElementById('fonts-grid');
  if (!el) return;
  const fonts = brand && brand.fonts ? brand.fonts : {};
  const files = data || {};
  const entries = [
    { key: 'heading', role: 'Títulos', name: fonts.heading, file: files.heading_file },
    { key: 'body', role: 'Corpo de Texto', name: fonts.body, file: files.body_file },
  ];
  el.innerHTML = entries.map(f => `
    <div class="font-card">
      <div class="font-preview">
        <div class="font-preview-glyphs" id="font-preview-${f.key}" style="font-family:'${esc(f.name || 'inherit')}'">Aa Bb Cc</div>
        <div class="font-role">${esc(f.role)}</div>
      </div>
      <div class="font-info">
        <div class="font-name" id="font-name-${f.key}">${esc(f.name || 'Não definida')}</div>
        ${f.file
          ? `<a href="${esc(f.file)}" download class="btn-download">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2v8M5 7l3 3 3-3"/><path d="M3 13h10"/></svg>
              Download
            </a>`
          : '<span style="font-size:12px;color:#bbb">Arquivo não carregado</span>'
        }
      </div>
    </div>
  `).join('');

  entries.forEach(loadUploadedFontPreview);
}

// Carrega o arquivo de fonte enviado no CMS e usa ele de verdade no preview
// e no nome exibido, em vez de confiar no nome digitado manualmente em brand.fonts.
async function loadUploadedFontPreview({ key, file }) {
  if (!file) return;
  const ext = (file.split('.').pop() || '').toLowerCase();
  if (!['ttf', 'otf', 'woff', 'woff2'].includes(ext)) return;

  try {
    const buffer = await fetch(file).then(r => r.arrayBuffer());
    const cssFamily = `uploaded-${key}-font`;
    const fontFace = new FontFace(cssFamily, buffer);
    await fontFace.load();
    document.fonts.add(fontFace);

    const preview = document.getElementById(`font-preview-${key}`);
    if (preview) preview.style.fontFamily = `'${cssFamily}'`;

    // 'name' table só é lido diretamente de sfnt cru (ttf/otf); woff/woff2
    // comprimem as tabelas e ainda renderizam certo via FontFace, só sem nome lido.
    if (ext === 'ttf' || ext === 'otf') {
      const familyName = readFontFamilyName(buffer);
      const nameEl = document.getElementById(`font-name-${key}`);
      if (familyName && nameEl) nameEl.textContent = familyName;
    }
  } catch (e) {
    // Arquivo não pôde ser baixado/decodificado — mantém o preview com o nome digitado.
  }
}

function readFontFamilyName(buffer) {
  const view = new DataView(buffer);
  let offset = 0;
  if (view.getUint32(0) === 0x74746366) offset = view.getUint32(12); // TrueType Collection: usa a primeira fonte

  const numTables = view.getUint16(offset + 4);
  let nameTableOffset = null;
  for (let i = 0; i < numTables; i++) {
    const recordOffset = offset + 12 + i * 16;
    const tag = String.fromCharCode(
      view.getUint8(recordOffset), view.getUint8(recordOffset + 1),
      view.getUint8(recordOffset + 2), view.getUint8(recordOffset + 3)
    );
    if (tag === 'name') { nameTableOffset = view.getUint32(recordOffset + 8); break; }
  }
  if (nameTableOffset == null) return null;

  const count = view.getUint16(nameTableOffset + 2);
  const stringAreaOffset = nameTableOffset + view.getUint16(nameTableOffset + 4);

  let fallback = null;
  for (let i = 0; i < count; i++) {
    const recordOffset = nameTableOffset + 6 + i * 12;
    const platformID = view.getUint16(recordOffset);
    const nameID = view.getUint16(recordOffset + 6);
    if (nameID !== 1 && nameID !== 16) continue; // 1 = Family Name, 16 = Typographic Family Name (preferida)

    const length = view.getUint16(recordOffset + 8);
    const start = stringAreaOffset + view.getUint16(recordOffset + 10);
    const bytes = new Uint8Array(buffer, start, length);
    let str = '';
    if (platformID === 1) {
      for (let j = 0; j < bytes.length; j++) str += String.fromCharCode(bytes[j]);
    } else {
      for (let j = 0; j < bytes.length; j += 2) str += String.fromCharCode((bytes[j] << 8) | bytes[j + 1]);
    }
    if (nameID === 16) return str;
    if (!fallback) fallback = str;
  }
  return fallback;
}

// ── LIGHTBOX ──────────────────────────────────────────────────
function openLightbox(src, caption) {
  const lb   = document.getElementById('lightbox');
  const img  = document.getElementById('lightbox-img');
  const cap  = document.getElementById('lightbox-caption');
  if (!lb || !src) return;
  img.src = src;
  img.alt = caption || '';
  if (cap) cap.textContent = caption || '';
  lb.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox')?.classList.add('hidden');
  document.body.style.overflow = '';
}

// Netlify Identity redirect handler
if (window.netlifyIdentity) {
  window.netlifyIdentity.on('init', user => {
    if (!user) {
      window.netlifyIdentity.on('login', () => {
        document.location.href = '/admin/';
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('lightbox-close')?.addEventListener('click', closeLightbox);
  document.getElementById('lightbox')?.addEventListener('click', e => {
    if (e.target.id === 'lightbox') closeLightbox();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });
  init();
});

// ── SCROLL REVEAL ─────────────────────────────────────────────
const REVEAL_SELECTORS = [
  '.card', '.persona-card', '.tov-card', '.tagline-card',
  '.pillar-card', '.editorial-card', '.logo-card', '.color-card',
  '.font-card', '.material-card', '.ref-card', '.viscomm-card',
  '.archetype-flip', '.moodboard-hero', '.moodboard-gallery-item',
  '.spacing-rule', '.incorrect-card', '.prose-block', '.manifesto-block',
  '.vocab-column', '.value-main', '.value-diff-item',
  '.positioning-pillar', '.positioning-hero',
  '.tagline-hero', '.vp-audience-card', '.narrative-carousel',
].join(',');

function addRevealClasses() {
  document.querySelectorAll(REVEAL_SELECTORS).forEach(el => {
    if (el.classList.contains('reveal')) return;
    el.classList.add('reveal');
    // Stagger por posição entre irmãos diretos no mesmo container
    const parent = el.parentElement;
    if (!parent) return;
    const siblings = [...parent.children].filter(c => c.classList.contains('reveal'));
    const idx = siblings.indexOf(el);
    if (idx > 0) el.style.transitionDelay = `${Math.min(idx * 45, 180)}ms`;
  });
}

let _revealObserver = null;

function initScrollAnimations() {
  _revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' });

  document.querySelectorAll('.reveal').forEach(el => _revealObserver.observe(el));
}

function initMouseParallax() {
  let tX = 0, tY = 0, cX = 0, cY = 0, rafId = null;
  const LAYERS = [
    { sel: '.positioning-hero-statement', mx: 5,  my: 2.5 },
    { sel: '.tagline-display',            mx: 9,  my: 4   },
    { sel: '.narrative-slides',           mx: 4,  my: 2   },
    { sel: '.manifesto-quote-body',       mx: 4,  my: 2   },
  ];

  function tick() {
    cX += (tX - cX) * 0.07;
    cY += (tY - cY) * 0.07;
    LAYERS.forEach(({ sel, mx, my }) => {
      document.querySelectorAll(sel).forEach(el => {
        el.style.transform = `translate(${(cX * mx).toFixed(2)}px,${(cY * my).toFixed(2)}px)`;
      });
    });
    if (Math.abs(tX - cX) > 0.001 || Math.abs(tY - cY) > 0.001) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
    }
  }

  document.addEventListener('mousemove', e => {
    tX = e.clientX / window.innerWidth  - 0.5;
    tY = e.clientY / window.innerHeight - 0.5;
    if (!rafId) rafId = requestAnimationFrame(tick);
  });
}

function triggerRevealInModule(mod) {
  if (!_revealObserver) return;
  mod.querySelectorAll('.reveal:not(.visible)').forEach(el => {
    _revealObserver.observe(el);
  });
}

// ── CLIPBOARD ─────────────────────────────────────────────────
function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copiado: ' + text);
    if (btn) {
      btn.classList.add('copied');
      btn.innerHTML = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 8l4 4 8-8"/></svg>`;
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="9" height="10" rx="1.5"/><path d="M2 3a1 1 0 011-1h7v2H4v9H2V3z"/></svg>`;
      }, 2000);
    }
  }).catch(() => {
    showToast('Não foi possível copiar. Selecione o texto manualmente.');
  });
}

// ── TOAST ─────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2500);
}

// ── NORMALIZE LIST ITEMS (Decap CMS salva listas como [{item:"..."}] OU ["..."]) ──
function toStringArray(arr) {
  if (!arr || !arr.length) return [];
  if (typeof arr[0] === 'string') return arr;
  return arr.map(o => o.item || o);
}

// ── UTILITIES ─────────────────────────────────────────────────
function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeHtml(content) {
  if (!content) return '';
  // Se o conteúdo já contém tags HTML (dados de exemplo), preserva.
  // Se for Markdown puro (saída do CMS), converte com marked.js.
  const isHtml = /<[a-z][\s\S]*>/i.test(content);
  const raw = isHtml ? content : (typeof marked !== 'undefined' ? marked.parse(content) : content.replace(/\n\n/g, '</p><p>').replace(/^/, '<p>').replace(/$/, '</p>'));

  const allowed = ['p', 'br', 'b', 'strong', 'i', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'blockquote'];
  const div = document.createElement('div');
  div.innerHTML = raw;
  div.querySelectorAll('*').forEach(node => {
    if (!allowed.includes(node.tagName.toLowerCase())) {
      node.replaceWith(document.createTextNode(node.textContent));
    }
    [...node.attributes].forEach(attr => node.removeAttribute(attr.name));
  });
  return div.innerHTML;
}
