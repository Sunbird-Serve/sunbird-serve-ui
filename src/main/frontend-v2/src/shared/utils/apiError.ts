export const TRY_AGAIN_MESSAGE = 'Please try again in a few seconds.';

// Readable message for a failed fetch() response.
// 409 (already exists) and other errors carry { message } in the body.
// 503 means the user directory is still loading.
export async function readErrorMessage(resp: Response, fallback: string): Promise<string> {
  if (resp.status === 503) return TRY_AGAIN_MESSAGE;
  const data = await resp.json().catch(() => null);
  if (data && typeof data.message === 'string' && data.message.trim()) return data.message;
  return fallback;
}

// Emails are trimmed and lowercased by the server, so do the same before sending or comparing.
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
