// Unified auth hook — currently delegates to Keycloak
// This file provides backward-compatible interface for components that use useAuth()

import { useKeycloakAuth } from '../context/KeycloakAuthContext';

export function useAuth() {
  const kc = useKeycloakAuth();

  return {
    // Backward-compatible with Firebase AuthContext interface
    firebaseUser: kc.authenticated
      ? { email: kc.user?.email || '', uid: kc.user?.username || '' }
      : null,
    loading: !kc.initialized,
    login: async (_email: string, _password: string) => {
      // Keycloak handles login via redirect, this is a no-op
      kc.login();
    },
    loginWithGoogle: async () => { kc.login(); },
    loginWithFacebook: async () => { kc.login(); },
    loginWithToken: async (_token: string) => { kc.login(); },
    logout: async () => { kc.logout(); },
    resetPassword: async (_email: string) => {
      // Keycloak handles password reset — redirect to account page
      window.open(`${import.meta.env.VITE_KEYCLOAK_URL}/realms/${import.meta.env.VITE_KEYCLOAK_REALM}/account`, '_blank');
    },

    // New Keycloak-specific properties
    initialized: kc.initialized,
    authenticated: kc.authenticated,
    user: kc.user,
    roles: kc.roles,
    agencyId: kc.agencyId,
    agencyType: kc.agencyType,
    token: kc.token,
    getToken: kc.getToken,
    keycloakLogin: kc.login,
  };
}
