const baseDomain = "https://serve-v1.evean.net"; //https://ekal.evean.net

const configData = {
    "USER_GET" : `${baseDomain}/api/v1/user`,
    "NEED_GET": `${baseDomain}/api/v1/need`,
    "NEED_SEARCH": `${baseDomain}/api/v1/need`,
    "NEEDTYPE_GET": `${baseDomain}/api/v1/needtype`,
    "ENTITY_GET": `${baseDomain}/api/v1/entity`,
    "NEED_POST" : `${baseDomain}/api/v1/need/`,
    "NEED_BY_TYPE" : `${baseDomain}/api/v1/need/need-type`,
    "NOMINATED_USER_FETCH" : `${baseDomain}/api/v1/user`,
    "NEED_BY_USER" : `${baseDomain}/api/v1/need/user`,
    "NOMINATION_CONFIRM" : `${baseDomain}/api/v1/need/{needId}/nominate`,
    "NEED_REQUIREMENT_GET": `${baseDomain}/api/v1/need-requirement`,
    "NOMINATIONS_GET": `${baseDomain}/api/v1/need/nomination`,
    "NEEDPLAN_GET": `${baseDomain}/api/v1/need-plan`,
    "NEEDPLAN_DELIVERABLES": `${baseDomain}/api/v1/need-deliverable`
}

module.exports = configData;
