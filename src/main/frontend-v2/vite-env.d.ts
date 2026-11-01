/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL_NEED: string;
  readonly VITE_API_BASE_URL_FULFILL: string;
  readonly VITE_API_BASE_URL_VOLUNTEERING: string;
  readonly VITE_KEYCLOAK_URL: string;
  readonly VITE_KEYCLOAK_REALM: string;
  readonly VITE_KEYCLOAK_CLIENT_ID: string;
  readonly VITE_ADOPTER?: string;
  readonly VITE_VOLUNTEER_WEB_ENABLED?: string;
  readonly VITE_VOLUNTEER_WHATSAPP_ENABLED?: string;
  readonly VITE_VOLUNTEER_AGENT_WEB_URL?: string;
  readonly VITE_VOLUNTEER_AGENT_WHATSAPP_URL?: string;
  readonly VITE_SAMUDAYA_INTEREST_ENDPOINT?: string;
  readonly VITE_SAMUDAYA_CONTACT_EMAIL?: string;
  readonly VITE_SAMUDAYA_PRIVACY_URL?: string;
  readonly VITE_SAMUDAYA_TERMS_URL?: string;
  readonly VITE_SUNBIRD_SERVE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
