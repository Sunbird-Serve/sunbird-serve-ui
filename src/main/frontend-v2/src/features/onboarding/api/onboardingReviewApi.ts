import { baseApi } from '@app/baseApi';
import type { OnboardingRequestResponse } from './onboardingApi';

interface PaginatedOnboardingRequests {
  content: OnboardingRequestResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

interface ListOnboardingParams {
  status?: string;
  page?: number;
  size?: number;
}

interface ReviewPayload {
  requestId: string;
  action: 'Authorise' | 'Clarification' | 'Reject';
  notes?: string;
  userId?: string; // Required for Authorise
}

// Authenticated API endpoints for nAdmin onboarding review
export const onboardingReviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // List onboarding requests (paginated, filterable by status)
    listOnboardingRequests: builder.query<PaginatedOnboardingRequests, ListOnboardingParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.status) searchParams.set('status', params.status);
        if (params.page !== undefined) searchParams.set('page', String(params.page));
        if (params.size !== undefined) searchParams.set('size', String(params.size));
        return `/api/v1/serve-need/entity-onboard/requests?${searchParams.toString()}`;
      },
      providesTags: ['OnboardingRequest'],
    }),

    // Get single request detail
    getOnboardingRequest: builder.query<OnboardingRequestResponse, string>({
      query: (requestId) => `/api/v1/serve-need/entity-onboard/requests/${requestId}`,
      providesTags: (_result, _err, id) => [{ type: 'OnboardingRequest', id }],
    }),

    // Review (Authorise / Clarification / Reject)
    reviewOnboardingRequest: builder.mutation<OnboardingRequestResponse, ReviewPayload>({
      query: ({ requestId, ...body }) => ({
        url: `/api/v1/serve-need/entity-onboard/requests/${requestId}/review`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['OnboardingRequest'],
    }),
  }),
});

export const {
  useListOnboardingRequestsQuery,
  useGetOnboardingRequestQuery,
  useReviewOnboardingRequestMutation,
} = onboardingReviewApi;
