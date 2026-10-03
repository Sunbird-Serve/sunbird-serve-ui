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

// Base volunteer statuses available to all admins/coordinators.
export const VOLUNTEER_STATUS_OPTIONS = ['Registered', 'Recommended', 'OnHold', 'Active'];

// Roles permitted to mark a volunteer Inactive.
const INACTIVE_CAPABLE_ROLES = ['sAdmin', 'vAdmin', 'vCoordinator'];

// Status options for a given role. "Inactive" is only offered to roles
// permitted to deactivate a volunteer.
export function statusOptionsForRole(role?: string): string[] {
  if (role && INACTIVE_CAPABLE_ROLES.includes(role)) {
    return [...VOLUNTEER_STATUS_OPTIONS, 'Inactive'];
  }
  return VOLUNTEER_STATUS_OPTIONS;
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

    // Update user status.
    // Backend PUT /user/{id} validates the FULL user object (identityDetails,
    // contactDetails and role are required). Sending only { status } returns a
    // 400 "Role/Contact/Identity details are required". So we send the existing
    // user with the status replaced.
    updateVolunteerStatus: builder.mutation<unknown, { user: VolunteerUser; status: string }>({
      query: ({ user, status }) => ({
        url: `/api/v1/serve-volunteering/user/${user.osid}`,
        method: 'PUT',
        body: {
          identityDetails: user.identityDetails,
          contactDetails: user.contactDetails,
          role: user.role,
          agencyId: user.agencyId,
          status,
        },
      }),
      invalidatesTags: ['User'],
    }),

    // Assign agency to volunteer.
    // Backend maps userId as a PATH parameter: PUT .../user/agencyId/update/{userId}
    // with body { agencyId, send }. Omitting the path segment causes Spring to
    // return "No static resource user/agencyId/update".
    assignAgency: builder.mutation<unknown, { userId: string; agencyId: string }>({
      query: ({ userId, agencyId }) => ({
        url: `/api/v1/serve-volunteering/user/agencyId/update/${userId}`,
        method: 'PUT',
        body: { agencyId, send: true },
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
