import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

const initialPreferences = {
  classReminders: true,
  workoutReminders: false,
  monthlyRecap: true,
};

const payments = [
  { title: 'Personal training · 1 session', date: '12 Nov 2026', amount: '$46.00', status: 'PAID', icon: 'activity' as const },
  { title: 'Recovery class · Drop-in', date: '30 Oct 2026', amount: '$22.00', status: 'PAID', icon: 'heart' as const },
  { title: 'Founders Club · Annual', date: '30 Sep 2026', amount: '$540.00', status: 'PAID', icon: 'credit-card' as const },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const [preferences, setPreferences] = useState(initialPreferences);

  const toggle = (key: keyof typeof initialPreferences) => {
    setPreferences((previous) => ({ ...previous, [key]: !previous[key] }));
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topInset + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.eyebrow, { color: colors.forestMid }]}>YOUR MEMBERSHIP</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>

      <View style={[styles.identityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>AM</Text>
          <View style={[styles.avatarDot, { backgroundColor: colors.forestMid, borderColor: colors.card }]} />
        </View>
        <View style={styles.identityCopy}>
          <Text style={[styles.name, { color: colors.foreground }]}>Alex Morgan</Text>
          <Text style={[styles.memberSince, { color: colors.mutedForeground }]}>Member since September 2023</Text>
        </View>
        <View style={[styles.activePill, { backgroundColor: colors.accent }]}>
          <Text style={[styles.activeText, { color: colors.primary }]}>ACTIVE</Text>
        </View>
      </View>

      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Personal details</Text>
        <Feather name="user" size={16} color={colors.mutedForeground} />
      </View>
      <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <DetailRow label="EMAIL" value="alex.morgan@email.test" colors={colors} />
        <DetailRow label="MOBILE" value="+1 (415) 555-0186" colors={colors} />
        <DetailRow label="HOME CLUB" value="Marina District" colors={colors} last />
      </View>

      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Membership</Text>
        <Feather name="hexagon" size={16} color={colors.forestMid} />
      </View>
      <View style={[styles.membershipCard, { backgroundColor: colors.forestDeep }]}>
        <View style={styles.membershipTop}>
          <Text style={[styles.planEyebrow, { color: colors.lime }]}>YOUR PLAN</Text>
          <View style={[styles.planMark, { backgroundColor: colors.forestOverlay }]}>
            <Feather name="hexagon" size={17} color={colors.lime} />
          </View>
        </View>
        <Text style={[styles.planName, { color: colors.forestText }]}>Founders Club</Text>
        <Text style={[styles.planSub, { color: colors.forestMuted }]}>Full access · All club hours</Text>
        <View style={[styles.planDivider, { backgroundColor: colors.forestLine }]} />
        <View style={styles.planMetaRow}>
          <View>
            <Text style={[styles.planLabel, { color: colors.forestCaption }]}>MEMBERSHIP ID</Text>
            <Text style={[styles.planValue, { color: colors.forestText }]}>MG-2048-731</Text>
          </View>
          <View style={styles.planMetaRight}>
            <Text style={[styles.planLabel, { color: colors.forestCaption }]}>EXPIRES</Text>
            <Text style={[styles.planValue, { color: colors.forestText }]}>30 Sep 2027</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Payment history</Text>
        <Text style={[styles.sectionAside, { color: colors.mutedForeground }]}>RECENT</Text>
      </View>
      <View style={[styles.paymentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {payments.map((payment, index) => (
          <View key={payment.title} style={[styles.paymentRow, index < payments.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
            <View style={[styles.paymentIcon, { backgroundColor: colors.muted }]}>
              <Feather name={payment.icon} size={15} color={colors.forestMid} />
            </View>
            <View style={styles.paymentCopy}>
              <Text style={[styles.paymentTitle, { color: colors.foreground }]}>{payment.title}</Text>
              <Text style={[styles.paymentDate, { color: colors.mutedForeground }]}>{payment.date} · {payment.status}</Text>
            </View>
            <Text style={[styles.paymentAmount, { color: colors.foreground }]}>{payment.amount}</Text>
          </View>
        ))}
      </View>
      <View style={[styles.paymentMethod, { backgroundColor: colors.warm }]}>
        <Feather name="credit-card" size={14} color={colors.gold} />
        <Text style={[styles.paymentMethodText, { color: colors.foreground }]}>Visa ending in 0428</Text>
        <Text style={[styles.defaultLabel, { color: colors.mutedForeground }]}>DEFAULT</Text>
      </View>

      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your preferences</Text>
        <Text style={[styles.sectionAside, { color: colors.mutedForeground }]}>ON THIS SCREEN</Text>
      </View>
      <View style={[styles.preferencesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <PreferenceRow
          testID="setting-class-reminders"
          title="Class reminders"
          detail="A heads-up before your booked class"
          value={preferences.classReminders}
          onToggle={() => toggle('classReminders')}
          colors={colors}
        />
        <PreferenceRow
          testID="setting-workout-reminders"
          title="Training nudges"
          detail="A gentle reminder on plan days"
          value={preferences.workoutReminders}
          onToggle={() => toggle('workoutReminders')}
          colors={colors}
        />
        <PreferenceRow
          testID="setting-monthly-recap"
          title="Monthly progress recap"
          detail="Your attendance and milestones"
          value={preferences.monthlyRecap}
          onToggle={() => toggle('monthlyRecap')}
          colors={colors}
          last
        />
      </View>
      <Text style={[styles.localNote, { color: colors.mutedForeground }]}>Preference switches are a local preview; no account settings are sent or saved.</Text>
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

function PreferenceRow({ testID, title, detail, value, onToggle, last = false, colors }: {
  testID: string;
  title: string;
  detail: string;
  value: boolean;
  onToggle: () => void;
  last?: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.preferenceRow, !last && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
      <View style={styles.preferenceCopy}>
        <Text style={[styles.preferenceTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.preferenceDetail, { color: colors.mutedForeground }]}>{detail}</Text>
      </View>
      <Pressable
        testID={testID}
        accessibilityRole="switch"
        accessibilityLabel={title}
        accessibilityState={{ checked: value }}
        onPress={onToggle}
        style={({ pressed }) => [
          styles.switchTrack,
          { backgroundColor: value ? colors.forestMid : colors.border, opacity: pressed ? 0.75 : 1 },
        ]}
      >
        <View style={[styles.switchThumb, { backgroundColor: colors.card, alignSelf: value ? 'flex-end' : 'flex-start' }]} />
      </Pressable>
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
  memberSince: { fontSize: 10, marginTop: 4 },
  activePill: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 9 },
  activeText: { fontSize: 8, letterSpacing: 0.7, fontWeight: '700' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 27, marginBottom: 12 },
  sectionTitle: { fontSize: 18, letterSpacing: -0.3, fontWeight: '700' },
  sectionAside: { fontSize: 8, fontWeight: '700', letterSpacing: 0.9 },
  detailsCard: { borderWidth: 1, borderRadius: 19, paddingHorizontal: 15 },
  detailRow: { minHeight: 57, justifyContent: 'center' },
  detailLabel: { fontSize: 8, letterSpacing: 1, fontWeight: '700', marginBottom: 4 },
  detailValue: { fontSize: 12, fontWeight: '600' },
  membershipCard: { borderRadius: 21, padding: 19, overflow: 'hidden' },
  membershipTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planEyebrow: { fontSize: 8, letterSpacing: 1.2, fontWeight: '700' },
  planMark: { width: 31, height: 31, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  planName: { fontSize: 19, fontWeight: '600', marginTop: 6 },
  planSub: { fontSize: 10, marginTop: 4 },
  planDivider: { height: 1, marginTop: 16, marginBottom: 13 },
  planMetaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  planMetaRight: { alignItems: 'flex-end' },
  planLabel: { fontSize: 8, letterSpacing: 0.9, fontWeight: '700', marginBottom: 4 },
  planValue: { fontSize: 10, fontWeight: '600' },
  paymentCard: { borderWidth: 1, borderRadius: 19, paddingHorizontal: 13 },
  paymentRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 10 },
  paymentIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  paymentCopy: { flex: 1 },
  paymentTitle: { fontSize: 10, fontWeight: '700' },
  paymentDate: { fontSize: 8, marginTop: 4 },
  paymentAmount: { fontSize: 11, fontWeight: '700' },
  paymentMethod: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 13, paddingHorizontal: 12, paddingVertical: 11, marginTop: 9 },
  paymentMethodText: { fontSize: 10, fontWeight: '600', flex: 1 },
  defaultLabel: { fontSize: 7, fontWeight: '700', letterSpacing: 0.8 },
  preferencesCard: { borderWidth: 1, borderRadius: 19, paddingHorizontal: 14 },
  preferenceRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 10 },
  preferenceCopy: { flex: 1 },
  preferenceTitle: { fontSize: 11, fontWeight: '700' },
  preferenceDetail: { fontSize: 9, marginTop: 4 },
  switchTrack: { width: 42, height: 25, borderRadius: 13, padding: 3, justifyContent: 'center' },
  switchThumb: { width: 19, height: 19, borderRadius: 10 },
  localNote: { fontSize: 9, lineHeight: 14, textAlign: 'center', marginTop: 11, paddingHorizontal: 10 },
});
