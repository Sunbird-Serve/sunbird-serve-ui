import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import keycloak from '@config/keycloak';

interface KeycloakUser {
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

interface KeycloakAuthContextType {
  initialized: boolean;
  authenticated: boolean;
  user: KeycloakUser | null;
  roles: string[];
  agencyId: string;
  agencyType: string;
  token: string | null;
  login: () => void;
  logout: () => void;
  getToken: () => Promise<string | null>;
}

const KeycloakAuthContext = createContext<KeycloakAuthContextType | undefined>(undefined);

interface KeycloakAuthProviderProps {
  children: ReactNode;
}

export function KeycloakAuthProvider({ children }: KeycloakAuthProviderProps) {
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<KeycloakUser | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [agencyId, setAgencyId] = useState('');
  const [agencyType, setAgencyType] = useState('');
  const [token, setToken] = useState<string | null>(null);

  // Parse token claims
  const parseTokenClaims = useCallback(() => {
    if (keycloak.tokenParsed) {
      const claims = keycloak.tokenParsed as Record<string, unknown>;

      setUser({
        email: (claims.email as string) || (claims.preferred_username as string) || '',
        username: (claims.preferred_username as string) || '',
        firstName: (claims.given_name as string) || '',
        lastName: (claims.family_name as string) || '',
      });

      // Roles from token — could be in realm_access.roles or directly in claims
      const tokenRoles = (claims.roles as string[]) ||
        (claims.realm_access as { roles?: string[] })?.roles || [];
      setRoles(tokenRoles);

      // Agency info from custom claims
      setAgencyId((claims.agencyId as string) || '');
      setAgencyType((claims.agencyType as string) || '');

      setToken(keycloak.token || null);
    }
  }, []);

  // Initialize Keycloak
  useEffect(() => {
    keycloak
      .init({
        onLoad: 'check-sso',
        checkLoginIframe: false,
      })
      .then((auth) => {
        setAuthenticated(auth);
        if (auth) {
          parseTokenClaims();
        }
        setInitialized(true);
      })
      .catch((err) => {
        console.error('Keycloak init failed:', err);
        setInitialized(true);
      });

    // Token refresh
    keycloak.onTokenExpired = () => {
      keycloak
        .updateToken(60)
        .then((refreshed) => {
          if (refreshed) {
            setToken(keycloak.token || null);
          }
        })
        .catch(() => {
          console.warn('Token refresh failed, logging out');
          keycloak.logout();
        });
    };

    // Auth state change
    keycloak.onAuthSuccess = () => {
      setAuthenticated(true);
      parseTokenClaims();
    };

    keycloak.onAuthLogout = () => {
      setAuthenticated(false);
      setUser(null);
      setRoles([]);
      setAgencyId('');
      setAgencyType('');
      setToken(null);
    };
  }, [parseTokenClaims]);

  const login = useCallback(() => {
    keycloak.login();
  }, []);

  const logout = useCallback(() => {
    keycloak.logout({ redirectUri: window.location.origin });
  }, []);

  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      await keycloak.updateToken(30); // Refresh if less than 30s remaining
      return keycloak.token || null;
    } catch {
      keycloak.login();
      return null;
    }
  }, []);

  return (
    <KeycloakAuthContext.Provider
      value={{
        initialized,
        authenticated,
        user,
        roles,
        agencyId,
        agencyType,
        token,
        login,
        logout,
        getToken,
      }}
    >
      {children}
    </KeycloakAuthContext.Provider>
  );
}

export function useKeycloakAuth(): KeycloakAuthContextType {
  const context = useContext(KeycloakAuthContext);
  if (context === undefined) {
    throw new Error('useKeycloakAuth must be used within a KeycloakAuthProvider');
  }
  return context;
}
