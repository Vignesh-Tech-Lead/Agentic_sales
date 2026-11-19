import { handleApiRequest } from '../server/backend';

export const config = { maxDuration: 10 };

export default async function handler(req: any, res: any) {
  const result = await handleApiRequest(req.method ?? 'GET', req.url ?? '/api/health', req.body);
  Object.entries(result.headers).forEach(([key, value]) => res.setHeader(key, value));
  res.status(result.status);
  res.send(typeof result.body === 'string' ? result.body : JSON.stringify(result.body));
}
