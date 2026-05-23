import { baseApi } from '@app/baseApi';

interface NeedItem {
  id: string;
  name?: string;
  status: string;
  entityId?: string;
  needTypeId?: string;
  userId?: string;
  need?: { userId?: string };
  startDate?: string;
  endDate?: string;
  createdAt?: string;
}

interface PaginatedNeeds {
  content: NeedItem[];
  totalElements: number;
  totalPages: number;
}

interface UserItem {
  osid: string;
  identityDetails: { fullname?: string; name?: string };
  contactDetails?: { email?: string; mobile?: string; address?: { city?: string } };
  role: string[];
  status?: string;
  agencyId?: string;
}

interface EntityItem {
  id: string;
  name: string;
  status?: string;
}

interface AgencyItem {
  osid: string;
  name: string;
  status?: string;
}

// Existing API patterns from the old frontend:
// NEED_GET = /api/v1/serve-need/need
// Coordinator needs: GET /api/v1/serve-need/need/user/{userId}?page=0&size=1000&status={status}
// Admin needs: GET /api/v1/serve-need/needs/{userId}?page=0&size=1000
// All needs by status: GET /api/v1/serve-need/need/?page=0&size=1000&status={status}
// Entity needs: POST /api/v1/serve-need/need/entities  body: { entityIds: [...] }
// Entities by user: GET /api/v1/serve-need/entityDetails/{userId}?page=0&size=1000
// All entities: GET /api/v1/serve-need/entity/all?page=0&size=1000
// All users: GET /api/v1/serve-volunteering/user/all-users
// Agencies: GET /api/v1/serve-volunteering/agency/list

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch needs by status (used in general needs listing)
    // GET /api/v1/serve-need/need/?page=0&size=1000&status={status}
    getNeedsByStatus: builder.query<NeedItem[], string>({
      query: (status) => `/api/v1/serve-need/need/?page=0&size=1000&status=${status}`,
      transformResponse: (response: PaginatedNeeds) => response.content || [],
      providesTags: ['Need'],
    }),

    // Fetch all needs for a user — nAdmin view
    // GET /api/v1/serve-need/needs/{userId}?page=0&size=1000
    getNeedsByUserId: builder.query<NeedItem[], string>({
      query: (userId) => `/api/v1/serve-need/needs/${userId}?page=0&size=1000`,
      transformResponse: (response: PaginatedNeeds) => response.content || [],
      providesTags: ['Need'],
    }),

    // Fetch needs by entity IDs — nAdmin filtered view
    // POST /api/v1/serve-need/need/entities  body: { entityIds: [...] }
    getNeedsByEntities: builder.mutation<NeedItem[], string[]>({
      query: (entityIds) => ({
        url: '/api/v1/serve-need/need/entities',
        method: 'POST',
        body: { entityIds },
      }),
      transformResponse: (response: PaginatedNeeds) => response.content || [],
    }),

    // Fetch all users
    // GET /api/v1/serve-volunteering/user/all-users
    getAllUsers: builder.query<UserItem[], void>({
      query: () => '/api/v1/serve-volunteering/user/all-users',
      providesTags: ['User'],
    }),

    // Fetch entities for a user (nAdmin)
    // GET /api/v1/serve-need/entityDetails/{userId}?page=0&size=1000
    getEntitiesByUser: builder.query<EntityItem[], string>({
      query: (userId) => `/api/v1/serve-need/entityDetails/${userId}?page=0&size=1000`,
      transformResponse: (response: { content?: EntityItem[] }) =>
        response.content?.filter((e) => e.status !== 'Inactive') || [],
      providesTags: ['Entity'],
    }),

    // Fetch all entities (sAdmin)
    // GET /api/v1/serve-need/entity/all?page=0&size=1000
    getAllEntities: builder.query<EntityItem[], void>({
      query: () => '/api/v1/serve-need/entity/all?page=0&size=1000',
      transformResponse: (response: { content?: EntityItem[] }) =>
        response.content?.filter((e) => e.status !== 'Inactive') || [],
      providesTags: ['Entity'],
    }),

    // Fetch all agencies
    // GET /api/v1/serve-volunteering/agency/list
    getAgencies: builder.query<AgencyItem[], void>({
      query: () => '/api/v1/serve-volunteering/agency/list',
      providesTags: ['Agency'],
    }),

    // Fetch needs by coordinator (own needs) — requires status param
    // Makes parallel calls for each status, same as existing app
    // GET /api/v1/serve-need/need/user/{userId}?page=0&size=1000&status={status}
    getNeedsByCoordinator: builder.query<NeedItem[], string>({
      async queryFn(userId, _queryApi, _extraOptions, fetchWithBQ) {
        const statuses = ['New', 'Nominated', 'Approved', 'Rejected', 'Assigned', 'Fulfilled'];
        try {
          const results = await Promise.all(
            statuses.map((status) =>
              fetchWithBQ(
                `/api/v1/serve-need/need/user/${userId}?page=0&size=1000&status=${status}`,
              ),
            ),
          );

          const allNeeds: NeedItem[] = [];
          for (const result of results) {
            if (result.error) continue; // Skip failed status queries
            const data = result.data as PaginatedNeeds;
            if (data?.content) {
              allNeeds.push(...data.content);
            }
          }
          return { data: allNeeds };
        } catch (error) {
          return { error: { status: 500, data: 'Failed to fetch coordinator needs' } };
        }
      },
      providesTags: ['Need'],
    }),
  }),
});

export const {
  useGetNeedsByStatusQuery,
  useGetNeedsByUserIdQuery,
  useGetNeedsByEntitiesMutation,
  useGetAllUsersQuery,
  useGetEntitiesByUserQuery,
  useGetAllEntitiesQuery,
  useGetAgenciesQuery,
  useGetNeedsByCoordinatorQuery,
} = dashboardApi;

export type { NeedItem, UserItem, EntityItem, AgencyItem };
