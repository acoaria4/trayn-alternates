import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const prefix = '/trayn-alternates/';
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.webp':'image/webp', '.avif':'image/avif', '.jpg':'image/jpeg', '.woff2':'font/woff2', '.txt':'text/plain' };
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === prefix.slice(0, -1)) { response.writeHead(301, { Location: prefix }).end(); return; }
    if (!pathname.startsWith(prefix)) { response.writeHead(404).end(); return; }
    let file = path.resolve(root, pathname.slice(prefix.length) || 'index.html');
    if (!file.startsWith(path.resolve(root) + path.sep)) { response.writeHead(404).end(); return; }
    let info = await stat(file);
    if (info.isDirectory()) {
      if (!pathname.endsWith('/')) { response.writeHead(301, { Location: `${pathname}/` }).end(); return; }
      file = path.join(file, 'index.html'); info = await stat(file);
    }
    if (!info.isFile()) { response.writeHead(404).end(); return; }
    response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    response.end(await readFile(file));
  } catch { response.writeHead(404).end(); }
});
server.listen(4183, '127.0.0.1', () => console.log(`Pages-style preview: http://127.0.0.1:4183${prefix}`));
