//const baseDomain = "https://serve-v1.evean.net"; //https://ekal.evean.net
// const baseDomain = "https://serve-v1.evean.net";
const baseDomainNeed = "https://serve-v1.evean.net";
const baseDomainFulfill = "https://serve-v1.evean.net";
const baseDomainVolunteering = "https://serve-v1.evean.net";

const configData = {
  USER_GET: `${baseDomainVolunteering}/api/v1/serve-volunteering/user`,
  USER_PROFILE: `${baseDomainVolunteering}/api/v1/serve-volunteering/user/user-profile`,
  USER_PROFILE_BY_ID: `${baseDomainVolunteering}/api/v1/serve-volunteering/user/user-profile/userId`,
  NEED_GET: `${baseDomainNeed}/api/v1/serve-need/need`,
  SERVE_FULFILL: `${baseDomainFulfill}/api/v1/serve-fulfill`,
  SERVE_NEED: `${baseDomainNeed}/api/v1/serve-need`,
  SERVE_VOLUNTEERING: `${baseDomainVolunteering}/api/v1/serve-volunteering`,
  VOLUNTEER_HOURS: `${baseDomainVolunteering}/api/v1/serve-volunteering/volunteer-hours`,
  NEED_SEARCH: `${baseDomainFulfill}/api/v1/serve-fulfill/nomination`,
  NEED_FULFILL: `${baseDomainFulfill}/api/v1/serve-fulfill/nomination`,
  NEEDTYPE_GET: `${baseDomainNeed}/api/v1/serve-need/needtype`,
  DELIVERABLE: `${baseDomainNeed}/api/v1/serve-need/deliverable-details`,
  ENTITY_GET: `${baseDomainNeed}/api/v1/serve-need/entity`,
  NEED_POST: `${baseDomainNeed}/api/v1/serve-need/need/raise`,
  NEED_BY_TYPE: `${baseDomainNeed}/api/v1/need/serve-need/need-type/create`,
  NOMINATED_USER_FETCH: `${baseDomainVolunteering}/api/v1/serve-volunteering/user`,
  NEED_BY_USER: `${baseDomainNeed}/api/v1/serve-need/need/user`,
  NOMINATION_CONFIRM: `${baseDomainFulfill}/api/v1/serve-fulfill/nomination/nominate`,
  NEED_REQUIREMENT_GET: `${baseDomainNeed}/api/v1/serve-need/need-requirement`,
  NOMINATIONS_GET: `${baseDomainFulfill}/api/v1/serve-fulfill/nomination`,
  NEEDPLAN_GET: `${baseDomainNeed}/api/v1/serve-need/need-plan`,
  NEEDPLAN_DELIVERABLES: `${baseDomainNeed}/api/v1/serve-need/need-deliverable`,
  SKILL_DETAILS: `${baseDomainNeed}/api/v1/serve-need/need-requirement/skilldetails`,
  ENTITY_DETAILS_GET: `${baseDomainNeed}/api/v1/serve-need/entityDetails`,
  ENTITY_NEEDS: `${baseDomainNeed}/api/v1/serve-need/need/entities`,
  ENTITY_NEED_GET: `${baseDomainNeed}/api/v1/serve-need/needs`,
  REGISTRATION_DOMAIN: `${baseDomainVolunteering}`,
  UPDATE_USER: `${baseDomainVolunteering}/api/v1/serve-volunteering/user/agencyId/update`,
  AGENCYID: "1-74f81200-dc16-4c65-bf7a-a3ab75952432",
};

module.exports = configData;
