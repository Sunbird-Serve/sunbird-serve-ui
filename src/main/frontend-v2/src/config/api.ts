// Centralized API configuration
// All microservice base paths derived from a single env variable

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const API = {
  // Serve Need microservice
  NEED: `${BASE_URL}/api/v1/serve-need`,
  NEED_GET: `${BASE_URL}/api/v1/serve-need/need`,
  NEED_RAISE: `${BASE_URL}/api/v1/serve-need/need/raise`,
  NEED_BY_USER: `${BASE_URL}/api/v1/serve-need/need/user`,
  NEED_BY_AGENCY: `${BASE_URL}/api/v1/serve-need/need/agency`,
  NEED_BY_ENTITY: `${BASE_URL}/api/v1/serve-need/need/entity`,
  NEEDTYPE: `${BASE_URL}/api/v1/serve-need/needtype`,
  NEED_TYPE_CREATE: `${BASE_URL}/api/v1/serve-need/need-type/create`,
  NEED_TYPE_UPDATE: `${BASE_URL}/api/v1/serve-need/need-type/update`,
  NEED_REQUIREMENT: `${BASE_URL}/api/v1/serve-need/need-requirement`,
  NEED_PLAN: `${BASE_URL}/api/v1/serve-need/need-plan`,
  NEED_DELIVERABLE: `${BASE_URL}/api/v1/serve-need/need-deliverable`,
  DELIVERABLE_INPUT: `${BASE_URL}/api/v1/serve-need/deliverable-input`,
  DELIVERABLE_OUTPUT: `${BASE_URL}/api/v1/serve-need/deliverable-output`,
  ENTITY: `${BASE_URL}/api/v1/serve-need/entity`,
  ENTITY_ASSIGN: `${BASE_URL}/api/v1/serve-need/entity/assign`,
  ENTITY_BY_AGENCY: `${BASE_URL}/api/v1/serve-need/entity/agency`,
  ENTITY_DETAILS_BY_USER: `${BASE_URL}/api/v1/serve-need/entityDetails`,
  ENTITY_NEEDS: `${BASE_URL}/api/v1/serve-need/need/entities`,
  SKILL_DETAILS: `${BASE_URL}/api/v1/serve-need/need-requirement/skilldetails`,

  // Serve Fulfill microservice
  FULFILL: `${BASE_URL}/api/v1/serve-fulfill`,
  NOMINATION: `${BASE_URL}/api/v1/serve-fulfill/nomination`,
  NOMINATION_CONFIRM: `${BASE_URL}/api/v1/serve-fulfill/nomination/nominate`,
  FULFILLMENT: `${BASE_URL}/api/v1/serve-fulfill/fulfillment`,

  // Serve Volunteering microservice
  VOLUNTEERING: `${BASE_URL}/api/v1/serve-volunteering`,
  USER: `${BASE_URL}/api/v1/serve-volunteering/user`,
  USER_PROFILE: `${BASE_URL}/api/v1/serve-volunteering/user/user-profile`,
  VOLUNTEER_HOURS: `${BASE_URL}/api/v1/serve-volunteering/volunteer-hours`,
  AGENCY_LIST: `${BASE_URL}/api/v1/serve-volunteering/agency/list`,
} as const;

export type ApiEndpoint = keyof typeof API;
