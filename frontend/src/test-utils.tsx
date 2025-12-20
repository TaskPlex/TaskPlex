import React from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ProfilesProvider } from './contexts/ProfilesContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { DownloadNotificationProvider } from './contexts/DownloadNotificationContext';

export const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ProfilesProvider>
        <FavoritesProvider>
          <DownloadNotificationProvider>
            <BrowserRouter>
              {ui}
            </BrowserRouter>
          </DownloadNotificationProvider>
        </FavoritesProvider>
      </ProfilesProvider>
    </QueryClientProvider>
  );
};



