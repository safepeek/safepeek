import { Env } from '@/types';
import { makeProfileRequest } from '@/lib/fetch';

const ephemeralCache = new Map<string, boolean>();

export async function resolveEphemeral(userId: string, env: Env): Promise<boolean> {
  if (ephemeralCache.has(userId)) return ephemeralCache.get(userId)!;

  const kvValue = await env.USER_CACHE.get(`ephemeral:${userId}`);
  if (kvValue !== null) {
    const resolved = kvValue === 'true';
    ephemeralCache.set(userId, resolved);
    return resolved;
  }

  // Cache miss — default to true and populate in the background
  populateEphemeralCache(userId, env);
  return true;
}

export async function cacheEphemeral(userId: string, value: boolean, env: Env): Promise<void> {
  ephemeralCache.set(userId, value);
  await env.USER_CACHE.put(`ephemeral:${userId}`, String(value));
}

function populateEphemeralCache(userId: string, env: Env): void {
  makeProfileRequest({ method: 'get', discordUserId: userId }, env)
    .then((response) => {
      const resolved = response.ok ? (response.data.ephemeral ?? true) : true;
      ephemeralCache.set(userId, resolved);
      env.USER_CACHE.put(`ephemeral:${userId}`, String(resolved));
    })
    .catch(() => {
      ephemeralCache.set(userId, true);
    });
}
