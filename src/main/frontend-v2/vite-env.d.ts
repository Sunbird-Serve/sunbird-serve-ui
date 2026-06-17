/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL_NEED: string;
  readonly VITE_API_BASE_URL_FULFILL: string;
  readonly VITE_API_BASE_URL_VOLUNTEERING: string;
  readonly VITE_KEYCLOAK_URL: string;
  readonly VITE_KEYCLOAK_REALM: string;
  readonly VITE_KEYCLOAK_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
