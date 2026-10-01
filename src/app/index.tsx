import { useAuth } from '@clerk/expo';
import { Redirect } from 'expo-router';

// Entry: route to sign-in or the app. Onboarding completion check lands in phase 1.
export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return null;
  return <Redirect href={isSignedIn ? '/home' : '/sign-in'} />;
}
