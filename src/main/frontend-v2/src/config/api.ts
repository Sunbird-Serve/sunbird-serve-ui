// Centralized API configuration
// Supports separate URLs per service (local) or same domain (production)

const NEED_BASE = import.meta.env.VITE_API_BASE_URL_NEED;
const FULFILL_BASE = import.meta.env.VITE_API_BASE_URL_FULFILL;
const VOLUNTEERING_BASE = import.meta.env.VITE_API_BASE_URL_VOLUNTEERING;

export const API = {
  // Serve Need microservice
  NEED: `${NEED_BASE}/api/v1/serve-need`,
  NEED_GET: `${NEED_BASE}/api/v1/serve-need/need`,
  NEED_RAISE: `${NEED_BASE}/api/v1/serve-need/need/raise`,
  NEED_BY_USER: `${NEED_BASE}/api/v1/serve-need/need/user`,
  NEED_BY_AGENCY: `${NEED_BASE}/api/v1/serve-need/need/agency`,
  NEED_BY_ENTITY: `${NEED_BASE}/api/v1/serve-need/need/entity`,
  NEEDTYPE: `${NEED_BASE}/api/v1/serve-need/needtype`,
  NEED_TYPE_CREATE: `${NEED_BASE}/api/v1/serve-need/need-type/create`,
  NEED_TYPE_UPDATE: `${NEED_BASE}/api/v1/serve-need/need-type/update`,
  NEED_REQUIREMENT: `${NEED_BASE}/api/v1/serve-need/need-requirement`,
  NEED_PLAN: `${NEED_BASE}/api/v1/serve-need/need-plan`,
  NEED_DELIVERABLE: `${NEED_BASE}/api/v1/serve-need/need-deliverable`,
  DELIVERABLE_INPUT: `${NEED_BASE}/api/v1/serve-need/deliverable-input`,
  DELIVERABLE_OUTPUT: `${NEED_BASE}/api/v1/serve-need/deliverable-output`,
  ENTITY: `${NEED_BASE}/api/v1/serve-need/entity`,
  ENTITY_ASSIGN: `${NEED_BASE}/api/v1/serve-need/entity/assign`,
  ENTITY_BY_AGENCY: `${NEED_BASE}/api/v1/serve-need/entity/agency`,
  ENTITY_DETAILS_BY_USER: `${NEED_BASE}/api/v1/serve-need/entityDetails`,
  ENTITY_NEEDS: `${NEED_BASE}/api/v1/serve-need/need/entities`,
  SKILL_DETAILS: `${NEED_BASE}/api/v1/serve-need/need-requirement/skilldetails`,

  // Serve Fulfill microservice
  FULFILL: `${FULFILL_BASE}/api/v1/serve-fulfill`,
  NOMINATION: `${FULFILL_BASE}/api/v1/serve-fulfill/nomination`,
  NOMINATION_CONFIRM: `${FULFILL_BASE}/api/v1/serve-fulfill/nomination/nominate`,
  FULFILLMENT: `${FULFILL_BASE}/api/v1/serve-fulfill/fulfillment`,

  // Serve Volunteering microservice
  VOLUNTEERING: `${VOLUNTEERING_BASE}/api/v1/serve-volunteering`,
  USER: `${VOLUNTEERING_BASE}/api/v1/serve-volunteering/user`,
  USER_PROFILE: `${VOLUNTEERING_BASE}/api/v1/serve-volunteering/user/user-profile`,
  VOLUNTEER_HOURS: `${VOLUNTEERING_BASE}/api/v1/serve-volunteering/volunteer-hours`,
  AGENCY_LIST: `${VOLUNTEERING_BASE}/api/v1/serve-volunteering/agency/list`,
} as const;

export type ApiEndpoint = keyof typeof API;

// Helper: get base URL for a given service path
export function getServiceBaseUrl(path: string): string {
  if (path.includes('serve-need')) return NEED_BASE;
  if (path.includes('serve-fulfill')) return FULFILL_BASE;
  if (path.includes('serve-volunteering')) return VOLUNTEERING_BASE;
  return NEED_BASE; // default
}
