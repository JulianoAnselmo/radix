# Guia de Deploy — Radix Radiologia Odontológica

Este documento contém **tudo que precisa ser feito antes e durante o deploy** do site para `radixradiologia.com.br`.

---

## ⚠️ TAREFAS MANUAIS QUE VOCÊ PRECISA FAZER

Estas tarefas exigem ferramentas externas ou interação manual e **não podem ser feitas pelo código**.

### 1. 🖼️ Otimizar imagens (CRÍTICO - 15 minutos)

As imagens hoje somam **~4 MB**, o que vai deixar o site lento. A meta é reduzir para **~700 KB**.

**Use Squoosh** (gratuito, online, sem instalar nada): https://squoosh.app

| Arquivo | Tamanho atual | Meta | Ação |
|---|---|---|---|
| `local.png` | **2.0 MB** | 200 KB | Converter para JPEG, qualidade 75-80, redimensionar largura máxima 1600px |
| `PERIAPICAL.PNG` | **944 KB** | 150 KB | Renomear para `periapical.jpg`, converter para JPEG qualidade 78, largura máxima 1200px |
| `Logo.png` | 300 KB | 30-50 KB | Manter PNG (tem transparência), passar pelo TinyPNG (https://tinypng.com) |
| `panoramica.jpg` | 328 KB | 100 KB | Re-comprimir com Squoosh, qualidade 78, largura máxima 1200px |
| `radiografia-panoramica.jpg` | 327 KB | 100 KB | Re-comprimir com Squoosh, qualidade 78, largura máxima 1200px |
| `intraoral.jpg` | 130 KB | 90 KB | Re-comprimir com Squoosh, qualidade 78, largura máxima 1000px |
| `TOMOGRAFIA.jpg` | 97 KB | 70 KB | Re-comprimir com Squoosh, qualidade 78, largura máxima 1000px |
| `TOMOGRAFIA-RESULTADOS.jpg` | 64 KB | 50 KB | Re-comprimir com Squoosh, qualidade 78, largura máxima 1000px |

**Passo a passo no Squoosh:**
1. Acesse https://squoosh.app
2. Arraste a imagem para a janela
3. No painel direito, escolha **MozJPEG** (compressor)
4. Defina **Quality: 78**
5. Marque "Resize" e ajuste largura conforme tabela acima
6. Clique no ícone de download
7. Substitua o arquivo na pasta do projeto

**Após otimizar `PERIAPICAL.PNG` e renomear para `periapical.jpg`:** edite `index.html` e substitua `PERIAPICAL.PNG` por `periapical.jpg` (1 ocorrência).

---

### 2. 📸 Gerar a OG Image (5 minutos)

A OG image é o "preview" que aparece quando alguém compartilha o link no WhatsApp/Facebook/LinkedIn.

**Passo a passo:**

1. Abra o arquivo `og-image-template.html` no Chrome
2. Aperte **F12** (DevTools)
3. Aperte **Ctrl+Shift+M** (modo responsivo / device toolbar)
4. No topo, defina **Width: 1200** e **Height: 630**
5. Aperte **Ctrl+Shift+P** (command palette do DevTools)
6. Digite "**Capture node screenshot**" e Enter
7. Clique no elemento `.og-canvas` no inspector se necessário, ou digite "Capture full size screenshot" como alternativa
8. Salve o arquivo como **`og-image.jpg`** na raiz do projeto
9. (Opcional) Passe pelo Squoosh para reduzir o tamanho

**Depois disso**, edite `index.html` e substitua estas 2 linhas:

```html
<meta property="og:image" content="https://radixradiologia.com.br/Logo.png">
<meta name="twitter:image" content="https://radixradiologia.com.br/Logo.png">
```

por:

```html
<meta property="og:image" content="https://radixradiologia.com.br/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:image" content="https://radixradiologia.com.br/og-image.jpg">
```

(O `og:image:width` e `og:image:height` já existem no arquivo, só precisam estar consistentes com a nova imagem.)

**Após gerar a og-image.jpg, delete o arquivo `og-image-template.html`** — ele só serve pra geração.

---

### 3. 🌐 Configurar DNS do domínio

No painel do registrador (Registro.br ou outro), aponte:

- **`radixradiologia.com.br`** (raiz, sem www) → IP do servidor AWS EC2: `52.67.42.34`
- **`www.radixradiologia.com.br`** → CNAME → `radixradiologia.com.br`

O `.htaccess` já está configurado para redirecionar `www` → raiz automaticamente.

**Aguarde a propagação** (geralmente 1-4 horas, máximo 48h).

---

### 4. 🔒 Habilitar HTTPS (CRÍTICO)

Sem HTTPS o site:
- Aparece como "não seguro" no navegador
- Cookie banner não funciona corretamente
- Google penaliza no SEO
- O `.htaccess` força HTTPS, então sem certificado o site fica inacessível

**Use Let's Encrypt** (gratuito) no seu servidor AWS EC2:

```bash
# SSH no servidor
sudo apt update
sudo apt install certbot python3-certbot-apache

# Gerar certificado para ambos os domínios
sudo certbot --apache -d radixradiologia.com.br -d www.radixradiologia.com.br

# Renovação automática a cada 90 dias
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

**IMPORTANTE:** No `.htaccess` há uma linha com `Strict-Transport-Security` (HSTS). Só ative essa linha **DEPOIS** de confirmar que o HTTPS está funcionando 100%, senão você fica preso (o navegador lembra que precisa ser HTTPS por 1 ano).

---

### 5. 📊 Google Search Console (15 minutos)

Para que o Google indexe o site corretamente e você acompanhe métricas:

1. Acesse https://search.google.com/search-console
2. Adicione `radixradiologia.com.br` (propriedade de domínio)
3. Verifique a propriedade via DNS TXT record
4. Após verificado, vá em **Sitemaps** e envie: `https://radixradiologia.com.br/sitemap.xml`
5. Aguarde alguns dias até começar a indexar

---

### 6. 📈 Analytics (opcional, mas recomendado)

**Opção A — Google Analytics 4** (mais popular, mas precisa de cookie banner já existente)

1. Crie uma propriedade GA4 em https://analytics.google.com
2. Pegue o ID `G-XXXXXXXXXX`
3. Adicione no `<head>` do `index.html` (antes do `</head>`):

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', {
    'anonymize_ip': true
  });
</script>
```

**Opção B — Plausible** (RECOMENDADO: LGPD-friendly, não precisa de cookie banner para analytics, ~$9/mês)

1. Crie conta em https://plausible.io
2. Adicione o domínio
3. Cole no `<head>`:

```html
<script defer data-domain="radixradiologia.com.br" src="https://plausible.io/js/script.js"></script>
```

A vantagem do Plausible: não usa cookies, então o cookie banner pode ser ainda mais simples (ou removido se não usar nenhuma outra ferramenta com cookies).

---

## 📦 ARQUIVOS PRONTOS NESTE COMMIT

### Novos arquivos criados:
- ✅ `.htaccess` — Configuração completa do Apache (HTTPS, cache, GZIP, security headers, URLs limpas, 404)
- ✅ `politica-privacidade.html` — Política LGPD compliant
- ✅ `404.html` — Página 404 customizada com identidade Radix
- ✅ `og-image-template.html` — Template para gerar a OG image (deletar após gerar)
- ✅ `INSTRUCOES-DEPLOY.md` — Este arquivo

### Arquivos atualizados:
- ✅ `index.html` — Cookie banner LGPD, schema.org com sameAs (Insta+FB+Google), footer com social real, link política, canonical sem www, CSS morto removido
- ✅ `area-dentista/index.html` — Cookie banner, footer com social, link política, canonical sem www
- ✅ `manifest.json` — PWA icons completos (192/512 + maskable), shortcuts, scope
- ✅ `sitemap.xml` — Data atualizada, política adicionada, sem www
- ✅ `robots.txt` — Bloqueia /area-dentista/, sem www no sitemap

---

## ✅ CHECKLIST DE DEPLOY

Marque conforme for completando:

### Antes do upload
- [ ] Otimizar todas as 8 imagens (item 1)
- [ ] Renomear `PERIAPICAL.PNG` para `periapical.jpg` e atualizar referência no `index.html`
- [ ] Gerar `og-image.jpg` (item 2) e atualizar meta tags
- [ ] Deletar `og-image-template.html` da pasta (não precisa estar no servidor)
- [ ] Deletar `INSTRUCOES-DEPLOY.md` do servidor (manter no git, não no servidor — o `.htaccess` já bloqueia .md mas é bom remover mesmo)
- [ ] Comentar a linha `Strict-Transport-Security` no `.htaccess` antes do primeiro upload (descomentar só após HTTPS funcionar)

### Configuração de servidor
- [ ] DNS apontando para AWS EC2
- [ ] Apache rodando com `mod_rewrite`, `mod_headers`, `mod_deflate`, `mod_expires` ativos
- [ ] Certificado SSL Let's Encrypt instalado
- [ ] Renovação automática do SSL configurada

### Upload
- [ ] Subir todos os arquivos via FTP/SCP/rsync para o webroot do servidor
- [ ] Confirmar que `.htaccess` foi enviado (alguns FTP escondem arquivos com `.`)
- [ ] Permissões corretas: arquivos 644, diretórios 755

### Pós-deploy — Testes
- [ ] Acessar `http://radixradiologia.com.br` → deve redirecionar para `https://`
- [ ] Acessar `https://www.radixradiologia.com.br` → deve redirecionar para `https://radixradiologia.com.br`
- [ ] Acessar `radixradiologia.com.br/area-dentista/` → deve abrir a página da área do dentista
- [ ] Tentar acessar uma URL inválida → deve mostrar a página 404 customizada
- [ ] Cookie banner aparece no primeiro acesso → após clicar Aceitar/Rejeitar não aparece mais
- [ ] Política de Privacidade abre via link no footer
- [ ] Form de login da Área do Dentista funciona (POST para EasyDoc)
- [ ] Botões WhatsApp abrem o WhatsApp corretamente
- [ ] Redes sociais do footer abrem em nova aba
- [ ] Compartilhar a URL no WhatsApp → ver se a OG image aparece corretamente
- [ ] Ativar o `Strict-Transport-Security` no `.htaccess` agora que HTTPS está OK

### SEO e ferramentas
- [ ] Google Search Console adicionado e verificado
- [ ] Sitemap submetido no Search Console
- [ ] Meta tag de verificação do Search Console no `<head>` do `index.html`
- [ ] (Opcional) Analytics instalado
- [ ] Atualizar o Google Business Profile com a URL do novo site
- [ ] Linkar o novo site no Instagram bio
- [ ] Linkar o novo site no Facebook

### Validação final
- [ ] Lighthouse no DevTools — metas:
  - Performance ≥ 90
  - Accessibility ≥ 95
  - Best Practices ≥ 95
  - SEO ≥ 95
- [ ] Validar HTML em https://validator.w3.org
- [ ] Testar em iPhone real e Android real
- [ ] Verificar exibição em modo escuro do sistema (deve continuar com tema claro do site)

---

## 🔧 MANUTENÇÃO PÓS-DEPLOY

### Mensal
- Verificar se o certificado SSL está renovando automaticamente
- Conferir métricas no Google Search Console
- Verificar se há erros 404 no Search Console

### Trimestral
- Testar o login da Área do Dentista (a EasyDoc pode mudar endpoints sem aviso)
- Conferir se as imagens dos exames ainda existem
- Atualizar `<lastmod>` no `sitemap.xml` se houver mudanças significativas

### Quando atualizar conteúdo
- Sempre atualize a versão dos arquivos CSS/JS adicionando query string (`?v=2`) ao final dos imports, para forçar atualização do cache do navegador dos visitantes

---

## 🆘 SUPORTE

Em caso de problemas durante ou após o deploy, anote:
- O que estava tentando fazer
- Mensagem de erro exata
- URL onde aconteceu
- Qual navegador / dispositivo
