import keycloak from '@config/keycloak';

/**
 * Get auth headers for direct fetch() calls.
 * Includes Bearer token and X-Agency-Id from Keycloak.
 */
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};

  if (keycloak.token) {
    headers['Authorization'] = `Bearer ${keycloak.token}`;
  }

  const agencyId = (keycloak.tokenParsed as Record<string, unknown> | undefined)?.agencyId as string || '';
  if (agencyId) {
    headers['X-Agency-Id'] = agencyId;
  }

  return headers;
}

/**
 * Get auth headers including Content-Type for POST/PUT calls.
 */
export function getAuthHeadersWithJson(): Record<string, string> {
  return {
    ...getAuthHeaders(),
    'Content-Type': 'application/json',
  };
}
