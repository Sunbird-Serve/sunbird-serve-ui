import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { store } from './store';
import { theme } from '@theme/index';
import { AuthProvider } from '@features/auth';

interface AppProvidersProps {
  children: ReactNode;
}

// Compose all providers in one place
// Order matters: Theme → Store → Auth
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Provider store={store}>
        <AuthProvider>{children}</AuthProvider>
      </Provider>
    </ThemeProvider>
  );
}
