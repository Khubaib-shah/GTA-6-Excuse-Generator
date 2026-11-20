import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { resolveExcuseRequest } from './src/server/excuseHandler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '32kb' }));

  app.post('/api/excuse', async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const result = await resolveExcuseRequest(body);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(result);
  });

  const resolvePublicOrigin = (req: express.Request): string => {
    const envUrl = process.env.APP_URL?.trim().replace(/\/+$/, '');
    if (envUrl) return envUrl;
    const proto = (req.get('x-forwarded-proto') || req.protocol || 'https')
      .split(',')[0]
      .trim();
    const host = req.get('x-forwarded-host') || req.get('host');
    return host ? `${proto}://${host}` : `http://localhost:${PORT}`;
  };

  app.get('/robots.txt', (req, res) => {
    const origin = resolvePublicOrigin(req);
    res
      .type('text/plain; charset=utf-8')
      .send(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`);
  });

  app.get('/sitemap.xml', (req, res) => {
    const origin = resolvePublicOrigin(req);
    const lastmod = new Date().toISOString().split('T')[0];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${origin}/privacy-policy</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
`;
    res.type('application/xml; charset=utf-8').send(xml);
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
