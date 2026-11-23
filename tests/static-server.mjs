import http from 'node:http';
import { readFile } from 'node:fs/promises';

const server = http.createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://127.0.0.1:4173').pathname;
  if (pathname !== '/' && pathname !== '/index.html') {
    response.writeHead(404);
    response.end('Not found');
    return;
  }
  try {
    const html = await readFile(new URL('../index.html', import.meta.url));
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    response.end(html);
  } catch {
    response.writeHead(500);
    response.end('Unable to read HUB page');
  }
});

server.listen(4173, '127.0.0.1');
