import fetch from 'node-fetch';

export interface ModerationResult {
  allowed: boolean;
  reason?: string;
}

export async function scanImage(url: string, endpoint?: string): Promise<ModerationResult> {
  if (!endpoint) {
    return { allowed: true };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`Moderation service failed with status ${response.status}`);
    }

    const result = (await response.json()) as ModerationResult;
    return result;
  } catch (error) {
    console.warn('[moderation] Fallback to allow due to error', error);
    return { allowed: true, reason: 'moderation_service_unreachable' };
  }
}
