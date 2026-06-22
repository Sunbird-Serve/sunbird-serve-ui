import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '@config/keycloak';

const NEED_BASE = import.meta.env.VITE_API_BASE_URL_NEED;
const FULFILL_BASE = import.meta.env.VITE_API_BASE_URL_FULFILL;
const VOLUNTEERING_BASE = import.meta.env.VITE_API_BASE_URL_VOLUNTEERING;

// Dynamic base URL based on the endpoint path
function getBaseUrl(args: string | { url: string }): string {
  const url = typeof args === 'string' ? args : args.url;
  if (url.includes('serve-fulfill')) return FULFILL_BASE;
  if (url.includes('serve-volunteering')) return VOLUNTEERING_BASE;
  return NEED_BASE; // default for serve-need
}

// Base API with Keycloak Bearer token + X-Agency-Id header
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: async (args, api, extraOptions) => {
    // Determine the correct base URL based on the endpoint path
    const baseUrl = getBaseUrl(args);

    // Ensure token is fresh before making the request
    try {
      await keycloak.updateToken(30);
    } catch {
      // If refresh fails, proceed with existing token (may be null)
    }

    const rawBaseQuery = fetchBaseQuery({
      baseUrl,
      prepareHeaders: (headers) => {
        if (keycloak.token) {
          headers.set('Authorization', `Bearer ${keycloak.token}`);
        }
        const agencyId = (keycloak.tokenParsed as Record<string, unknown> | undefined)?.agencyId as string || '';
        if (agencyId) {
          headers.set('X-Agency-Id', agencyId);
        }
        return headers;
      },
    });

    return rawBaseQuery(args, api, extraOptions);
  },
  tagTypes: ['Need', 'NeedType', 'User', 'Entity', 'Nomination', 'Agency', 'NeedPlan'],
  endpoints: () => ({}),
});
