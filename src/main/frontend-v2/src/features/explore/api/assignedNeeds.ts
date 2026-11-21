import { getAuthHeaders } from '@shared/utils/authHeaders';
import { apiUrl } from '@shared/utils/apiUrls';

const PAGE_SIZE = 100;

export interface TimeSlot {
  day?: string;
  startTime?: string;
  endTime?: string;
}

export interface InputParameter {
  inputUrl?: string;
  softwarePlatform?: string;
  // New records use timeSlots[]; startTime/endTime are legacy/backfilled.
  timeSlots?: TimeSlot[];
  startTime?: string;
  endTime?: string;
}

export interface Deliverable {
  id: string;
  needPlanId?: string;
  deliverableDate: string;
  status: string;
  comments?: string;
  numberOfAttendees?: number;
  inputParameters?: InputParameter;
}

export interface CoordinatorInfo {
  name: string;
  phone: string;
  email: string;
}

export interface AssignedNeed {
  needName: string;
  needId: string;
  planId: string;
  entityName: string;
  startDate: string;
  endDate: string;
  days: string;
  deliverables: Deliverable[];
  inputParams: InputParameter[];
  coordinator: CoordinatorInfo;
}

// Resolve display start/end time from either the new timeSlots[] shape
// or the legacy top-level fields.
export function resolveTimes(p?: InputParameter | null): { startTime?: string; endTime?: string } {
  if (!p) return {};
  if (p.timeSlots?.length) {
    const slot = p.timeSlots[0];
    return { startTime: slot.startTime, endTime: slot.endTime };
  }
  return { startTime: p.startTime, endTime: p.endTime };
}

// School/College name of a need. Uses the embedded entity when present,
// otherwise looks the entity up by id.
export async function resolveEntityName(
  need: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  headers: Record<string, string> = getAuthHeaders(),
): Promise<string> {
  const embedded = need?.entity?.name || need?.entityName || '';
  if (embedded) return embedded;
  const entityId = need?.entityId || need?.entity?.id || need?.need?.entityId || '';
  if (!entityId) return '';
  const data = await getJson(apiUrl(`/api/v1/serve-need/entity/${entityId}`), headers);
  const entity = Array.isArray(data) ? data[0] : data;
  return entity?.name || '';
}

export function minutesOf(time?: string): number | null {
  const m = time?.match(/(\d{2}):(\d{2})/);
  return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : null;
}

// Length of a session in hours; falls back to 1 hour when times are missing.
export function durationHours(p?: InputParameter | null): number {
  const { startTime, endTime } = resolveTimes(p);
  const s = minutesOf(startTime);
  const e = minutesOf(endTime);
  if (s == null || e == null || e <= s) return 1;
  return (e - s) / 60;
}
async function getJson(url: string, headers: Record<string, string>): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    const resp = await fetch(url, { headers });
    return resp.ok ? await resp.json() : null;
  } catch {
    return null;
  }
}

interface Fulfillment {
  needId: string;
  needPlanId: string;
  coordUserId?: string;
}

// Returns null for plans that should not be shown (inactive / backfilled).
// Throws when the sessions of a plan cannot be loaded.
async function loadOne(fulf: Fulfillment, headers: Record<string, string>): Promise<AssignedNeed | null> {
  // Plan, need and coordinator are independent, so fetch them together.
  const [planData, needData, coordData] = await Promise.all([
    getJson(apiUrl(`/api/v1/serve-need/need-plan/${fulf.needId}`), headers),
    getJson(apiUrl(`/api/v1/serve-need/need/${fulf.needId}`), headers),
    fulf.coordUserId
      ? getJson(apiUrl(`/api/v1/serve-volunteering/user/${fulf.coordUserId}`), headers)
      : Promise.resolve(null),
  ]);

  let needName = '';
  let planId = fulf.needPlanId;
  let planStatus = '';
  let startDate = '';
  let endDate = '';
  let days = '';
  if (planData) {
    const plans = Array.isArray(planData) ? planData : planData.content || [];
    if (plans.length > 0) {
      const match =
        plans.find((p: any) => p?.plan?.id === fulf.needPlanId || p?.id === fulf.needPlanId) || plans[0]; // eslint-disable-line @typescript-eslint/no-explicit-any
      needName = match?.plan?.name || '';
      planId = match?.plan?.id || fulf.needPlanId;
      planStatus = match?.plan?.status || match?.status || '';
      startDate = match?.occurrence?.startDate?.substring(0, 10) || '';
      endDate = match?.occurrence?.endDate?.substring(0, 10) || '';
      days = match?.occurrence?.days || '';
    }
  }

  // Skip inactive plans (backfilled / dropped)
  if (planStatus === 'Inactive') return null;

  let entityName = '';
  if (needData) {
    const need = Array.isArray(needData) ? needData[0] : needData;
    entityName = need?.entity?.name || '';
    if (!needName) needName = need?.name || need?.need?.name || '';
    if (!entityName) {
      const entityId = need?.entityId || need?.entity?.id || '';
      if (entityId) {
        const entityData = await getJson(apiUrl(`/api/v1/serve-need/entity/${entityId}`), headers);
        const entity = Array.isArray(entityData) ? entityData[0] : entityData;
        entityName = entity?.name || '';
      }
    }
  }

  const coordinator: CoordinatorInfo = {
    name: coordData?.identityDetails?.fullname || '',
    phone: coordData?.contactDetails?.mobile || '',
    email: coordData?.contactDetails?.email || '',
  };

  const delivData = await getJson(apiUrl(`/api/v1/serve-need/need-deliverable/${planId}`), headers);
  if (!delivData) throw new Error('Could not load sessions');

  return {
    needName: needName || 'Session',
    needId: fulf.needId,
    planId,
    entityName,
    startDate,
    endDate,
    days,
    deliverables: delivData.needDeliverable || [],
    inputParams: delivData.inputParameters || [],
    coordinator,
  };
}

// Load every assignment of a volunteer. Assignments load in parallel.
// Throws when nothing could be loaded; individual stale plans are skipped.
export async function loadAssignedNeeds(userId: string): Promise<AssignedNeed[]> {
  const headers = getAuthHeaders();
  const fulfResp = await fetch(
    apiUrl(`/api/v1/serve-fulfill/fulfillment/volunteer-read/${userId}?page=0&size=${PAGE_SIZE}`),
    { headers },
  );
  if (!fulfResp.ok) throw new Error('Could not load assignments');
  const fulfData = await fulfResp.json();
  const fulfs: Fulfillment[] = Array.isArray(fulfData) ? fulfData : fulfData.content || [];

  const results = await Promise.allSettled(fulfs.map((f) => loadOne(f, headers)));
  if (fulfs.length > 0 && results.every((r) => r.status === 'rejected')) {
    throw new Error('Could not load sessions');
  }
  return results
    .filter((r): r is PromiseFulfilledResult<AssignedNeed | null> => r.status === 'fulfilled')
    .map((r) => r.value)
    .filter((n): n is AssignedNeed => n !== null);
}
