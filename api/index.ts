import 'dotenv/config';
import type { IncomingMessage, ServerResponse } from 'http';
import { createApiApp } from '../server/app';

const app = createApiApp();

export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : `/${req.url}`);
  }
  return app(req as any, res as any);
}
