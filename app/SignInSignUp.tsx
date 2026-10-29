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
      {/* Background illustration placeholder */}
      <View>
        {/* You can replace this with an SVG or image for mountains/plane */}
      </View>
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>Flights</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{isSigningIn ? 'Sign In' : 'Sign Up'}</Text>
        <Text style={styles.cardSubtitle}>{isSigningIn ? 'Access your account to search flights' : 'Create an account to get started'}</Text>
        <View style={styles.divider} />
        {!isSigningIn && (
          <Text style={styles.passwordHint}>
            Password must be 8+ characters, unique, and not found in data breaches
          </Text>
        )}
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.inputModern}
            placeholder="Email"
            placeholderTextColor="#bbb"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <TextInput
            style={styles.inputModern}
            placeholder="Password"
            placeholderTextColor="#bbb"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />
        </View>
        <TouchableOpacity
          style={[styles.buttonModern, loading && styles.buttonDisabled]}
          onPress={isSigningIn ? handleSignIn : handleSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonModernText}>
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
    backgroundColor: '#181A20',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  headerBox: {
    width: '100%',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
    marginTop:50
  },
  card: {
    backgroundColor: '#23242a',
    borderRadius: 22,
    padding: 32,
    width: '92%',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  divider: {
    width: '100%',
    height: 1.5,
    backgroundColor: '#222',
    marginVertical: 14,
    borderRadius: 2,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 10,
  },
  inputModern: {
    backgroundColor: '#181A20',
    color: '#fff',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#444',
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonModern: {
    backgroundColor: '#6ea8fe',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 18,
    width: '100%',
    shadowColor: '#6ea8fe',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonModernText: {
    color: '#222',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 15,
    color: '#bbb',
    marginBottom: 18,
    textAlign: 'center',
  },
  passwordHint: {
    fontSize: 12,
    color: '#ffe6cc',
    textAlign: 'center',
    marginBottom: 18,
    paddingHorizontal: 10,
  },
  input: {
    backgroundColor: '#23242a',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  button: {
    backgroundColor:"#404040",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 18,
    padding:30
  },
  buttonDisabled: {
    backgroundColor: '#3a4a6b',
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
    color: '#6ea8fe',
    fontSize: 15,
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  successText: {
    color: '#fff',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
});
