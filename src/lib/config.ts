import { Env } from '@/types';

let cachedDeploymentId: string | null = null;

export async function getDeploymentId(env: Env): Promise<string> {
  if (cachedDeploymentId) return cachedDeploymentId;

  cachedDeploymentId = (await env.CONFIG.get('DEPLOYMENT_ID')) ?? 'unknown';
  return cachedDeploymentId;
}
