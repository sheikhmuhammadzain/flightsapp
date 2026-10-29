import { useAuth, useSignIn, useSignUp } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignInSignUpScreen() {
  const { isSignedIn } = useAuth();
  const { signIn, setActive } = useSignIn();
  const { signUp, setActive: setActiveSignUp } = useSignUp();
  
  const [isSigningIn, setIsSigningIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  console.log('SignInSignUp - isSignedIn:', isSignedIn);

  React.useEffect(() => {
    if (isSignedIn) {
      router.push('/(tabs)');
    }
  }, [isSignedIn]);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const completeSignIn = await signIn!.create({
        identifier: email,
        password,
      });

      if (completeSignIn.status === 'complete') {
        await setActive!({ session: completeSignIn.createdSessionId });
        router.push('/(tabs)');
      }
    } catch (err: any) {
      console.error('Clerk sign-in error:', err);
      let errorMsg = 'Sign in failed';
      if (err && err.errors) {
        errorMsg = err.errors.map((e: any) => e.message).join('\n');
      } else if (err && err.message) {
        errorMsg = err.message;
      }
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Basic validation
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Check for common weak passwords
    const weakPasswords = ['password', '12345678', 'qwerty123', 'admin123', 'test1234'];
    if (weakPasswords.some(weak => password.toLowerCase().includes(weak.toLowerCase()))) {
      Alert.alert('Error', 'This password is too common. Please use a unique password with letters, numbers, and symbols.');
      return;
    }

    setLoading(true);
    try {
      const completeSignUp = await signUp!.create({
        emailAddress: email,
        password,
      });

      if (completeSignUp.status === 'complete') {
        await setActiveSignUp!({ session: completeSignUp.createdSessionId });
        router.push('/(tabs)');
      } else {
        // Handle email verification if needed
        console.log('Sign-up status:', completeSignUp.status);
        Alert.alert('Success', 'Please check your email to verify your account');
      }
    } catch (err: any) {
      console.error('Clerk sign-up error:', err);
      let errorMsg = 'Sign up failed';
      if (err && err.errors) {
        errorMsg = err.errors.map((e: any) => e.message).join('\n');
      } else if (err && err.message) {
        errorMsg = err.message;
      }
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (isSignedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.successText}>You are signed in!</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>My Flight App</Text>
        <Text style={styles.subtitle}>
          {isSigningIn ? 'Sign in to your account' : 'Create a new account'}
        </Text>

        {!isSigningIn && (
          <Text style={styles.passwordHint}>
            Password must be 8+ characters, unique, and not found in data breaches
          </Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={isSigningIn ? handleSignIn : handleSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Loading...' : (isSigningIn ? 'Sign In' : 'Sign Up')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => {
            setIsSigningIn(!isSigningIn);
            setEmail('');
            setPassword('');
          }}
        >
          <Text style={styles.switchButtonText}>
            {isSigningIn ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0066CC',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#E6F2FF',
    textAlign: 'center',
    marginBottom: 40,
  },
  passwordHint: {
    fontSize: 12,
    color: '#FFE6CC',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#FF9B7A',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchButtonText: {
    color: '#E6F2FF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  successText: {
    color: '#fff',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
});
