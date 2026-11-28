import React from 'react';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@clerk/expo';
import { useQuery } from '@tanstack/react-query';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { formatMemberApiError, MemberProfile } from '@/lib/member-api';
import { useMemberApi } from '@/lib/useMemberApi';

function formatDate(value: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi',
    ...options,
  }).format(new Date(value));
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const api = useMemberApi();
  const { signOut } = useAuth();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const profileQuery = useQuery({
    queryKey: ['member', 'me'],
    queryFn: () => api<MemberProfile>('/member/me'),
  });
  const profile = profileQuery.data;
  const membership = profile?.membership;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topInset + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.eyebrow, { color: colors.accentForeground }]}>YOUR MEMBERSHIP</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>

      {profile ? (
        <>
          <View style={[styles.identityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>{initials(profile.fullName)}</Text>
              <View style={[styles.avatarDot, { backgroundColor: colors.forestMid, borderColor: colors.card }]} />
            </View>
            <View style={styles.identityCopy}>
              <Text style={[styles.name, { color: colors.foreground }]}>{profile.fullName}</Text>
              <Text style={[styles.memberSince, { color: colors.mutedForeground }]}>
                Member since {formatDate(profile.registeredAt, { month: 'long', year: 'numeric' })}
              </Text>
            </View>
            <View style={[styles.activePill, { backgroundColor: colors.accent }]}>
              <Text style={[styles.activeText, { color: colors.primary }]}>{profile.status.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.sectionHeading}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Personal details</Text>
            <Feather name="user" size={16} color={colors.mutedForeground} />
          </View>
          <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <DetailRow label="EMAIL" value={profile.email ?? 'Not on file'} colors={colors} />
            <DetailRow label="MOBILE" value={profile.phone} colors={colors} last />
          </View>

          <View style={styles.sectionHeading}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Membership</Text>
            <Feather name="hexagon" size={16} color={colors.accentForeground} />
          </View>
          <View style={[styles.membershipCard, { backgroundColor: colors.forestDeep }]}>
            <View style={styles.membershipTop}>
              <Text style={[styles.planEyebrow, { color: colors.lime }]}>YOUR PLAN</Text>
              <View style={[styles.planMark, { backgroundColor: colors.forestOverlay }]}>
                <Feather name="hexagon" size={17} color={colors.lime} />
              </View>
            </View>
            <Text style={[styles.planName, { color: colors.forestText }]}>
              {membership?.planName ?? 'No membership on file'}
            </Text>
            <Text style={[styles.planSub, { color: colors.forestMuted }]}>
              {membership
                ? `KES ${membership.monthlyPriceKes.toLocaleString()} per month · ${membership.status}`
                : 'Contact reception to update your membership record.'}
            </Text>
            <View style={[styles.planDivider, { backgroundColor: colors.forestLine }]} />
            <View style={styles.planMetaRow}>
              <View>
                <Text style={[styles.planLabel, { color: colors.forestCaption }]}>MEMBER NUMBER</Text>
                <Text style={[styles.planValue, { color: colors.forestText }]}>{profile.memberNumber}</Text>
              </View>
              {membership ? (
                <View style={styles.planMetaRight}>
                  <Text style={[styles.planLabel, { color: colors.forestCaption }]}>EXPIRES</Text>
                  <Text style={[styles.planValue, { color: colors.forestText }]}>
                    {formatDate(`${membership.expiresOn}T12:00:00+03:00`, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={[styles.visitsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.visitIcon, { backgroundColor: colors.accent }]}>
              <Feather name="calendar" size={15} color={colors.primary} />
            </View>
            <View style={styles.visitCopy}>
              <Text style={[styles.visitTitle, { color: colors.foreground }]}>Gym visits this month</Text>
              <Text style={[styles.visitSubtitle, { color: colors.mutedForeground }]}>
                Based on check-ins recorded by reception.
              </Text>
            </View>
            <Text style={[styles.visitValue, { color: colors.foreground }]}>{profile.checkInsThisMonth}</Text>
          </View>
        </>
      ) : (
        <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 22, padding: 16 }]}>
          <Text style={[styles.memberSince, { color: profileQuery.error ? colors.destructive : colors.mutedForeground }]}>
            {profileQuery.error ? formatMemberApiError(profileQuery.error) : 'Loading your member profile…'}
          </Text>
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        onPress={() => void signOut()}
        style={({ pressed }) => [
          styles.signOutButton,
          { borderColor: colors.border, backgroundColor: colors.card, opacity: pressed ? 0.75 : 1 },
        ]}
      >
        <Feather name="log-out" size={15} color={colors.primary} />
        <Text style={[styles.signOutText, { color: colors.primary }]}>Sign out</Text>
      </Pressable>
      <View style={{ height: 115 }} />
    </ScrollView>
  );
}

function DetailRow({ label, value, last = false, colors }: {
  label: string;
  value: string;
  last?: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.detailRow, !last && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
      <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 22, paddingBottom: 28 },
  eyebrow: { fontSize: 10, letterSpacing: 1.5, fontWeight: '700', marginBottom: 8 },
  title: { fontSize: 31, letterSpacing: -1, fontWeight: '700' },
  identityCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 20, padding: 15, marginTop: 22 },
  avatar: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontWeight: '700' },
  avatarDot: { position: 'absolute', width: 11, height: 11, borderRadius: 6, right: -1, bottom: -1, borderWidth: 2 },
  identityCopy: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: '700' },
  memberSince: { fontSize: 10, marginTop: 4, lineHeight: 15 },
  activePill: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 9 },
  activeText: { fontSize: 8, letterSpacing: 0.7, fontWeight: '700' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 27, marginBottom: 12 },
  sectionTitle: { fontSize: 18, letterSpacing: -0.3, fontWeight: '700' },
  detailsCard: { borderWidth: 1, borderRadius: 19, paddingHorizontal: 15 },
  detailRow: { minHeight: 57, justifyContent: 'center' },
  detailLabel: { fontSize: 8, letterSpacing: 1, fontWeight: '700', marginBottom: 4 },
  detailValue: { fontSize: 12, fontWeight: '600' },
  membershipCard: { borderRadius: 21, padding: 19, overflow: 'hidden' },
  membershipTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planEyebrow: { fontSize: 8, letterSpacing: 1.2, fontWeight: '700' },
  planMark: { width: 31, height: 31, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  planName: { fontSize: 19, fontWeight: '600', marginTop: 6 },
  planSub: { fontSize: 10, marginTop: 5, textTransform: 'capitalize' },
  planDivider: { height: 1, marginTop: 18, marginBottom: 15 },
  planMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planMetaRight: { alignItems: 'flex-end' },
  planLabel: { fontSize: 7, letterSpacing: 0.8, fontWeight: '700' },
  planValue: { fontSize: 10, fontWeight: '700', marginTop: 5 },
  visitsCard: { flexDirection: 'row', alignItems: 'center', gap: 11, borderWidth: 1, borderRadius: 17, padding: 13, marginTop: 19 },
  visitIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  visitCopy: { flex: 1 },
  visitTitle: { fontSize: 11, fontWeight: '700' },
  visitSubtitle: { fontSize: 9, marginTop: 3 },
  visitValue: { fontSize: 18, fontWeight: '700' },
  signOutButton: { minHeight: 45, borderWidth: 1, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 },
  signOutText: { fontSize: 11, fontWeight: '700' },
});
