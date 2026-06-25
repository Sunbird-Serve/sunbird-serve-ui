import { baseApi } from '@app/baseApi';

// Types matching new backend response
export interface NeedRequest {
  needTypeId: string;
  name: string;
  needPurpose: string;
  description: string;
  status: string;
  userId: string;
  entityId: string;
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface Occurrence {
  startDate: string;
  endDate: string;
  days: string;
  frequency: string;
  timeSlots: TimeSlot[];
}

export interface NeedRequirementRequest {
  skillDetails: string;
  volunteersRequired: string;
  occurrence: Occurrence;
  priority: string;
}

export interface RaiseNeedPayload {
  needRequest: NeedRequest;
  needRequirementRequest: NeedRequirementRequest;
}

// New backend response shape — requirement is embedded in need
export interface NeedResponse {
  id: string;
  agencyId?: string;
  needTypeId?: string;
  name: string;
  description?: string;
  needPurpose?: string;
  entityId?: string;
  userId: string;
  requirementId?: string;
  status: string;
  requirement?: {
    volunteersRequired?: string;
    priority?: string;
    skillDetails?: string;
    schedule?: {
      startDate?: string;
      endDate?: string;
      frequency?: string;
      days?: string;
      timeSlots?: TimeSlot[];
    };
  };
  createdAt?: string;
  updatedAt?: string;
}

// Full details response from /need/{id}/details
export interface NeedDetailsResponse {
  need: NeedResponse;
  needRequirement?: { skillDetails?: string; volunteersRequired?: string; priority?: string };
  occurrence?: { startDate: string; endDate: string; days?: string; frequency?: string; timeSlots?: TimeSlot[] };
  timeSlots?: TimeSlot[];
  entity?: { id: string; name: string; district?: string };
  needType?: { id: string; name: string };
}

// Unified item shape used in the UI (supports both old and new response formats)
export interface NeedListItem {
  need: {
    id: string;
    name: string;
    needPurpose?: string;
    description?: string;
    status: string;
    userId: string;
    entityId?: string;
    needTypeId?: string;
  };
  needType?: { id: string; name: string };
  entity?: { id: string; name: string; district?: string };
  occurrence?: { startDate: string; endDate: string; days?: string; frequency?: string; timeSlots?: TimeSlot[] };
  needRequirement?: { skillDetails?: string; volunteersRequired?: string; priority?: string };
  timeSlots?: TimeSlot[];
}

export interface NeedTypeItem {
  id: string;
  name: string;
  description?: string;
  taskType?: string;
}

export interface EntityItem {
  id: string;
  name: string;
  status?: string;
  district?: string;
}

export interface NominationItem {
  id: string;
  needId: string;
  nominatedUserId: string;
  nominationStatus: string;
  reason?: string;
  createdAt?: string;
  updatedAt?: string;
  userInfo?: {
    osid: string;
    identityDetails: { fullname?: string };
    contactDetails?: { email?: string; mobile?: string; address?: { city?: string } };
    status?: string;
  };
}

// Normalize API response — handles both old nested format and new flat format
function normalizeNeedItem(item: Record<string, unknown>): NeedListItem | null {
  if (!item) return null;

  // Already in nested format: { need: { id, name, status, ... }, entity: {...}, ... }
  if (item.need && typeof item.need === 'object') {
    return item as unknown as NeedListItem;
  }

  // New flat format from backend: { id, name, status, requirement: {...}, ... }
  if (item.id) {
    const requirement = item.requirement as Record<string, unknown> | undefined;
    const schedule = requirement?.schedule as Record<string, unknown> | undefined;

    return {
      need: {
        id: (item.id as string) || '',
        name: (item.name as string) || '',
        status: (item.status as string) || '',
        userId: (item.userId as string) || '',
        entityId: (item.entityId as string) || '',
        needTypeId: (item.needTypeId as string) || '',
        needPurpose: (item.needPurpose as string) || '',
        description: (item.description as string) || '',
      },
      needType: item.needType as NeedListItem['needType'],
      entity: item.entity as NeedListItem['entity'],
      occurrence: schedule
        ? {
            startDate: (schedule.startDate as string) || '',
            endDate: (schedule.endDate as string) || '',
            days: (schedule.days as string) || '',
            frequency: (schedule.frequency as string) || '',
            timeSlots: (schedule.timeSlots as TimeSlot[]) || [],
          }
        : (item.occurrence as NeedListItem['occurrence']),
      needRequirement: requirement
        ? {
            skillDetails: (requirement.skillDetails as string) || '',
            volunteersRequired: (requirement.volunteersRequired as string) || '',
            priority: (requirement.priority as string) || '',
          }
        : (item.needRequirement as NeedListItem['needRequirement']),
      timeSlots: (schedule?.timeSlots as TimeSlot[]) || (item.timeSlots as TimeSlot[]),
    };
  }

  return null;
}

function extractContent(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'content' in data) {
    const content = (data as { content?: unknown[] }).content;
    return Array.isArray(content) ? (content as Record<string, unknown>[]) : [];
  }
  return [];
}

export const needsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch all needs by status (parallel calls)
    // GET /api/v1/serve-need/need/?status={status}&page=0&size=200
    // X-Agency-Id header auto-injected by baseApi
    getAllNeedsByStatus: builder.query<NeedListItem[], void>({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        const statuses = ['New', 'Nominated', 'Approved', 'Rejected', 'Assigned', 'Fulfilled'];
        try {
          const results = await Promise.allSettled(
            statuses.map((status) =>
              fetchWithBQ(`/api/v1/serve-need/need/?status=${status}&page=0&size=200`),
            ),
          );
          const allNeeds: NeedListItem[] = [];
          for (const result of results) {
            if (result.status === 'rejected') continue;
            const fetchResult = result.value;
            if ('error' in fetchResult) continue;
            const content = extractContent(fetchResult.data);
            for (const item of content) {
              const normalized = normalizeNeedItem(item);
              if (normalized) allNeeds.push(normalized);
            }
          }
          return { data: allNeeds };
        } catch {
          return { error: { status: 500, data: 'Failed to fetch needs' } };
        }
      },
      providesTags: ['Need'],
    }),

    // Fetch need with full details
    // GET /api/v1/serve-need/need/{needId}/details
    getNeedDetails: builder.query<NeedListItem, string>({
      query: (needId) => `/api/v1/serve-need/need/${needId}/details`,
      transformResponse: (response: NeedDetailsResponse | Record<string, unknown>) => {
        // If it's already in the details format
        if ('need' in response && typeof response.need === 'object') {
          return response as unknown as NeedListItem;
        }
        // Try to normalize
        const normalized = normalizeNeedItem(response as Record<string, unknown>);
        return normalized || { need: { id: '', name: '', status: '', userId: '' } };
      },
      providesTags: ['Need'],
    }),

    // Fetch need types
    // GET /api/v1/serve-need/needtype/?page=0&size=1000&status=Approved
    getNeedTypes: builder.query<NeedTypeItem[], void>({
      query: () => '/api/v1/serve-need/needtype/?page=0&size=1000&status=Approved',
      transformResponse: (response: { content?: NeedTypeItem[] } | NeedTypeItem[]) => {
        if (Array.isArray(response)) return response;
        return response.content || [];
      },
      providesTags: ['NeedType'],
    }),

    // Fetch entities for coordinator (by agency — new endpoint)
    // GET /api/v1/serve-need/entity/agency/{agencyId}?page=0&size=100
    getEntitiesByAgency: builder.query<EntityItem[], string>({
      query: (agencyId) => `/api/v1/serve-need/entity/agency/${agencyId}?page=0&size=100`,
      transformResponse: (response: { content?: EntityItem[] } | EntityItem[]) => {
        if (Array.isArray(response)) return response.filter((e) => e.status !== 'Inactive');
        return response.content?.filter((e) => e.status !== 'Inactive') || [];
      },
      providesTags: ['Entity'],
    }),

    // Fetch entities for coordinator (legacy — by userId)
    // GET /api/v1/serve-need/entityDetails/{userId}?page=0&size=1000
    getCoordinatorEntities: builder.query<EntityItem[], string>({
      query: (userId) => `/api/v1/serve-need/entityDetails/${userId}?page=0&size=1000`,
      transformResponse: (response: { content?: EntityItem[] } | EntityItem[]) => {
        if (Array.isArray(response)) return response.filter((e) => e.status !== 'Inactive');
        return response.content?.filter((e) => e.status !== 'Inactive') || [];
      },
      providesTags: ['Entity'],
    }),

    // Raise a need
    // POST /api/v1/serve-need/need/raise
    raiseNeed: builder.mutation<NeedResponse, RaiseNeedPayload>({
      query: (body) => ({
        url: '/api/v1/serve-need/need/raise',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Need'],
    }),

    // Update need status (nAdmin approve/reject)
    // PUT /api/v1/serve-need/need/status/{needId}?status={status}
    updateNeedStatus: builder.mutation<unknown, { needId: string; status: string }>({
      query: ({ needId, status }) => ({
        url: `/api/v1/serve-need/need/status/${needId}?status=${status}`,
        method: 'PUT',
      }),
      invalidatesTags: ['Need'],
    }),

    // Update need details
    // PUT /api/v1/serve-need/need/update/{needId}
    updateNeed: builder.mutation<unknown, { needId: string; body: RaiseNeedPayload }>({
      query: ({ needId, body }) => ({
        url: `/api/v1/serve-need/need/update/${needId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Need'],
    }),

    // Get nominations for a need
    // GET /api/v1/serve-fulfill/nomination/{needId}/nominate
    getNominations: builder.query<NominationItem[], string>({
      query: (needId) => `/api/v1/serve-fulfill/nomination/${needId}/nominate`,
      providesTags: ['Nomination'],
    }),

    // Confirm/Reject/Backfill a nomination
    // POST /api/v1/serve-fulfill/nomination/nominate/{userId}/confirm/{nominationId}?status={status}&comments={reason}
    confirmNomination: builder.mutation<
      unknown,
      { needId: string; userId: string; nominationId: string; status: string; comments?: string }
    >({
      query: ({ userId, nominationId, status, comments }) => ({
        url: `/api/v1/serve-fulfill/nomination/nominate/${userId}/confirm/${nominationId}?status=${status}${comments ? `&comments=${encodeURIComponent(comments)}` : ''}`,
        method: 'POST',
      }),
      invalidatesTags: ['Nomination', 'Need'],
    }),

    // Fetch deliverables by need plan
    // GET /api/v1/serve-need/need-deliverable/{needPlanId}
    getDeliverables: builder.query<
      { needDeliverable: unknown[]; inputParameters: unknown[] },
      string
    >({
      query: (needPlanId) => `/api/v1/serve-need/need-deliverable/${needPlanId}`,
    }),

    // Update deliverable
    // PUT /api/v1/serve-need/need-deliverable/update/{deliverableId}
    updateDeliverable: builder.mutation<
      unknown,
      {
        deliverableId: string;
        body: {
          needPlanId: string;
          status: string;
          comments?: string;
          deliverableDate: string;
          outputParameters?: { numberOfAttendees?: number; submittedUrl?: string; remarks?: string };
        };
      }
    >({
      query: ({ deliverableId, body }) => ({
        url: `/api/v1/serve-need/need-deliverable/update/${deliverableId}`,
        method: 'PUT',
        body,
      }),
    }),

    // Create deliverable
    // POST /api/v1/serve-need/need-deliverable/create
    createDeliverable: builder.mutation<
      unknown,
      {
        needPlanId: string;
        status: string;
        comments?: string;
        deliverableDate: string;
        inputParameters?: { inputUrl?: string; softwarePlatform?: string; startTime?: string; endTime?: string };
      }
    >({
      query: (body) => ({
        url: '/api/v1/serve-need/need-deliverable/create',
        method: 'POST',
        body,
      }),
    }),

    // Fetch need plans by need
    // GET /api/v1/serve-need/need-plan/{needId}
    getNeedPlans: builder.query<unknown[], string>({
      query: (needId) => `/api/v1/serve-need/need-plan/${needId}`,
      providesTags: ['NeedPlan'],
    }),
  }),
});

export const {
  useGetAllNeedsByStatusQuery,
  useGetNeedDetailsQuery,
  useGetNeedTypesQuery,
  useGetEntitiesByAgencyQuery,
  useGetCoordinatorEntitiesQuery,
  useRaiseNeedMutation,
  useUpdateNeedStatusMutation,
  useUpdateNeedMutation,
  useGetNominationsQuery,
  useConfirmNominationMutation,
  useGetDeliverablesQuery,
  useUpdateDeliverableMutation,
  useCreateDeliverableMutation,
  useGetNeedPlansQuery,
} = needsApi;
