#!/usr/bin/env node
import { createServer } from 'http';
import { extname, join, normalize, resolve } from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const rootDir = resolve(__dirname, '..');
const publicDir = rootDir;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function toPublicPath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const safePath = normalize(decoded).replace(/^\.\.(\/|\\)/g, '');
  return safePath === '/' ? 'index.html' : safePath.replace(/^\//, '');
}

async function serveStaticFile(res, filePath) {
  try {
    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      return serveStaticFile(res, join(filePath, 'index.html'));
    }
    const ext = extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    const data = await fs.readFile(filePath);
    res.writeHead(200, { 'Content-Type': contentType, 'Content-Length': data.length });
    res.end(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
    } else {
      console.error(`[demo-server] Failed to serve ${filePath}:`, error);
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Internal Server Error');
    }
  }
}

async function runHealthCheck() {
  const files = ['index.html', 'try-on.html', 'assets/js/try-on.js'];
  const missing = [];
  for (const file of files) {
    try {
      await fs.access(join(publicDir, file));
    } catch {
      missing.push(file);
    }
  }

  if (missing.length > 0) {
    console.error('[demo-server] Missing files:', missing.join(', '));
    process.exitCode = 1;
  } else {
    console.log('[demo-server] All required files are present.');
  }
}

async function startServer() {
  const portArg = process.env.PORT || process.env.DEMO_PORT || 4173;
  const host = process.env.HOST || '127.0.0.1';
  const port = Number(portArg);

  const server = createServer((req, res) => {
    const requestPath = toPublicPath(req.url || '/');
    const filePath = join(publicDir, requestPath);
    serveStaticFile(res, filePath);
  });

  server.listen(port, host, () => {
    console.log(`\n[demo-server] Demo running at http://${host}:${port}/try-on.html`);
    console.log('[demo-server] Press Ctrl+C to stop the server.');
  });

  server.on('error', (error) => {
    console.error('[demo-server] Server error:', error.message);
    process.exit(1);
  });
}

const args = new Set(process.argv.slice(2));

if (args.has('--check')) {
  runHealthCheck().catch((error) => {
    console.error('[demo-server] Health check failed:', error);
    process.exit(1);
  });
} else {
  startServer().catch((error) => {
    console.error('[demo-server] Unable to start:', error);
    process.exit(1);
  });
}
