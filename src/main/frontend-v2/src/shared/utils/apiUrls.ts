// Centralized API base URLs
export const NEED_API = import.meta.env.VITE_API_BASE_URL_NEED;
export const FULFILL_API = import.meta.env.VITE_API_BASE_URL_FULFILL;
export const VOLUNTEERING_API = import.meta.env.VITE_API_BASE_URL_VOLUNTEERING;

/**
 * Get the correct base URL for an API path.
 * Use this for direct fetch() calls.
 */
export function apiUrl(path: string): string {
  if (path.startsWith('/api/v1/serve-fulfill')) return `${FULFILL_API}${path}`;
  if (path.startsWith('/api/v1/serve-volunteering')) return `${VOLUNTEERING_API}${path}`;
  return `${NEED_API}${path}`;
}
