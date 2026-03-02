import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from './theme-provider';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider defaultTheme="dark">
      <BrowserRouter>
        {children}
        <Toaster richColors position="bottom-right" />
      </BrowserRouter>
    </ThemeProvider>
  );
}
