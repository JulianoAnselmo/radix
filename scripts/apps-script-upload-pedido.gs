/**
 * Radix — Upload de pedido digital para o Google Drive
 * ------------------------------------------------------
 * Este código roda no Google Apps Script (script.google.com), NÃO no site.
 *
 * Como implantar:
 *   1. Entrar no Gmail/Google com a conta da clínica que vai guardar os PDFs.
 *   2. Abrir https://script.google.com → "Novo projeto".
 *   3. Colar este arquivo em `Código.gs` (substituindo o conteúdo padrão).
 *   4. (Opcional) Definir SHARED_TOKEN com uma string secreta, e preencher o
 *      mesmo valor em assets/pedido-digital.js (constante DRIVE_UPLOAD_TOKEN).
 *   5. Menu "Implantar" → "Nova implantação" → Tipo "Aplicativo da Web".
 *        - Executar como:  Eu (a conta da clínica)
 *        - Quem tem acesso: Qualquer pessoa
 *   6. Copiar o URL gerado (termina em /exec) e colar em
 *      assets/pedido-digital.js (constante DRIVE_UPLOAD_URL).
 *   7. A cada alteração deste script, criar uma NOVA implantação (o URL pode
 *      permanecer o mesmo se escolher "Gerenciar implantações" → editar).
 */

const ROOT_FOLDER = 'radix';
const SHARED_TOKEN = ''; // preencha se quiser exigir token do site

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    if (SHARED_TOKEN && payload.token !== SHARED_TOKEN) {
      return json({ ok: false, error: 'token inválido' });
    }
    const filename = sanitizeName(payload.filename || 'pedido.pdf');
    const base64 = String(payload.base64 || '');
    const subfolder = String(payload.subfolder || ROOT_FOLDER);
    if (!base64) return json({ ok: false, error: 'pdf ausente' });

    const folder = getOrCreatePath(subfolder);
    const bytes = Utilities.base64Decode(base64);
    const blob = Utilities.newBlob(bytes, 'application/pdf', filename);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return json({ ok: true, url: file.getUrl(), id: file.getId() });
  } catch (err) {
    return json({ ok: false, error: String(err && err.message || err) });
  }
}

function doGet() {
  return json({ ok: true, service: 'radix-upload', ts: new Date().toISOString() });
}

function getOrCreatePath(path) {
  const parts = String(path).split('/').filter(Boolean);
  let parent = DriveApp.getRootFolder();
  parts.forEach(name => { parent = getOrCreateFolder(parent, name); });
  return parent;
}

function getOrCreateFolder(parent, name) {
  const it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

function sanitizeName(name) {
  return String(name).replace(/[\\/:*?"<>|]+/g, '-').slice(0, 120) || 'pedido.pdf';
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
