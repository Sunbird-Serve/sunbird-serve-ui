import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base API — no auth headers for now (backend works without them)
// X-Agency-Id will be added later when the need-side agency mapping is clear
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  }),
  tagTypes: ['Need', 'NeedType', 'User', 'Entity', 'Nomination', 'Agency', 'NeedPlan'],
  endpoints: () => ({}),
});
