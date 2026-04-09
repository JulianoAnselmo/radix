# Guia de Deploy no GitHub Pages — Radix Radiologia

Passo-a-passo completo para subir o site no GitHub Pages, conectar domínio próprio e configurar analytics.

---

## ⚠️ Considerações importantes sobre GitHub Pages

GitHub Pages é um serviço de hospedagem **estática gratuita** do GitHub. Antes de começar:

### O que GitHub Pages FAZ automaticamente
- ✅ HTTPS gratuito (Let's Encrypt) — não precisa configurar nada
- ✅ Compressão GZIP em CSS, JS, HTML
- ✅ Cache de browser configurado
- ✅ CDN global (via Fastly)
- ✅ Suporta `404.html` automático
- ✅ Suporta URLs limpas (`/exames/tomografia-odontologica/` → serve `index.html` da subpasta)
- ✅ Suporta domínio personalizado
- ✅ Bandwidth: 100GB/mês (mais que suficiente para clínica)

### O que GitHub Pages NÃO faz
- ❌ **Não processa `.htaccess`** — esse arquivo é específico do Apache, será ignorado
- ❌ **Não permite security headers customizados** (HSTS, CSP, etc.) — você perde isso
- ❌ **Não suporta server-side scripts** (PHP, Node.js, etc.) — não é problema, nosso site é 100% estático

### O `.htaccess` que criamos
Você pode **deixar no repositório** — GitHub Pages simplesmente vai ignorar. Não vai dar erro nem atrapalhar. Se quiser deletar para deixar o repo mais limpo, fica à vontade.

---

## Passo 1 — Criar conta no GitHub

Se ainda não tem:

1. Acesse https://github.com/signup
2. Use um email da clínica (ex: `contato@radixradiologia.com.br`) ou pessoal
3. Escolha username simples (ex: `radixradiologia`, `radix-radiologia`)
4. Verifique o email
5. Plano: **Free** (suficiente)

---

## Passo 2 — Criar o repositório

1. Faça login no GitHub
2. Clique em **+** (canto superior direito) → **New repository**
3. Configure:
   - **Repository name:** `radixradiologia.com.br` ou `radix-site` (qualquer nome serve)
   - **Description:** "Site institucional da Radix Radiologia Odontológica"
   - **Public** (obrigatório para usar GitHub Pages no plano Free)
   - **NÃO** marque "Add README", "Add .gitignore" nem "Add license" — o repositório local já tem
4. Clique em **Create repository**

---

## Passo 3 — Conectar o repositório local ao GitHub

No seu terminal, dentro da pasta `C:/dev/clientes/radix`:

```bash
# Adicionar o GitHub como remote
git remote add origin https://github.com/SEU_USERNAME/SEU_REPO.git

# (Substituir SEU_USERNAME e SEU_REPO pelos valores reais)

# Renomear a branch para main (se ainda for master)
git branch -M main

# Enviar todo o histórico
git push -u origin main
```

Se for a primeira vez fazendo push pelo Git no Windows, ele vai pedir para fazer login no GitHub via browser. Aceite.

---

## Passo 4 — Ativar GitHub Pages

1. No repositório (`https://github.com/SEU_USERNAME/SEU_REPO`)
2. Clique em **Settings** (no topo)
3. No menu lateral esquerdo, clique em **Pages**
4. Em **Build and deployment** → **Source**, selecione **Deploy from a branch**
5. Em **Branch**, selecione **main** e pasta **/ (root)**
6. Clique em **Save**
7. Aguarde ~1 minuto

Após alguns minutos, o site estará no ar em:
`https://SEU_USERNAME.github.io/SEU_REPO/`

(Por exemplo: `https://radixradiologia.github.io/radix-site/`)

---

## Passo 5 — Configurar domínio próprio (radixradiologia.com.br)

### 5.1 — Criar arquivo `CNAME` no repositório

No seu terminal local:

```bash
cd C:/dev/clientes/radix
echo radixradiologia.com.br > CNAME
git add CNAME
git commit -m "feat: configura CNAME para dominio personalizado"
git push
```

(O arquivo `CNAME` é especial do GitHub Pages — ele indica qual domínio aponta pro repositório.)

### 5.2 — Configurar DNS no Registro.br (ou onde o domínio está)

Acesse o painel do registro do domínio e adicione os seguintes registros:

**Registros A** (para o domínio raiz `radixradiologia.com.br`):
| Tipo | Nome | Valor | TTL |
|---|---|---|---|
| A | `@` | `185.199.108.153` | 3600 |
| A | `@` | `185.199.109.153` | 3600 |
| A | `@` | `185.199.110.153` | 3600 |
| A | `@` | `185.199.111.153` | 3600 |

**Registro CNAME** (para `www.radixradiologia.com.br`):
| Tipo | Nome | Valor | TTL |
|---|---|---|---|
| CNAME | `www` | `SEU_USERNAME.github.io` | 3600 |

Salve as alterações.

### 5.3 — Aguardar propagação DNS

Pode levar de **15 minutos a 24 horas**. Para verificar:
```bash
nslookup radixradiologia.com.br
```
Quando o IP retornar `185.199.108.153` (ou similar), está propagado.

### 5.4 — Configurar o domínio no GitHub Pages

1. Volte em **Settings → Pages**
2. Em **Custom domain**, digite `radixradiologia.com.br` e clique **Save**
3. GitHub vai verificar o DNS automaticamente
4. **Aguarde alguns minutos** para o GitHub gerar o certificado SSL
5. Marque **Enforce HTTPS** assim que disponível

Agora o site está em `https://radixradiologia.com.br` 🎉

---

## Passo 6 — Configurar GoatCounter (analytics)

### 6.1 — Criar conta no GoatCounter

1. Acesse https://www.goatcounter.com/signup
2. Crie conta gratuita (até 100k pageviews/mês)
3. Escolha um **site code** simples — ex: `radix` ou `radixradiologia`
4. Você ganhará um subdomínio, ex: `https://radixradiologia.goatcounter.com`

### 6.2 — Atualizar o código no projeto

Abra `assets/site.js` e localize a linha:

```javascript
var GOATCOUNTER_CODE = 'RADIXRADIOLOGIA'; // <- TROCAR pelo seu codigo
```

Substitua `RADIXRADIOLOGIA` pelo código que você criou no GoatCounter.

Por exemplo, se você criou `radixradiologia.goatcounter.com`, mude para:
```javascript
var GOATCOUNTER_CODE = 'radixradiologia';
```

Salve, commite e faça push:
```bash
git add assets/site.js
git commit -m "feat(analytics): integra GoatCounter"
git push
```

Em alguns segundos, o site já estará registrando visitas. Acesse `https://radixradiologia.goatcounter.com` para ver o dashboard.

---

## Passo 7 — Configurar Google Search Console

Esta é a ferramenta **mais importante** para ver quantos cliques você recebe do Google.

### 7.1 — Adicionar propriedade

1. Acesse https://search.google.com/search-console
2. Faça login com conta Google (idealmente a mesma do Google Business Profile)
3. Clique em **Adicionar propriedade**
4. Escolha **Domínio** (não "Prefixo do URL")
5. Digite `radixradiologia.com.br`
6. Clique em **Continuar**

### 7.2 — Verificar propriedade via DNS

O Google vai pedir para você adicionar um registro **TXT** no DNS. Algo como:

```
google-site-verification=ABCXYZ1234567890...
```

Acesse o painel do Registro.br novamente e adicione:
| Tipo | Nome | Valor | TTL |
|---|---|---|---|
| TXT | `@` | `google-site-verification=ABCXYZ...` (copie do Google) | 3600 |

Salve, aguarde 5-10 minutos, e clique **Verificar** no Google Search Console.

### 7.3 — Submeter o sitemap

1. No menu lateral → **Sitemaps**
2. Em "Adicionar um novo sitemap", digite: `sitemap.xml`
3. Clique **Enviar**

Em 1-3 dias, o Google vai começar a indexar e mostrar dados.

### 7.4 — Onde ver os cliques

No menu lateral do Search Console:
- **Desempenho** → mostra:
  - **Total de cliques** (quantas pessoas clicaram em links seus no Google)
  - **Total de impressões** (quantas vezes apareceu nos resultados)
  - **CTR médio** (taxa de clique = cliques / impressões)
  - **Posição média** no Google
  - **Por consulta** (qual palavra foi pesquisada)
  - **Por página** (qual página recebe mais cliques)
  - **Por país** e **dispositivo**

---

## Passo 8 — Testar tudo

Use estas ferramentas para validar que está tudo OK:

| Ferramenta | URL | O que verifica |
|---|---|---|
| **Google Rich Results Test** | https://search.google.com/test/rich-results | Schema.org, FAQ, Reviews aparecem corretamente |
| **PageSpeed Insights** | https://pagespeed.web.dev | Performance Mobile + Desktop |
| **Mobile-Friendly Test** | https://search.google.com/test/mobile-friendly | Site responde bem em mobile |
| **HTTPS Checker** | https://www.whynopadlock.com | Tudo carrega via HTTPS sem mixed content |
| **Schema Validator** | https://validator.schema.org | Valida o JSON-LD |
| **HTML Validator** | https://validator.w3.org/nu/ | HTML sem erros |

**Meta de Lighthouse:**
- Performance ≥ 90
- Accessibility ≥ 95
- Best Practices ≥ 95
- SEO ≥ 95

---

## Passo 9 — Deploy contínuo

A partir daqui, qualquer alteração que você fizer no código local + `git push` será automaticamente deployada no GitHub Pages em ~1 minuto.

Workflow básico:
```bash
# Editar arquivos no VS Code
# Salvar

git add .
git commit -m "feat: descreva sua mudança"
git push

# Aguardar ~1 minuto e atualizar o site no browser
```

Para ver se o build está sendo processado: **Settings → Pages** mostra o status.

---

## Limitações do GitHub Pages que você deve saber

1. **Bandwidth:** 100GB/mês — para clínica de bairro é mais que suficiente. Se chegar perto, GitHub envia aviso.

2. **Builds por hora:** 10 — mas como nosso site é estático puro (sem Jekyll), não usa build. Sem limite na prática.

3. **Tamanho do repositório:** recomendado <1GB. O nosso tem ~5MB.

4. **Sem servidor backend:** se um dia quiser adicionar formulários de contato com envio de email, precisará usar um serviço externo tipo Formspree ou Netlify Forms.

5. **Sem URL rewriting customizado:** o `.htaccess` para forçar `www → raiz` não funciona. **Solução:** GitHub Pages já redireciona automaticamente via configuração no painel quando você define o `Custom domain` sem `www`.

---

## Resolver problemas comuns

### "Page not found" depois do deploy
- Aguarde 1-2 minutos após o push
- Verifique se o `index.html` está na raiz do repositório (não dentro de subpasta)
- Em **Settings → Pages**, confirme que está usando branch `main` e `/ (root)`

### "Custom domain not properly configured"
- Aguarde a propagação do DNS (até 24h)
- Verifique se os 4 registros A estão corretos
- Tente `nslookup radixradiologia.com.br` — deve retornar 185.199.x.x

### Certificado SSL não emitido
- Aguarde até 24h após apontar o DNS
- Em casos raros, faça **Remove → Save** e depois **adicione novamente** o domínio em Settings → Pages

### Imagens não aparecem
- Verifique se os nomes dos arquivos estão exatamente iguais (case-sensitive!)
- `PERIAPICAL.PNG` é diferente de `periapical.png` no Linux
- Recomendação: padronize tudo em minúsculas

### Cookie banner não aparece
- Limpe o `localStorage` do navegador (DevTools → Application → Local Storage → Clear)
- O banner só aparece na **primeira** visita

---

## Próximos passos depois do deploy

1. ✅ Site no ar em `radixradiologia.com.br`
2. ✅ Search Console configurado
3. ✅ GoatCounter funcionando
4. 📈 **Conseguir backlinks locais:**
   - Cadastrar Radix em Doctoralia, BoaConsulta, ConsultaSP
   - Cadastrar em diretórios locais de Taquaritinga
   - Pedir parcerias com dentistas para linkarem o site deles
5. 📈 **Conseguir mais avaliações no Google:**
   - QR code na recepção
   - Mensagem de fim de atendimento com link de avaliação
   - Email/WhatsApp pós-exame
6. 📈 **Atualizar Google Business Profile:**
   - Foto do interior, exterior e equipamentos atualizadas
   - Posts mensais (novidades, dicas)
   - Responder TODAS as avaliações
7. 📊 **Acompanhar métricas semanalmente:**
   - Search Console: cliques, impressões, posição
   - GoatCounter: total visitas, páginas mais vistas
8. 📝 **Considerar blog (longo prazo):**
   - 1-2 artigos/mês sobre exames
   - Cada artigo é uma porta de entrada do Google

---

## URLs importantes para guardar

| Recurso | URL |
|---|---|
| Repositório GitHub | `https://github.com/SEU_USERNAME/SEU_REPO` |
| Site público | `https://radixradiologia.com.br` |
| GoatCounter dashboard | `https://radixradiologia.goatcounter.com` |
| Google Search Console | https://search.google.com/search-console |
| Google Business Profile | https://business.google.com |

---

## Suporte

Em caso de dúvidas durante o deploy, procure:
- Documentação oficial do GitHub Pages: https://docs.github.com/pt/pages
- Documentação do Search Console: https://support.google.com/webmasters
- Documentação do GoatCounter: https://www.goatcounter.com/help
