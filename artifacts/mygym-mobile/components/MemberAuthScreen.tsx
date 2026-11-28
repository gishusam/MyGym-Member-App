import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { useSignIn, useSignUp } from '@clerk/expo';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';

function clerkMessage(error: unknown): string {
  const firstError = (error as { errors?: { longMessage?: string; message?: string }[] })?.errors?.[0];
  if (firstError?.longMessage || firstError?.message) {
    return firstError.longMessage ?? firstError.message ?? '';
  }
  return error instanceof Error ? error.message : 'Unable to complete sign-in. Try again.';
}

export function MemberAuthScreen() {
  const colors = useColors();
  const signInState = useSignIn();
  const signUpState = useSignUp();
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationPending, setVerificationPending] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async () => {
    setBusy(true);
    setMessage('');
    try {
      if (mode === 'signIn') {
        const { error } = await signInState.signIn.password({
          identifier: email.trim(),
          password,
        });
        if (error) throw error;
        if (signInState.signIn.status === 'complete') {
          const finalized = await signInState.signIn.finalize();
          if (finalized.error) throw finalized.error;
        } else {
          setMessage('This account needs another verification step. Contact the gym for help signing in.');
        }
      } else if (!verificationPending) {
        const { error } = await signUpState.signUp.password({
          emailAddress: email.trim(),
          password,
        });
        if (error) throw error;
        if (signUpState.signUp.status === 'complete') {
          const finalized = await signUpState.signUp.finalize();
          if (finalized.error) throw finalized.error;
          return;
        }
        const sendResult = await signUpState.signUp.verifications.sendEmailCode();
        if (sendResult.error) throw sendResult.error;
        setVerificationPending(true);
        setMessage('Enter the verification code sent to your email.');
      } else {
        const { error } = await signUpState.signUp.verifications.verifyEmailCode({
          code: verificationCode.trim(),
        });
        if (error) throw error;
        if (signUpState.signUp.status === 'complete') {
          const finalized = await signUpState.signUp.finalize();
          if (finalized.error) throw finalized.error;
        } else {
          setMessage('Email verification is not complete yet. Check the code and try again.');
        }
      }
    } catch (error) {
      setMessage(clerkMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const changeMode = (nextMode: 'signIn' | 'signUp') => {
    setMode(nextMode);
    setVerificationPending(false);
    setVerificationCode('');
    setMessage('');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.brandMark, { backgroundColor: colors.forestDeep }]}>
          <Feather name="hexagon" size={24} color={colors.lime} />
        </View>
        <Text style={[styles.eyebrow, { color: colors.accentForeground }]}>MYGYM FITNESS KE</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {verificationPending ? 'Check your email' : 'Your club, in your pocket.'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {verificationPending
            ? `We sent a sign-up code to ${email.trim()}.`
            : 'Sign in with the email linked to your MyGym membership.'}
        </Text>

        {!verificationPending && (
          <>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>EMAIL</Text>
            <TextInput
              accessibilityLabel="Email address"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]}
            />
            <Text style={[styles.label, { color: colors.mutedForeground }]}>PASSWORD</Text>
            <TextInput
              accessibilityLabel="Password"
              autoCapitalize="none"
              autoComplete={mode === 'signUp' ? 'new-password' : 'password'}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="At least 8 characters"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]}
            />
          </>
        )}

        {verificationPending && (
          <>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>EMAIL CODE</Text>
            <TextInput
              accessibilityLabel="Email verification code"
              autoCapitalize="none"
              keyboardType="number-pad"
              value={verificationCode}
              onChangeText={setVerificationCode}
              placeholder="Enter code"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]}
            />
          </>
        )}

        {message ? (
          <Text accessibilityRole="alert" style={[styles.message, { color: colors.destructive }]}>
            {message}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={() => void submit()}
          style={({ pressed }) => [
            styles.submitButton,
            { backgroundColor: colors.primary, opacity: busy ? 0.65 : pressed ? 0.82 : 1 },
          ]}
        >
          {busy
            ? <ActivityIndicator color={colors.primaryForeground} />
            : <Text style={[styles.submitText, { color: colors.primaryForeground }]}>
                {verificationPending ? 'Verify email' : mode === 'signIn' ? 'Sign in' : 'Create account'}
              </Text>}
        </Pressable>

        {!verificationPending && (
          <Pressable
            accessibilityRole="button"
            onPress={() => changeMode(mode === 'signIn' ? 'signUp' : 'signIn')}
            style={({ pressed }) => [styles.modeSwitch, { opacity: pressed ? 0.65 : 1 }]}
          >
            <Text style={[styles.modeText, { color: colors.primary }]}>
              {mode === 'signIn' ? 'New to the member app? Create an account' : 'Already have an account? Sign in'}
            </Text>
          </Pressable>
        )}

        <View style={[styles.note, { backgroundColor: colors.warm }]}>
          <Feather name="info" size={14} color={colors.gold} />
          <Text style={[styles.noteText, { color: colors.foreground }]}>
            Your account is matched to a member record using a verified email. If it is not linked yet, ask MyGym reception to update your membership email.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 26, paddingVertical: 40 },
  brandMark: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 23 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 9 },
  title: { fontSize: 30, fontWeight: '700', letterSpacing: -0.9, maxWidth: 330 },
  subtitle: { fontSize: 13, lineHeight: 19, marginTop: 9, marginBottom: 25 },
  label: { fontSize: 9, fontWeight: '700', letterSpacing: 1, marginBottom: 7, marginTop: 13 },
  input: { minHeight: 49, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, fontSize: 14 },
  message: { fontSize: 11, lineHeight: 16, marginTop: 12 },
  submitButton: { minHeight: 51, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  submitText: { fontSize: 13, fontWeight: '700' },
  modeSwitch: { alignSelf: 'center', padding: 15, marginTop: 3 },
  modeText: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  note: { flexDirection: 'row', gap: 9, alignItems: 'flex-start', borderRadius: 14, padding: 13, marginTop: 19 },
  noteText: { flex: 1, fontSize: 10, lineHeight: 15 },
});
