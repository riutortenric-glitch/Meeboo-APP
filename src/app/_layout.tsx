import '@/global.css';
import { Sentry } from '@/lib/sentry';

import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { queryClient } from '@/lib/query-client';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY — copy .env.example to .env.local');
}

function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey!} tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }} />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default Sentry.wrap(RootLayout);
