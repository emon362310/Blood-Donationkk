import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createApiApp } from './server/app';
import { getDb } from './server/db';
import { hydrateDbFromGoogleSheet } from './server/gasSync';

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = createApiApp();

  // ================= VITE / STATIC SERVING =================
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build not found');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BLOODIX server listening on http://0.0.0.0:${PORT}`);
    hydrateDbFromGoogleSheet(getDb()).catch(() => {});
  });
}

startServer();
