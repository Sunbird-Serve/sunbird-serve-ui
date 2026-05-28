import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './store';

// Base API with X-Agency-Id header auto-injected from user state
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const rawAgencyId = state.user.data?.agencyId || '';
      // Strip "1-" prefix (Sunbird RC format) to get plain UUID for need service
      const agencyId = rawAgencyId.startsWith('1-') ? rawAgencyId.substring(2) : rawAgencyId;
      if (agencyId) {
        headers.set('X-Agency-Id', agencyId);
      }
      return headers;
    },
  }),
  tagTypes: ['Need', 'NeedType', 'User', 'Entity', 'Nomination', 'Agency', 'NeedPlan'],
  endpoints: () => ({}),
});
