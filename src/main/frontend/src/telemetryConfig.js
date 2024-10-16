// telemetryConfig.js
const telemetryConfig = {
    pdata: {
      id: 'sunbird-serve',     // Unique identifier for your app (replace with your app's ID)
      ver: 'Serve-Vriddhi',              // Version of your application
      pid: '' // Identifier for the portal or section using telemetry
    },
    env: 'development',         // Environment (set to 'development' if you're still testing)
    channel: 'serve-channel',  // The source/channel identifier
    uid: 'W4slzvBwoYUrwSNskSONppPF14k1',                   // Will be dynamically set based on the logged-in user
    sid: '',                   // Session ID, dynamically set later
    did: '46dcd262ae086e9f54544404acb1711e',                   // Device ID (optional, but useful if tracking devices)
    authtoken: '',           // Authentication token if needed (optional)
    batchsize: 1,            // Number of events to batch before sending to the server
    endpoint: '/api/v1/serve-need/telemetry/events',
    apislug:'',
    host: 'http://localhost:9000'  // The telemetry server endpoint URL
  };
  
  export default telemetryConfig;
  