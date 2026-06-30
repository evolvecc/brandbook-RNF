# Guia de Setup — Brandbook Template

## Como criar um brandbook para um novo cliente

### Pré-requisitos (uma vez só)
- Conta gratuita no [GitHub](https://github.com)
- Conta gratuita no [Netlify](https://netlify.com)

---

## Passo a Passo

### 1. Subir o template no GitHub

1. Crie um novo repositório no GitHub:
   - Clique em **New repository**
   - Nome sugerido: `brandbook-nomecliente`
   - Marque como **Public** (necessário para o plano gratuito)
   - Clique em **Create repository**

2. Envie os arquivos do template para esse repositório:
   ```bash
   git init
   git add .
   git commit -m "Brandbook inicial"
   git branch -M main
   git remote add origin https://github.com/SUA-ORG/brandbook-nomecliente.git
   git push -u origin main
   ```

### 2. Conectar ao Netlify

1. Acesse [netlify.com](https://netlify.com) e faça login
2. Clique em **Add new site → Import an existing project**
3. Escolha **Deploy with GitHub**
4. Selecione o repositório `brandbook-nomecliente`
5. Configurações de deploy:
   - **Build command**: (deixe em branco)
   - **Publish directory**: `.`
6. Clique em **Deploy site**
7. O site estará em `https://nome-aleatorio.netlify.app`
   - Renomeie em: Site settings → Change site name → `nomecliente-brandbook`
   - URL final: `https://nomecliente-brandbook.netlify.app`

### 3. Ativar o painel de edição (Decap CMS)

1. No painel do Netlify, vá em **Site settings → Identity**
2. Clique em **Enable Identity**
3. Em **Registration**, selecione **Invite only** (só quem você convidar pode editar)
4. Em **Services → Git Gateway**, clique em **Enable Git Gateway**
5. Volte para **Identity → Invite users** e convide o e-mail da sua equipe

### 4. Editar o conteúdo da marca

1. Acesse: `https://nomecliente-brandbook.netlify.app/admin`
2. Faça login com o e-mail convidado
3. Clique em **Brandbook → Dados Completos da Marca**
4. Edite todos os campos do cliente:
   - Cores, fontes, nome da marca
   - Conteúdo de cada módulo
   - Upload de logos, ícones, mockups
5. Clique em **Publish** para salvar e publicar
6. Aguarde ~30 segundos para o site atualizar

### 5. Compartilhar com o cliente

Envie a URL `https://nomecliente-brandbook.netlify.app` para o cliente.

---

## Domínio personalizado (opcional, gratuito)

Se o cliente tiver um domínio próprio (ex: `marca.com.br`):

1. Netlify → Site settings → Domain management → Add domain
2. Adicione `brandbook.nomecliente.com.br` como subdomínio
3. Configure o DNS no provedor do cliente:
   - Tipo: CNAME
   - Host: `brandbook`
   - Valor: `nomecliente-brandbook.netlify.app`

---

## Estrutura dos arquivos

```
brandbook-template/
├── index.html           ← página pública do brandbook
├── assets/
│   ├── style.css        ← design system adaptável
│   ├── script.js        ← toda a interatividade
│   └── images/          ← imagens enviadas pelo CMS
├── admin/
│   ├── index.html       ← painel de edição
│   └── config.yml       ← campos do painel
├── _data/
│   └── brand.json       ← conteúdo da marca (editado pelo CMS)
└── netlify.toml         ← configuração de deploy
```

---

## Customizações avançadas

### Adicionar o nome da agência no rodapé do sidebar

Em `_data/brand.json`, adicione (ou edite via CMS):
```json
"agency_name": "Nome da Sua Agência"
```

Então em `script.js`, na função `updateSidebarBrand`:
```js
const agencyEl = document.getElementById('sidebar-agency');
if (agencyEl && data.brand.agency_name) agencyEl.textContent = data.brand.agency_name;
```

### Adicionar novo módulo

1. Adicione uma nova seção `<section class="module hidden" id="novo-modulo">` no `index.html`
2. Adicione o link no sidebar (`.nav-item` com `data-module="novo-modulo"`)
3. Adicione o campo correspondente no `admin/config.yml`
4. Adicione a função `renderNovoModulo()` no `script.js` e chame ela em `init()`
