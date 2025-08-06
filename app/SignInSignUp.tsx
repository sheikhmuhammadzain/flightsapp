import React from 'react';
import { View, StyleSheet } from 'react-native';
// import { useAuth } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import { Text } from 'react-native';

export default function SignInSignUpScreen() {
//   const { isSignedIn } = useAuth();

//   React.useEffect(() => {
//     if (!isSignedIn) {
//     //   Linking.openURL('https://accounts.clerk.dev/sign-in'); // Replace with your Clerk sign-in URL
//     }
//   }, [isSignedIn]);

//   if (!isSignedIn) {
//     return null;
//   }

  return (
    <View style={styles.container}>
      <Text style={{ color: '#fff', fontSize: 22, marginBottom: 20 }}>You are signed in!</Text>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
  },
});
