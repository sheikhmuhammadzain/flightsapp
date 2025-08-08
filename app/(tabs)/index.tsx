import { useAuth, useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FlightSearchHome from '../../components/FlightSearchHome';

export default function HomeScreen() {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();

  React.useEffect(() => {
    if (!isSignedIn) {
      router.replace('/SignInSignUp');
    }
  }, [isSignedIn]);

  if (!isSignedIn) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/SignInSignUp');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <FlightSearchHome />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0066CC',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
  },
 
  welcomeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  signOutButton: {
    backgroundColor: '#23242A',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  signOutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
