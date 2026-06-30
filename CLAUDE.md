# Brandbook Template — Contexto do Projeto

## Projeto

Plataforma de brandbooks interativos para agência de marketing. Cada cliente recebe uma página web personalizada com toda a identidade de marca organizada em módulos navegáveis. A agência controla o conteúdo via CMS visual sem precisar de programação.

- **Site demo publicado:** https://brandbook-rnf.netlify.app/
- **Repositório template:** https://github.com/evolvecc/brandbook-RNF.git
- **Conteúdo atual:** Demo fictício "Café Aurora" (sem cliente real ainda)

---

## Arquitetura

**Stack:** HTML + CSS + JavaScript vanilla — sem frameworks, sem build, sem npm.

**Por que vanilla?**
- Zero dependências para manter
- Deploy é só subir arquivos estáticos
- Clientes com pouco contexto técnico conseguem entender e editar
- Netlify free tier é suficiente para todos os clientes

**Fluxo de conteúdo:**
```
brand.json ──► JS carrega e renderiza ──► Netlify serve como HTML
     ▲
     │ commit automático
Decap CMS (editor visual) ──► Git Gateway ──► GitHub repo do cliente
```

**CMS:** Decap CMS (ex-Netlify CMS) — edição visual que gera commits no Git.

---

## Arquivos Críticos

| Arquivo | Função |
|---|---|
| `_data/brand.json` | Única fonte de verdade de conteúdo. Todo texto, cor, imagem vem daqui. |
| `assets/script.js` | Carrega o JSON e renderiza os 6 módulos. |
| `assets/style.css` | Design system completo com CSS custom properties. |
| `index.html` | SPA de uma página. Top nav + 6 seções com sub-tabs. |
| `admin/config.yml` | Schema do CMS: define todos os campos editáveis. |
| `admin/index.html` | Carrega o Decap CMS do CDN. Não editar. |
| `netlify.toml` | Configuração de deploy + headers de segurança + no-cache no JSON. |
| `SETUP.md` | Guia passo a passo para ativar um novo cliente. |

---

## Estrutura do brand.json

```
brand.json
├── brand              → nome, tagline, cores (hex), fontes (Google Fonts URLs), logo
├── research           → benchmarking (concorrentes), mapa de posicionamento (x/y 0-100)
├── audience           → segmentos de audiência, personas (avatar, bio, goals, pains)
├── brand_core         → posicionamento, taglines, proposta de valor, arquétipos
├── communication      → tom de voz (atributos + exemplos), vocabulário, narrativa, manifesto
├── visual_identity    → logos (variações), paleta (hex/rgb/cmyk), ícones, spacing, usos incorretos, materiais gráficos (com download)
├── social_media       → linhas editoriais, pilares de conteúdo, referências visuais, templates (com download)
└── typography         → arquivos de fonte para download (heading_file, body_file) — nomes ficam em brand.fonts; renderizado como sub-tab dentro do módulo Identidade Visual, não como módulo próprio
```

---

## Fluxo de Conteúdo (CMS)

**Ativar Netlify Identity (uma vez por site):**
1. Painel Netlify → site → aba **Identity** → Enable Identity
2. Registration → **Invite only**
3. Services → **Git Gateway** → Enable
4. Identity → **Invite users** → adicionar e-mail da equipe
5. Aceitar convite no e-mail
6. Acessar: `https://[cliente].netlify.app/admin`

**Editar conteúdo:**
1. Entrar em `/admin` → fazer login
2. Clicar em "Brand Content" → editar campos
3. Salvar → Publish → commit automático → Netlify redeploy (~60s)

---

## Como Adicionar um Novo Módulo

Sempre seguir este padrão em 4 arquivos:

### 1. `_data/brand.json`
```json
"novo_modulo": {
  "titulo": "...",
  "items": []
}
```

### 2. `admin/config.yml`
Dentro de `fields:`, adicionar novo bloco com os campos do módulo. Padrão existente como referência: campos de `social_media`.

### 3. `index.html`
```html
<!-- Top nav -->
<a class="nav-item" data-module="novo-modulo" href="#novo-modulo">
  <span>Nome do Módulo</span>
</a>

<!-- Seção -->
<section class="module hidden" id="novo-modulo">
  <div class="module-hero">
    <div class="module-hero-inner">
      <div class="module-number">07</div>
      <div>
        <h1 class="module-title">Nome do Módulo</h1>
        <p class="module-desc">Descrição breve.</p>
      </div>
    </div>
  </div>
  <div class="sub-tabs-bar">
    <div class="sub-tabs-bar-inner">
      <!-- botões .sub-tab aqui -->
    </div>
  </div>
  <!-- subsections aqui -->
</section>
```

**Importante:** `.module-hero` e `.sub-tabs-bar` são faixas de fundo full-bleed (ocupam a tela toda); o conteúdo real fica dentro de `.module-hero-inner` e `.sub-tabs-bar-inner`, que centralizam e alinham com a largura do menu (`--content-max`). Nunca colocar texto direto dentro de `.module-hero` ou botões direto dentro de `.sub-tabs-bar` — sempre usar o wrapper `-inner`.

### 4. `assets/script.js`
```js
function renderNovoModulo(data) {
  // data vem de brandData.novo_modulo
}

// Adicionar chamada dentro de init():
renderNovoModulo(data.novo_modulo);
```

---

## Fluxo para Novo Cliente

**Uma vez:** Transformar este repo em GitHub Template.
- GitHub → Settings → marcar **"Template repository"**

**Para cada novo cliente:**
```
1. GitHub → "Use this template" → novo repo: brandbook-[nome-cliente]
2. Netlify → "Import existing project" → conectar novo repo
3. Netlify → Identity → Enable → Invite Only → Git Gateway Enable
4. Netlify → Identity → Invite → e-mail da equipe e/ou cliente
5. Editar _data/brand.json com dados reais via CMS ou commit direto
6. URL pública: https://[cliente]-brandbook.netlify.app
7. Domínio personalizado opcional via CNAME (ver SETUP.md)
```

**Naming convention de repos:** `brandbook-[sigla-cliente]`
**Naming convention de sites Netlify:** `[sigla-cliente]-brandbook`

---

## Temas e CSS

Cores da marca são aplicadas como CSS custom properties via JavaScript:
```js
document.documentElement.style.setProperty('--brand-primary', brand.colors.primary);
```

Para adicionar uma nova cor editável:
1. Adicionar campo em `brand.json` → `brand.colors.nova_cor`
2. Adicionar campo CMS em `admin/config.yml` (widget: `color`)
3. Aplicar via JS no `applyTheme()` em `script.js`
4. Usar `var(--brand-nova-cor)` no CSS

---

## Exportar PDF

O brandbook tem botão "Exportar PDF" que usa `window.print()` + CSS `@media print`.
Na impressão: top nav e navegação ficam ocultos, todos os módulos e tabs aparecem.

---

## Roadmap de Melhorias

- [ ] Módulo: Guidelines de Vídeo (formatos, proporções, motion rules)
- [ ] Módulo: Copy de Anúncios (Meta, Google, headlines, CTAs)
- [ ] Módulo: Naming & Domínios
- [ ] Dark mode toggle
- [ ] Preview ao vivo no CMS (Decap CMS editorial workflow)
- [ ] Script de onboarding automatizado para novos clientes
