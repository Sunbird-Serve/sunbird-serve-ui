// Link to this deployment's community forum.
// Each instance sets its own in the environment (.env / .env.production):
//   VITE_COMMUNITY_URL=https://community.example.org     (leave empty to hide the link everywhere)
//   VITE_COMMUNITY_LABEL=Community                       (optional name shown in the app)

function safeHttpUrl(value: string): string {
  try {
    const url = new URL(value);
    // Only plain web links, never javascript: or other schemes
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
}

export const COMMUNITY_URL = safeHttpUrl((import.meta.env.VITE_COMMUNITY_URL || '').trim());
export const COMMUNITY_LABEL = (import.meta.env.VITE_COMMUNITY_LABEL || '').trim() || 'Community';
