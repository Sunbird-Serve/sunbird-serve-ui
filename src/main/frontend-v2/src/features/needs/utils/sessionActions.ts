import { getAuthHeaders, getAuthHeadersWithJson } from '@shared/utils/authHeaders';

const BASE_URL = import.meta.env.VITE_API_BASE_URL_NEED;

// Roles allowed to call need-deliverable/create (add or reschedule a session).
export const SESSION_CREATE_ROLES = ['sAdmin', 'nAdmin', 'nCoordinator'];

export interface SessionParams {
  startTime?: string;
  endTime?: string;
  inputUrl?: string;
  softwarePlatform?: string;
  // Newer records keep the time inside timeSlots[]
  timeSlots?: { day?: string; startTime?: string; endTime?: string }[];
}

export interface SessionDeliverable {
  id: string;
  needPlanId?: string;
  deliverableDate: string;
  status: string;
  comments?: string;
  numberOfAttendees?: number;
  outputParameters?: { numberOfAttendees?: number };
  inputParameters?: SessionParams;
}

// Local calendar date as YYYY-MM-DD (avoids the UTC shift of toISOString).
export function todayLocalISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export async function fetchPlanDeliverables(
  planId: string,
): Promise<{ deliverables: SessionDeliverable[]; inputParams: SessionParams[] }> {
  const resp = await fetch(`${BASE_URL}/api/v1/serve-need/need-deliverable/${planId}`, {
    headers: getAuthHeaders(),
  });
  if (!resp.ok) throw new Error('Failed to load sessions.');
  const data = await resp.json();
  const deliverables = data.needDeliverable || data.content || [];
  return {
    deliverables: Array.isArray(deliverables) ? deliverables : [],
    inputParams: Array.isArray(data.inputParameters) ? data.inputParameters : [],
  };
}

// Time/link to reuse for a new session: the nearest upcoming Planned session that has
// details, otherwise the most recent session that has any.
export function pickDefaultParams(deliverables: SessionDeliverable[]): SessionParams | undefined {
  const hasParams = (d: SessionDeliverable) =>
    !!(d.inputParameters?.startTime || d.inputParameters?.inputUrl || d.inputParameters?.timeSlots?.length);
  const planned = deliverables
    .filter((d) => d.status === 'Planned' && hasParams(d))
    .sort((a, b) => (a.deliverableDate || '').localeCompare(b.deliverableDate || ''));
  if (planned.length > 0) return planned[0].inputParameters;
  const any = deliverables
    .filter(hasParams)
    .sort((a, b) => (b.deliverableDate || '').localeCompare(a.deliverableDate || ''));
  return any.length > 0 ? any[0].inputParameters : undefined;
}

async function createPlannedSession(
  needPlanId: string,
  date: string,
  comments: string,
  params?: SessionParams,
): Promise<void> {
  const resp = await fetch(`${BASE_URL}/api/v1/serve-need/need-deliverable/create`, {
    method: 'POST',
    headers: getAuthHeadersWithJson(),
    body: JSON.stringify({
      needPlanId,
      status: 'Planned',
      comments,
      deliverableDate: date,
      ...(params ? { inputParameters: params } : {}),
    }),
  });
  if (!resp.ok) throw new Error('create failed');
}

// Add a new Planned session on `date`, reusing the previous session's time and link.
export async function addSession(args: {
  needPlanId: string;
  date: string;
  params?: SessionParams;
}): Promise<void> {
  try {
    await createPlannedSession(args.needPlanId, args.date, 'Added by coordinator', args.params);
  } catch {
    throw new Error('Could not add the session. Please try again.');
  }
}

// Save a status update on a session. When `rescheduleTo` is set (Cancelled/Offline only),
// a new Planned session is also created on that date with the same time and link.
export async function saveSessionUpdate(args: {
  planId: string;
  deliverable: SessionDeliverable;
  status: string;
  comments: string;
  students: number;
  rescheduleTo?: string;
  params?: SessionParams;
}): Promise<void> {
  const { planId, deliverable, status, comments, students, rescheduleTo, params } = args;
  const originalDate = deliverable.deliverableDate?.split('T')[0] || '';

  const updateResp = await fetch(
    `${BASE_URL}/api/v1/serve-need/need-deliverable/update/${deliverable.id}`,
    {
      method: 'PUT',
      headers: getAuthHeadersWithJson(),
      body: JSON.stringify({
        needPlanId: planId,
        status,
        comments,
        deliverableDate: originalDate,
        outputParameters: { numberOfAttendees: students, submittedUrl: '', remarks: comments },
      }),
    },
  );
  if (!updateResp.ok) throw new Error('Failed to update session.');

  if (rescheduleTo) {
    try {
      await createPlannedSession(planId, rescheduleTo, `Rescheduled from ${originalDate}`, params);
    } catch {
      throw new Error(
        `The session was marked ${status}, but the new session on ${rescheduleTo} could not be created. Please use "Add Session".`,
      );
    }
  }
}
