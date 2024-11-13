
export const createImpressionEvent = (pageId, type, subtype, duration, additionalData = {}) => {
    return {
        eid: "IMPRESSION",
        ets: Date.now(),
        ver: "3.0", // Telemetry version, adjust as needed
        mid: "IMPRESSION:" + Date.now(),
        context: {
            channel: "your_channel_id", // Define your channel
            pdata: {
                id: "appId", // Your app ID
                ver: "1.0",  // Your app version
                pid: "app"   // Component where the event originated
            },
            env: pageId, // Environment (such as the page or module name)
        },
        object: {
            id: pageId,  // Page or content ID that was viewed
            type: type,  // Type of the object, e.g., 'page' or 'module'
            subtype: subtype // Additional subtype information, like 'list' or 'detail'
        },
        edata: {
            type: type,          // Main type of the impression
            subtype: subtype,    // Subtype for further classification
            pageId: pageId      // Page ID where the impression happened
        }
    };
};
