import { createServer } from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultHost = process.env.HOST || '127.0.0.1';
const defaultPort = Number.parseInt(process.env.PORT || '5000', 10);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
};

function getRequestPath(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl || '/', 'http://localhost').pathname);

  if (pathname === '/front_app' || pathname.startsWith('/front_app/')) {
    return pathname.slice('/front_app'.length) || '/';
  }

  return pathname;
}

function resolveFilePath(requestPath) {
  const relativePath = requestPath === '/' ? 'index.html' : requestPath.slice(1);
  const filePath = path.resolve(rootDirectory, relativePath);
  const relativeToRoot = path.relative(rootDirectory, filePath);

  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
    return null;
  }

  return filePath;
}

async function serveFile(request, response) {
  let requestPath;

  try {
    requestPath = getRequestPath(request.url);
  } catch {
    response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Bad Request');
    return;
  }

  const filePath = resolveFilePath(requestPath);
  if (!filePath) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Forbidden');
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Type': contentTypes[extension] || 'application/octet-stream',
    });

    if (request.method === 'HEAD') {
      response.end();
    } else {
      response.end(file);
    }
  } catch (error) {
    const statusCode = error.code === 'ENOENT' || error.code === 'EISDIR' ? 404 : 500;
    response.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(statusCode === 404 ? 'Not Found' : 'Internal Server Error');
  }
}

export function createApp() {
  return createServer((request, response) => {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' });
      response.end('Method Not Allowed');
      return;
    }

    serveFile(request, response);
  });
}

export function startServer({ host = defaultHost, port = defaultPort } = {}) {
  const server = createApp();

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      server.removeListener('error', reject);
      resolve(server);
    });
  });
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  startServer().then((server) => {
    const address = server.address();
    console.log(`iRent front app running at http://${defaultHost}:${address.port}/`);
  });
}
