import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { handleApiRequest } from './api/_backend.js';

/** Serves the same API handlers as Vercel during local development. */
function apiDevMiddleware(): Plugin {
  return {
    name: 'agentic-sales-api-dev',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(Buffer.from(chunk));
          const raw = Buffer.concat(chunks).toString('utf8');
          let body: unknown;
          if (raw) {
            try { body = JSON.parse(raw); } catch { body = raw; }
          }

          const result = await handleApiRequest(
            req.method ?? 'GET',
            `/api${req.url ?? '/'}`,
            body,
          );
          Object.entries(result.headers).forEach(([key, value]) => res.setHeader(key, value));
          res.statusCode = result.status;
          res.end(typeof result.body === 'string' ? result.body : JSON.stringify(result.body));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'API error' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Make .env.local values available to the Node-side API handlers in dev.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

  return {
    base: './',
    plugins: [react(), apiDevMiddleware()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      allowedHosts: true,
    },
    preview: {
      host: '0.0.0.0',
      port: 5173,
      allowedHosts: true,
    },
  };
});
