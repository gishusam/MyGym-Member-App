import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { MemberAuthScreen } from '@/components/MemberAuthScreen';
import { MemberApiError, MemberProfile, memberRequest } from '@/lib/member-api';
import { useQuery } from '@tanstack/react-query';
import { useColors } from '@/hooks/useColors';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();
const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

function SignedInNavigation() {
  return (
    <Stack screenOptions={{ headerBackTitle: 'Back' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="member-qr"
        options={{ headerShown: false, presentation: 'card' }}
      />
    </Stack>
  );
}

function MemberAppGate() {
  const colors = useColors();
  const { isLoaded, isSignedIn, getToken, signOut } = useAuth();
  const profileQuery = useQuery({
    queryKey: ['member', 'me'],
    queryFn: () => memberRequest<MemberProfile>(getToken, '/member/me'),
    enabled: isLoaded && Boolean(isSignedIn),
    retry: false,
    staleTime: 60_000,
  });

  if (!isLoaded) {
    return <CenteredMessage label="Loading your member account…" />;
  }
  if (!isSignedIn) {
    return <MemberAuthScreen />;
  }
  if (profileQuery.isPending) {
    return <CenteredMessage label="Connecting to MyGym…" />;
  }
  if (profileQuery.error || !profileQuery.data) {
    const error = profileQuery.error;
    const needsMemberLink =
      error instanceof MemberApiError &&
      ['member_account_unlinked', 'member_access_unavailable', 'member_inactive'].includes(error.code ?? '');
    return (
      <View style={[styles.errorScreen, { backgroundColor: colors.background }]}>
        <View style={[styles.errorIcon, { backgroundColor: colors.warm }]}>
          <Text style={{ color: colors.gold, fontSize: 20 }}>!</Text>
        </View>
        <Text style={[styles.errorTitle, { color: colors.foreground }]}>
          {needsMemberLink ? 'Membership link needed' : 'Could not connect to MyGym'}
        </Text>
        <Text style={[styles.errorCopy, { color: colors.mutedForeground }]}>
          {error instanceof Error ? error.message : 'Check your connection and try again.'}
        </Text>
        {needsMemberLink ? (
          <Text style={[styles.errorCopy, { color: colors.mutedForeground }]}>
            Ask reception to confirm the email address on your member record, then sign in again.
          </Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            if (needsMemberLink) void signOut();
            else void profileQuery.refetch();
          }}
          style={({ pressed }) => [
            styles.errorButton,
            { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={[styles.errorButtonText, { color: colors.primaryForeground }]}>
            {needsMemberLink ? 'Sign out' : 'Try again'}
          </Text>
        </Pressable>
      </View>
    );
  }
  return <SignedInNavigation />;
}

function CenteredMessage({ label }: { label: string }) {
  const colors = useColors();
  return (
    <View style={[styles.loadingScreen, { backgroundColor: colors.background }]}>
      <ActivityIndicator color={colors.primary} />
      <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function AppProviders() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <MemberAppGate />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  if (!clerkPublishableKey) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingScreen}>
          <Text style={styles.configTitle}>Finish member app setup</Text>
          <Text style={styles.configText}>
            Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY and EXPO_PUBLIC_API_BASE_URL to the app environment, then restart Expo.
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <AppProviders />
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 12, backgroundColor: '#F7F8F5' },
  loadingText: { fontSize: 12, textAlign: 'center' },
  errorScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  errorIcon: { width: 48, height: 48, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  errorTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  errorCopy: { fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 9, maxWidth: 340 },
  errorButton: { minWidth: 120, minHeight: 43, borderRadius: 13, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, marginTop: 20 },
  errorButtonText: { fontSize: 12, fontWeight: '700' },
  configTitle: { fontSize: 22, color: '#1D2B26', fontWeight: '700', textAlign: 'center' },
  configText: { fontSize: 12, lineHeight: 18, color: '#5C6861', textAlign: 'center', maxWidth: 330, marginTop: 8 },
});
