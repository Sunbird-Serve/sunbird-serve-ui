import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { store } from './store';
import { theme } from '@theme/index';
import { KeycloakAuthProvider } from '@features/auth';

interface AppProvidersProps {
  children: ReactNode;
}

// Compose all providers: Theme → Store → Keycloak Auth
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Provider store={store}>
        <KeycloakAuthProvider>{children}</KeycloakAuthProvider>
      </Provider>
    </ThemeProvider>
  );
}
