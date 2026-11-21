/**
 * scripts/serve.js
 *
 * Servidor estático HTTP nativo em Node.js (sem dependências externas)
 * para testes automatizados determinísticos do CloudGeo.
 *
 * Controles de Isolamento e Segurança:
 * - Vinculado estritamente à interface de loopback (127.0.0.1)
 * - Prevenção contra Directory Traversal com verificação canônica
 * - Bloqueio de arquivos ocultos (.git, .github, etc.)
 * - Whitelist estrita de extensões estáticas permitidas
 * - Cabeçalhos defensivos básicos (X-Content-Type-Options, X-Frame-Options)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT || '8080', 10);
const HOST = '127.0.0.1';
const ROOT = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // Apenas métodos de leitura seguros
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('405 Method Not Allowed');
    return;
  }

  const rawUrl = req.url.split('?')[0];
  let safePath;
  try {
    safePath = decodeURIComponent(rawUrl);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('400 Bad Request');
    return;
  }

  const targetFile = safePath === '/' ? 'index.html' : safePath.replace(/^\/+/, '');
  const filePath = path.resolve(ROOT, targetFile);

  // 1. Previne Directory Traversal
  const rel = path.relative(ROOT, filePath);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  // 2. Bloqueia acesso a arquivos ocultos ou de configuração (.git, .github, etc.)
  const pathParts = rel.split(path.sep);
  if (pathParts.some(part => part.startsWith('.'))) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  // 3. Whitelist estrita de extensões estáticas
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext];
  if (!contentType) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden - File type not allowed');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    });

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`📡 CloudGeo isolated test server rodando em http://${HOST}:${PORT}`);
});
