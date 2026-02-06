import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

/** 开发环境下提供保存数据到 index.json 的 API */
function saveDataPlugin() {
  return {
    name: 'save-data',
    configureServer(server: any) {
      server.middlewares.use('/api/save-data', (req: any, res: any, next: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ ok: false, message: 'Method Not Allowed' }));
          return;
        }
        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const root = path.dirname(fileURLToPath(import.meta.url));
            const dataPath = path.join(root, 'pages/data/index.json');
            fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true }));
          } catch (e: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: false, message: e?.message || 'Save failed' }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  base: '/start-homepage/',
  plugins: [vue(), saveDataPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
});

