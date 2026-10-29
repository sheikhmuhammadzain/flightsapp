import { useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';

export default function IndexPage() {
  const { isSignedIn, isLoaded } = useAuth();

  console.log('IndexPage - isLoaded:', isLoaded, 'isSignedIn:', isSignedIn);

  // Wait for auth to load
  if (!isLoaded) {
    return null;
  }

  // Redirect based on auth status
  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/SignInSignUp" />;
  }
}
