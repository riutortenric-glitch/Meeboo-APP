import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enabled: !!process.env.EXPO_PUBLIC_SENTRY_DSN,
  sendDefaultPii: false, // health data app — never attach PII by default
  tracesSampleRate: __DEV__ ? 1.0 : 0.2,
});

export { Sentry };
