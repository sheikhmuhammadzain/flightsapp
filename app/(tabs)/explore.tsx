import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ExploreScreen() {
  const { isSignedIn } = useAuth();

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

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore</ThemedText>
      </ThemedView>
      <ThemedText>Discover new destinations and flight deals.</ThemedText>
      <ThemedText>Coming soon: Popular destinations, travel guides, and special offers!</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
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
});
