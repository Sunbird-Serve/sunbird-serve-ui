import { baseApi } from '@app/baseApi';

export interface VolunteerUser {
  osid: string;
  identityDetails: { fullname?: string; name?: string; gender?: string; dob?: string };
  contactDetails?: { email?: string; mobile?: string; address?: { city?: string; state?: string } };
  role: string[];
  status?: string;
  agencyId?: string;
}

export interface Agency {
  osid: string;
  name: string;
  status?: string;
}

export const volunteersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all users
    getAllVolunteers: builder.query<VolunteerUser[], void>({
      query: () => '/api/v1/serve-volunteering/user/all-users',
      providesTags: ['User'],
    }),

    // Get agencies
    getAgencies: builder.query<Agency[], void>({
      query: () => '/api/v1/serve-volunteering/agency/list',
      providesTags: ['Agency'],
    }),

    // Update user status
    updateVolunteerStatus: builder.mutation<unknown, { userId: string; status: string }>({
      query: ({ userId, status }) => ({
        url: `/api/v1/serve-volunteering/user/${userId}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['User'],
    }),

    // Assign agency to volunteer
    assignAgency: builder.mutation<unknown, { userId: string; agencyId: string }>({
      query: ({ userId, agencyId }) => ({
        url: '/api/v1/serve-volunteering/user/agencyId/update',
        method: 'PUT',
        body: { userId, agencyId },
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetAllVolunteersQuery,
  useGetAgenciesQuery,
  useUpdateVolunteerStatusMutation,
  useAssignAgencyMutation,
} = volunteersApi;
