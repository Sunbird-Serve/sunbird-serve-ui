import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const NEED_BASE = import.meta.env.VITE_API_BASE_URL_NEED;

// --- Response types matching backend API ---

export interface EntityOnboardEntity {
  id: string;
  agencyId: string;
  name: string;
  registrationId?: string;
  district: string;
  block: string;
  state: string;
  pincode?: string;
  category?: string;
  status?: string;
  mobile?: string | null;
  website?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface EntityListResponse {
  content: EntityOnboardEntity[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface EntityBrowseParams {
  agencyId?: string;
  district?: string;
  block?: string;
  state?: string;
  name?: string;
  page?: number;
  size?: number;
}

export interface InfraDetails {
  hasSmartTvOrProjector: boolean;
  hasComputerOrLaptop: boolean;
  hasSpeakers: boolean;
  hasReliableInternet: boolean;
  hasUsedForOnlineClass: string;
  canIndependentlyConnect: string;
}

export interface OnboardingRequestPayload {
  agencyId: string;
  entityId: string;
  coordinatorName: string;
  mobile: string;
  email: string;
  designation: string;
  infraDetails: InfraDetails;
}

export interface OnboardingRequestResponse {
  id: string;
  agencyId: string;
  entityId: string;
  coordinatorName: string;
  mobile: string;
  email: string;
  designation: string;
  infraDetails: InfraDetails;
  status: string;
  reviewerNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingStatusItem {
  requestId: string;
  entityName: string;
  status: string;
  reviewerNotes: string | null;
}

// --- Public API slice (no auth headers) ---

export const onboardingApi = createApi({
  reducerPath: 'onboardingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${NEED_BASE}/api/v1/serve-need`,
  }),
  endpoints: (builder) => ({
    // Browse entities with optional filters (paginated)
    browseEntities: builder.query<EntityListResponse, EntityBrowseParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.agencyId) searchParams.set('agencyId', params.agencyId);
        if (params.district) searchParams.set('district', params.district);
        if (params.block) searchParams.set('block', params.block);
        if (params.state) searchParams.set('state', params.state);
        if (params.name) searchParams.set('name', params.name);
        if (params.page !== undefined) searchParams.set('page', String(params.page));
        if (params.size !== undefined) searchParams.set('size', String(params.size));
        return `/entity-onboard/entities?${searchParams.toString()}`;
      },
    }),

    // Submit onboarding request
    submitOnboardingRequest: builder.mutation<OnboardingRequestResponse, OnboardingRequestPayload>({
      query: (body) => ({
        url: '/entity-onboard/request',
        method: 'POST',
        body,
      }),
    }),

    // Check onboarding status by mobile or email
    checkOnboardingStatus: builder.query<OnboardingStatusItem[], { mobile?: string; email?: string }>({
      query: ({ mobile, email }) => {
        if (mobile) return `/entity-onboard/status?mobile=${encodeURIComponent(mobile)}`;
        if (email) return `/entity-onboard/status?email=${encodeURIComponent(email)}`;
        return '/entity-onboard/status';
      },
    }),
  }),
});

export const {
  useBrowseEntitiesQuery,
  useSubmitOnboardingRequestMutation,
  useCheckOnboardingStatusQuery,
  useLazyCheckOnboardingStatusQuery,
} = onboardingApi;
