'use client';

import { QueryClient, QueryClientProvider as TanStackQueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

type QueryClientProviderProps = {
  children: React.ReactNode;
};

export function QueryClientProvider({ children }: QueryClientProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return <TanStackQueryClientProvider client={queryClient}>{children}</TanStackQueryClientProvider>;
}
