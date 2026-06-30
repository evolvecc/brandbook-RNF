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
  initMobileMenu();
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
  // Module navigation (sidebar)
  document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const moduleId = link.dataset.module;
      activateModule(moduleId);
      closeMobileMenu();
    });
  });

  // Sub-tab navigation within modules
  document.querySelectorAll('.sub-tabs-bar').forEach(bar => {
    bar.querySelectorAll('.sub-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const section = tab.dataset.section;
        const module  = bar.closest('.module');
        activateSubSection(module, section);
        bar.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      });
    });
  });
}

function activateModule(moduleId) {
  document.querySelectorAll('.module').forEach(m => m.classList.add('hidden'));
  document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
  const mod = document.getElementById(moduleId);
  if (mod) { mod.classList.remove('hidden'); window.scrollTo(0, 0); }
  const link = document.querySelector(`.nav-item[data-module="${moduleId}"]`);
  if (link) link.classList.add('active');
}

function activateSubSection(module, sectionId) {
  module.querySelectorAll('.subsection').forEach(s => s.classList.remove('active'));
  const sec = module.querySelector(`#${sectionId}`);
  if (sec) sec.classList.add('active');
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
      <td>${esc(c.name)}</td>
      <td>${esc(c.positioning)}</td>
      <td>${splitTags(c.strengths, 'strength')}</td>
      <td>${splitTags(c.weaknesses, 'weakness')}</td>
    </tr>
  `).join('');
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

  const axisColor = '#c8c8c8';
  const brandColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--brand-accent').trim() || '#D4A853';

  // Build SVG content
  let html = '';

  // Grid lines
  html += `<line x1="${W/2}" y1="${PAD}" x2="${W/2}" y2="${H-PAD}" stroke="${axisColor}" stroke-width="1.5"/>`;
  html += `<line x1="${PAD}" y1="${H/2}" x2="${W-PAD}" y2="${H/2}" stroke="${axisColor}" stroke-width="1.5"/>`;

  // Border
  html += `<rect x="${PAD}" y="${PAD}" width="${W-PAD*2}" height="${H-PAD*2}" fill="none" stroke="${axisColor}" stroke-width="1" rx="4"/>`;

  // Axis labels
  html += label(W/2, PAD-16, mapCfg.axis_y_top, 13, '#555', 'middle');
  html += label(W/2, H-PAD+22, mapCfg.axis_y_bottom, 13, '#555', 'middle');
  html += label(PAD-10, H/2+5, mapCfg.axis_x_left, 13, '#555', 'end');
  html += label(W-PAD+10, H/2+5, mapCfg.axis_x_right, 13, '#555', 'start');

  // Competitors
  const colors = ['#888','#aaa','#bbb','#999','#777'];
  (competitors || []).forEach((c, i) => {
    const cx = toSvgX(c.x);
    const cy = toSvgY(c.y);
    html += `<circle cx="${cx}" cy="${cy}" r="8" fill="${colors[i % colors.length]}" opacity=".7"/>`;
    html += label(cx, cy - 14, c.name, 11.5, '#666', 'middle');
  });

  // Brand dot
  const bx = toSvgX(mapCfg.brand_x);
  const by = toSvgY(mapCfg.brand_y);
  html += `<circle cx="${bx}" cy="${by}" r="14" fill="${brandColor}" opacity=".9"/>`;
  html += `<circle cx="${bx}" cy="${by}" r="20" fill="${brandColor}" opacity=".2"/>`;
  html += label(bx, by - 26, 'MARCA', 11, brandColor, 'middle', true);

  svg.innerHTML = html;

  // Legend
  const legItems = (competitors || []).map((c, i) =>
    `<div class="legend-item"><div class="legend-dot" style="background:${colors[i % colors.length]}"></div><span>${esc(c.name)}</span></div>`
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
function renderBrandCore(data) {
  if (!data) return;

  const posEl = document.getElementById('positioning-text');
  if (posEl) posEl.textContent = data.positioning || '';

  const tagsEl = document.getElementById('taglines-list');
  if (tagsEl && data.taglines) {
    tagsEl.innerHTML = data.taglines.map((t, i) => `
      <div class="tagline-card">
        ${i === 0 ? '<div class="tagline-primary-badge">✦ Principal</div>' : ''}
        <div class="tagline-text">${esc(t.text)}</div>
        <div class="tagline-context">${esc(t.context)}</div>
      </div>
    `).join('');
  }

  const vpEl = document.getElementById('value-prop-block');
  if (vpEl && data.value_proposition) {
    const vp = data.value_proposition;
    vpEl.innerHTML = `
      <div class="value-main">${esc(vp.main)}</div>
      <div>
        <div class="value-diffs-title">Diferenciais</div>
        <div class="value-diffs">
          ${toStringArray(vp.differentiators).map(d => `
            <div class="value-diff-item">
              <div class="value-diff-icon"></div>
              <span>${esc(d)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  const archEl = document.getElementById('archetypes-list');
  if (archEl && data.archetypes) {
    archEl.innerHTML = data.archetypes.map(a => `
      <div class="archetype-card">
        <div class="archetype-header">
          <div class="archetype-name">${esc(a.name)}</div>
          <div class="archetype-role">${esc(a.role)}</div>
        </div>
        <div class="archetype-desc">${esc(a.description)}</div>
        <div class="archetype-traits">
          ${toStringArray(a.traits).map(t => `<span class="trait-tag">${esc(t)}</span>`).join('')}
        </div>
        <div class="archetype-expression">${esc(a.expression)}</div>
      </div>
    `).join('');
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
    narrativeEl.innerHTML = sanitizeHtml(data.narrative);
  }

  const manifestoEl = document.getElementById('manifesto-text');
  if (manifestoEl && data.manifesto) {
    manifestoEl.innerHTML = sanitizeHtml(data.manifesto);
  }
}

// ── MODULE 5: VISUAL IDENTITY ─────────────────────────────────
function renderVisualIdentity(data, brand) {
  if (!data) return;
  renderLogos(data.logos, brand);
  renderColors(data.colors);
  renderIcons(data.icons);
  renderSpacing(data.spacing);
  renderIncorrectUse(data.incorrect_use, brand);
  renderMaterials(data.graphic_materials);
}

function renderLogos(logos, brand) {
  const el = document.getElementById('logos-grid');
  if (!el || !logos) return;
  el.innerHTML = logos.map((l, i) => `
    <div class="logo-card">
      <div class="logo-preview${i % 2 === 1 ? ' dark' : ''}">
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
      <div class="icon-preview">
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
      <div class="incorrect-preview">
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
