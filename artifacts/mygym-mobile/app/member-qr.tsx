import React from 'react';
import { Feather } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { MemberProfile, formatMemberApiError } from '@/lib/member-api';
import { useMemberApi } from '@/lib/useMemberApi';

export default function MemberQrScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const api = useMemberApi();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const profileQuery = useQuery({
    queryKey: ['member', 'me'],
    queryFn: () => api<MemberProfile>('/member/me'),
  });
  const profile = profileQuery.data;
  const todayLabel = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Africa/Nairobi',
  }).format(new Date());

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topInset + 10, paddingBottom: bottomInset + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close member pass"
          onPress={close}
          hitSlop={10}
          style={({ pressed }) => [styles.closeButton, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.65 : 1 }]}
        >
          <Feather name="x" size={18} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.topLabel, { color: colors.mutedForeground }]}>MYGYM MEMBER PASS</Text>
        <View style={styles.topSpacer} />
      </View>

      <View style={styles.intro}>
        <Text style={[styles.eyebrow, { color: colors.accentForeground }]}>AT THE CLUB</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Your member pass</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Show this personal QR code to reception for a staff-recorded check-in.
        </Text>
      </View>

      {profile ? (
        <View style={[styles.passPanel, { backgroundColor: colors.forestDeep }]}>
          <View style={styles.memberRow}>
            <View style={[styles.clubMark, { backgroundColor: colors.forestOverlay }]}>
              <Feather name="hexagon" size={17} color={colors.forestMid} />
            </View>
            <View style={styles.memberIdentity}>
              <Text style={[styles.memberName, { color: colors.forestText }]}>{profile.fullName}</Text>
              <Text style={[styles.memberPlan, { color: colors.forestCaption }]}>
                {profile.membership?.planName?.toUpperCase() ?? 'MYGYM MEMBER'} · {profile.memberNumber}
              </Text>
            </View>
          </View>

          <View style={[styles.qrTile, { backgroundColor: colors.card }]} accessibilityRole="image" accessibilityLabel="Your secure MyGym member QR code">
            <QRCode
              value={profile.qrToken}
              size={194}
              color={colors.forestDeep}
              backgroundColor={colors.card}
              quietZone={8}
            />
          </View>
          <Text style={[styles.scanText, { color: colors.forestText }]}>Scan at the front desk</Text>
          <Text style={[styles.demoLabel, { color: colors.forestCaption }]}>PERSONAL MEMBER CREDENTIAL</Text>
          <View style={[styles.passRule, { backgroundColor: colors.forestLine }]} />
          <View style={styles.validityRow}>
            <View>
              <Text style={[styles.metaLabel, { color: colors.forestCaption }]}>MEMBERSHIP</Text>
              <Text style={[styles.metaValue, { color: colors.forestText }]}>
                {profile.membership?.status ?? 'Not on file'}
              </Text>
            </View>
            <View style={styles.activeThrough}>
              <Text style={[styles.activeThroughText, { color: colors.forestText }]}>
                {profile.membership
                  ? `THROUGH ${new Intl.DateTimeFormat('en-GB', {
                      timeZone: 'Africa/Nairobi',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    }).format(new Date(`${profile.membership.expiresOn}T12:00:00+03:00`)).toUpperCase()}`
                  : 'SEE RECEPTION'}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={[styles.passPanel, { backgroundColor: colors.forestDeep }]}>
          <Text style={[styles.memberName, { color: colors.forestText }]}>
            {profileQuery.error ? 'Pass unavailable' : 'Loading your member pass…'}
          </Text>
          {profileQuery.error ? (
            <Text style={[styles.demoLabel, { color: colors.forestCaption }]}>
              {formatMemberApiError(profileQuery.error)}
            </Text>
          ) : null}
        </View>
      )}

      <View style={[styles.disclosure, { backgroundColor: colors.warm }]}>
        <Feather name="info" size={14} color={colors.gold} />
        <Text style={[styles.disclosureText, { color: colors.foreground }]}>
          {todayLabel}. Reception scans this code and records the visit in your gym account; this screen does not check you in by itself.
        </Text>
      </View>
      {profile ? (
        <View style={styles.visitNote}>
          <Feather name="calendar" size={13} color={colors.primary} />
          <Text style={[styles.localNote, { color: colors.mutedForeground }]}>
            {profile.checkInsThisMonth} check-ins recorded this month.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 22 },
  topBar: { height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 },
  closeButton: { width: 36, height: 36, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  topLabel: { fontSize: 8, fontWeight: '700', letterSpacing: 1.15 },
  topSpacer: { width: 36 },
  intro: { marginBottom: 17 },
  eyebrow: { fontSize: 9, letterSpacing: 1.4, fontWeight: '700', marginBottom: 6 },
  title: { fontSize: 25, letterSpacing: -0.7, fontWeight: '700' },
  subtitle: { fontSize: 11, lineHeight: 16, marginTop: 5 },
  passPanel: { borderRadius: 24, padding: 18, alignItems: 'center' },
  memberRow: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 10 },
  clubMark: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  memberIdentity: { flex: 1 },
  memberName: { fontSize: 14, fontWeight: '700' },
  memberPlan: { fontSize: 7, letterSpacing: 0.8, fontWeight: '700', marginTop: 4 },
  qrTile: { width: 218, height: 218, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 17 },
  scanText: { fontSize: 11, fontWeight: '700', marginTop: 11 },
  demoLabel: { fontSize: 7, fontWeight: '700', letterSpacing: 0.9, marginTop: 5, textAlign: 'center' },
  passRule: { width: '100%', height: 1, marginTop: 15, marginBottom: 13 },
  validityRow: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metaLabel: { fontSize: 7, fontWeight: '700', letterSpacing: 0.85 },
  metaValue: { fontSize: 10, fontWeight: '700', marginTop: 4, textTransform: 'capitalize' },
  activeThrough: { maxWidth: '60%', backgroundColor: 'transparent', borderWidth: 1, borderColor: '#46645B', borderRadius: 9, paddingHorizontal: 8, paddingVertical: 7 },
  activeThroughText: { fontSize: 7, fontWeight: '700', letterSpacing: 0.45, textAlign: 'center' },
  disclosure: { borderRadius: 14, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 15 },
  disclosureText: { flex: 1, fontSize: 9, lineHeight: 14 },
  visitNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 13 },
  localNote: { fontSize: 9 },
});
