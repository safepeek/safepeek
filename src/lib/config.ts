import { Env } from '@/types';

let cachedDeploymentId: string | null = null;
let cachedCommitHash: string | null = null;
let cachedCommitHashShort: string | null = null;

export async function getDeploymentId(env: Env): Promise<string> {
  if (cachedDeploymentId) return cachedDeploymentId;

  cachedDeploymentId = (await env.CONFIG.get('DEPLOYMENT_ID')) ?? 'unknown';
  return cachedDeploymentId;
}

export async function getCommitHash(env: Env): Promise<string> {
  if (cachedCommitHash) return cachedCommitHash;

  cachedCommitHash = (await env.CONFIG.get('LAST_COMMIT')) ?? 'unknown';
  return cachedCommitHash;
}

export async function getCommitHashShort(env: Env): Promise<string> {
  if (cachedCommitHashShort) return cachedCommitHashShort;

  cachedCommitHashShort = (await env.CONFIG.get('LAST_COMMIT_SHORT')) ?? 'unknown';
  return cachedCommitHashShort;
}
