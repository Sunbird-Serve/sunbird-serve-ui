import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import keycloak from '@config/keycloak';

// Base API with Keycloak Bearer token + X-Agency-Id header
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers) => {
      // Attach Bearer token from Keycloak
      if (keycloak.token) {
        headers.set('Authorization', `Bearer ${keycloak.token}`);
      }

      // Attach X-Agency-Id from token claims
      const agencyId = (keycloak.tokenParsed as Record<string, unknown> | undefined)?.agencyId as string || '';
      if (agencyId) {
        headers.set('X-Agency-Id', agencyId);
      }

      return headers;
    },
  }),
  tagTypes: ['Need', 'NeedType', 'User', 'Entity', 'Nomination', 'Agency', 'NeedPlan'],
  endpoints: () => ({}),
});
