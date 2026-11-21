import { baseApi } from '@app/baseApi';

export interface AvailableNeed {
  id: string;
  name: string;
  description?: string;
  needPurpose?: string;
  entityId?: string;
  needTypeId?: string;
  status: string;
  userId?: string;
  entity?: { id: string; name: string; district?: string };
  needType?: { id: string; name: string };
  occurrence?: { startDate?: string; endDate?: string; days?: string; timeSlots?: { day: string; startTime: string; endTime: string }[] };
  requirement?: { skillDetails?: string; schedule?: { days?: string; timeSlots?: { day: string; startTime: string; endTime: string }[] } };
  timeSlots?: { day: string; startTime: string; endTime: string }[];
  // Nested format support
  need?: { id: string; name: string; status: string; entityId?: string };
}

export interface VolunteerNomination {
  id: string;
  needId: string;
  nominatedUserId: string;
  nominationStatus: string;
  createdAt?: string;
  updatedAt?: string;
  reason?: string;
}

export interface VolunteerProfile {
  osid?: string; // the profile record's own id
  skills?: { skillName: string; skillLevel: string }[];
  genericDetails?: {
    qualification?: string;
    affiliation?: string;
    yearsOfExperience?: string;
    employmentStatus?: string;
  };
  userPreference?: {
    timePreferred?: string[];
    dayPreferred?: string[];
    interestArea?: string[];
    language?: string[];
  };
  userId?: string;
  agencyId?: string;
  // Kept as returned by the server and sent back unchanged on update
  onboardDetails?: unknown;
  consentDetails?: unknown;
  referenceChannelId?: string;
  volunteeringHours?: unknown;
}

export const exploreApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get available needs for volunteers (Approved status)
    // GET /api/v1/serve-need/need/?status=Approved&page=0&size=100
    getAvailableNeeds: builder.query<AvailableNeed[], void>({
      query: () => '/api/v1/serve-need/need/?status=Approved&page=0&size=100',
      transformResponse: (response: { content?: AvailableNeed[] } | AvailableNeed[]) => {
        if (Array.isArray(response)) return response;
        return response.content || [];
      },
      providesTags: ['Need'],
    }),

    // Self-nominate for a need
    // POST /api/v1/serve-fulfill/nomination/{needId}/nominate/{userId}
    selfNominate: builder.mutation<unknown, { needId: string; userId: string }>({
      query: ({ needId, userId }) => ({
        url: `/api/v1/serve-fulfill/nomination/${needId}/nominate/${userId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Nomination'],
    }),

    // Get volunteer's nominations
    // GET /api/v1/serve-fulfill/nomination/{userId}?page=0&size=50
    getMyNominations: builder.query<VolunteerNomination[], string>({
      query: (userId) => `/api/v1/serve-fulfill/nomination/${userId}?page=0&size=50`,
      transformResponse: (response: VolunteerNomination[] | { content?: VolunteerNomination[] }) => {
        if (Array.isArray(response)) return response;
        return response.content || [];
      },
      providesTags: ['Nomination'],
    }),

    // Get volunteer profile
    // GET /api/v1/serve-volunteering/user/user-profile/userId/{userId}
    // Looks the profile up by the volunteer's user id. (The plain /user-profile/{id} form
    // expects the profile record's own id and answers 404 for a user id.)
    getVolunteerProfile: builder.query<VolunteerProfile, string>({
      query: (userId) => `/api/v1/serve-volunteering/user/user-profile/userId/${userId}`,
      providesTags: ['Profile'],
    }),

    // Update volunteer profile
    // PUT /api/v1/serve-volunteering/user/user-profile/{profileId}
    // profileId is the profile record's own id (osid), not the user id.
    updateVolunteerProfile: builder.mutation<unknown, { profileId: string; body: Partial<VolunteerProfile> }>({
      query: ({ profileId, body }) => ({
        url: `/api/v1/serve-volunteering/user/user-profile/${profileId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),

    // Create a volunteer profile (for volunteers who do not have one yet)
    // POST /api/v1/serve-volunteering/user/user-profile
    createVolunteerProfile: builder.mutation<unknown, Partial<VolunteerProfile>>({
      query: (body) => ({
        url: '/api/v1/serve-volunteering/user/user-profile',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),

    // Update the volunteer's own personal and contact details.
    // PUT /api/v1/serve-volunteering/user/{osid}
    // The backend validates the FULL user (identityDetails, contactDetails, role), so send all of it.
    updateVolunteerUser: builder.mutation<unknown, { osid: string; body: Record<string, unknown> }>({
      query: ({ osid, body }) => ({
        url: `/api/v1/serve-volunteering/user/${osid}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetAvailableNeedsQuery,
  useSelfNominateMutation,
  useGetMyNominationsQuery,
  useGetVolunteerProfileQuery,
  useUpdateVolunteerProfileMutation,
  useCreateVolunteerProfileMutation,
  useUpdateVolunteerUserMutation,
} = exploreApi;
