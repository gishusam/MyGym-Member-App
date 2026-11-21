import React from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useRouter } from 'expo-router';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

const week = [
  { day: 'M', attended: true },
  { day: 'T', attended: true },
  { day: 'W', attended: false },
  { day: 'T', attended: true },
  { day: 'F', attended: false },
  { day: 'S', attended: false },
  { day: 'S', attended: false },
];
const DEMO_MEMBER_TOKEN = 'MYGYM-DEMO-MG-2048-731-2027';

function getNextCommunityRunDate() {
  const now = new Date();
  const daysUntilSaturday = (6 - now.getDay() + 7) % 7;
  const eventDate = new Date(now);
  eventDate.setDate(now.getDate() + daysUntilSaturday);
  eventDate.setHours(7, 30, 0, 0);
  if (eventDate <= now) eventDate.setDate(eventDate.getDate() + 7);
  return eventDate;
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const nextEventDate = getNextCommunityRunDate();
  const nextEventDateLabel = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(nextEventDate).toUpperCase();
  const todayLabel = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
    .format(new Date())
    .toUpperCase();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topInset + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.kicker, { color: colors.mutedForeground }]}>{todayLabel}</Text>
          <Text style={[styles.greeting, { color: colors.foreground }]}>Hi, Alex</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Ready to make today count?</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open your profile"
          testID="home-profile-button"
          onPress={() => router.navigate('/profile')}
          style={({ pressed }) => [
            styles.avatar,
            { backgroundColor: colors.accent, opacity: pressed ? 0.72 : 1 },
          ]}
        >
          <Text style={[styles.avatarText, { color: colors.primary }]}>AM</Text>
          <View style={[styles.onlineDot, { backgroundColor: colors.forestMid, borderColor: colors.background }]} />
        </Pressable>
      </View>

      <View style={styles.memberStatus}>
        <View style={[styles.memberStatusIcon, { backgroundColor: colors.secondary }]}>
          <Feather name="hexagon" size={14} color={colors.primary} />
        </View>
        <View style={styles.memberStatusCopy}>
          <Text style={[styles.memberStatusName, { color: colors.foreground }]}>Founders Club</Text>
          <Text style={[styles.memberStatusMeta, { color: colors.mutedForeground }]}>Member since September 2023</Text>
        </View>
        <View style={[styles.activePill, { backgroundColor: colors.accent }]}>
          <View style={[styles.memberDot, { backgroundColor: colors.forestMid }]} />
          <Text style={[styles.activePillText, { color: colors.accentForeground }]}>ACTIVE</Text>
        </View>
      </View>

      <Pressable
        testID="home-checkin-card"
        accessibilityRole="button"
        accessibilityLabel="Open your demo member pass for check-in"
        onPress={() => router.navigate('/member-qr')}
        style={({ pressed }) => [
          styles.checkinCard,
          { backgroundColor: colors.forestDeep, opacity: pressed ? 0.86 : 1 },
        ]}
      >
        <View style={styles.checkinCopy}>
          <Text style={[styles.checkinOverline, { color: colors.forestCaption }]}>MEMBER PASS · DEMO</Text>
          <Text style={[styles.checkinTitle, { color: colors.forestText }]}>Check in at the front desk</Text>
          <Text style={[styles.checkinSub, { color: colors.forestMuted }]}>Your sample QR is ready to show.</Text>
          <View style={[styles.checkinAction, { backgroundColor: colors.forestMid }]}>
            <MaterialCommunityIcons name="qrcode-scan" size={13} color={colors.primaryForeground} />
            <Text style={[styles.checkinActionText, { color: colors.primaryForeground }]}>SHOW QR</Text>
          </View>
        </View>
        <View style={[styles.homeQrTile, { backgroundColor: colors.card }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <QRCode
            value={DEMO_MEMBER_TOKEN}
            size={58}
            color={colors.forestDeep}
            backgroundColor={colors.card}
            quietZone={3}
          />
        </View>
      </Pressable>

      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your rhythm</Text>
        <Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>THIS WEEK</Text>
      </View>

      <View style={styles.rhythmRow}>
        <View
          style={[
            styles.streakCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              shadowColor: colors.forestDeep,
            },
          ]}
        >
          <View style={styles.cardLabelRow}>
            <View style={[styles.iconPlate, { backgroundColor: colors.warm }]}>
              <MaterialCommunityIcons name="fire" size={17} color={colors.gold} />
            </View>
            <Text style={[styles.miniLabel, { color: colors.mutedForeground }]}>STREAK</Text>
          </View>
          <View style={styles.streakNumberRow}>
            <Text style={[styles.streakNumber, { color: colors.foreground }]}>6</Text>
            <Text style={[styles.streakUnit, { color: colors.mutedForeground }]}>weeks</Text>
          </View>
          <Text style={[styles.cardFootnote, { color: colors.mutedForeground }]}>Your longest yet. Keep it going.</Text>
        </View>
        <View
          style={[
            styles.attendanceCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              shadowColor: colors.forestDeep,
            },
          ]}
        >
          <View style={styles.cardLabelRow}>
            <View style={[styles.iconPlate, { backgroundColor: colors.accent }]}>
              <Feather name="calendar" size={15} color={colors.primary} />
            </View>
            <Text style={[styles.miniLabel, { color: colors.mutedForeground }]}>VISITS</Text>
            <Text style={[styles.visitCount, { color: colors.foreground }]}>3<Text style={[styles.visitTarget, { color: colors.mutedForeground }]}> / 4</Text></Text>
          </View>
          <View style={styles.weekDots}>
            {week.map((item, index) => (
              <View key={`${item.day}-${index}`} style={styles.dayColumn}>
                <View
                  style={[
                    styles.dayDot,
                    { backgroundColor: item.attended ? colors.forestMid : colors.muted },
                  ]}
                >
                  {item.attended ? <Feather name="check" size={10} color={colors.primaryForeground} /> : null}
                </View>
                <Text style={[styles.dayText, { color: colors.mutedForeground }]}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>On your plan</Text>
        <Pressable
          testID="see-workouts-button"
          accessibilityRole="button"
          onPress={() => router.navigate('/workouts')}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.55 : 1 })}
        >
          <Text style={[styles.linkText, { color: colors.primary }]}>VIEW PLAN</Text>
        </Pressable>
      </View>

      <Pressable
        testID="today-workout-card"
        accessibilityRole="button"
        accessibilityLabel="Open today's workout, Strength foundations"
        onPress={() => router.navigate('/workouts')}
        style={({ pressed }) => [
          styles.workoutCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            shadowColor: colors.forestDeep,
            transform: [{ scale: pressed ? 0.985 : 1 }],
          },
        ]}
      >
        <View style={[styles.workoutArtwork, { backgroundColor: colors.secondary }]}>
          <View style={[styles.artRing, { borderColor: colors.forestMid }]} />
          <View style={[styles.artCore, { backgroundColor: colors.forestMid }]}>
            <Feather name="activity" size={21} color={colors.primaryForeground} />
          </View>
            <Text style={[styles.artNo, { color: colors.accentForeground }]}>01 / 04</Text>
        </View>
        <View style={styles.workoutDetails}>
          <View style={styles.workoutEyebrow}>
            <View style={[styles.todayDot, { backgroundColor: colors.forestMid }]} />
            <Text style={[styles.todayLabel, { color: colors.accentForeground }]}>TODAY'S SESSION</Text>
          </View>
          <Text style={[styles.workoutTitle, { color: colors.foreground }]}>Strength foundations</Text>
          <Text style={[styles.workoutMeta, { color: colors.mutedForeground }]}>Upper body · 45 min</Text>
          <View style={styles.workoutBottom}>
            <Text style={[styles.levelText, { color: colors.mutedForeground }]}>MODERATE</Text>
            <View style={[styles.roundArrow, { backgroundColor: colors.primary }]}>
              <Feather name="arrow-up-right" size={15} color={colors.primaryForeground} />
            </View>
          </View>
        </View>
      </Pressable>

      <Pressable
        testID="next-event-preview"
        accessibilityRole="button"
        accessibilityLabel={`Open Events for Community 5K run, ${nextEventDateLabel} at 7:30 AM`}
        onPress={() => router.navigate('/events')}
        style={({ pressed }) => [
          styles.nextEventCard,
          { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.78 : 1 },
        ]}
      >
        <View style={[styles.nextEventDate, { backgroundColor: colors.accent }]}>
          <Feather name="navigation" size={14} color={colors.accentForeground} />
          <Text style={[styles.nextEventDateText, { color: colors.accentForeground }]}>{nextEventDateLabel}</Text>
        </View>
        <View style={styles.nextEventCopy}>
          <Text style={[styles.nextEventEyebrow, { color: colors.accentForeground }]}>NEXT EVENT</Text>
          <Text style={[styles.nextEventTitle, { color: colors.foreground }]}>Community 5K run</Text>
          <Text style={[styles.nextEventMeta, { color: colors.mutedForeground }]}>7:30 AM · Marina Green</Text>
        </View>
        <View style={[styles.nextEventArrow, { backgroundColor: colors.primary }]}>
          <Feather name="arrow-up-right" size={14} color={colors.primaryForeground} />
        </View>
      </Pressable>

      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>A little progress</Text>
        <Pressable
          testID="see-progress-button"
          accessibilityRole="button"
          onPress={() => router.navigate('/progress')}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.55 : 1 })}
        >
          <Text style={[styles.linkText, { color: colors.primary }]}>ALL STATS</Text>
        </Pressable>
      </View>
      <View
        style={[
          styles.progressCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            shadowColor: colors.forestDeep,
          },
        ]}
      >
        <View style={styles.progressCopy}>
          <Text style={[styles.progressMetric, { color: colors.foreground }]}>+8.4<Text style={[styles.progressPercent, { color: colors.accentForeground }]}>%</Text></Text>
          <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>strength this month</Text>
          <Text style={[styles.progressNote, { color: colors.accentForeground }]}>Moving in the right direction</Text>
        </View>
        <View style={styles.chart} accessibilityLabel="Strength trend rising over four weeks">
          {[30, 43, 38, 58, 54, 70, 65, 88].map((height, index) => (
            <View key={index} style={styles.chartBarWrap}>
              <View
                style={[
                  styles.chartBar,
                  {
                    height,
                    backgroundColor: index === 7 ? colors.forestMid : colors.accent,
                  },
                ]}
              />
            </View>
          ))}
        </View>
        <View style={[styles.progressDivider, { backgroundColor: colors.border }]} />
        <View style={styles.progressFooter}>
          <Text style={[styles.progressFooterText, { color: colors.mutedForeground }]}>BENCH PRESS</Text>
          <Text style={[styles.progressFooterValue, { color: colors.foreground }]}>52.5 kg <Text style={{ color: colors.accentForeground }}>↑ 2.5 kg</Text></Text>
        </View>
      </View>
      <View style={{ height: 112 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 22, paddingBottom: 26 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 },
  kicker: { fontSize: 10, letterSpacing: 1.5, fontWeight: '700', marginBottom: 7 },
  greeting: { fontSize: 25, fontWeight: '700', letterSpacing: -0.7 },
  subtitle: { fontSize: 13, marginTop: 5 },
  avatar: { width: 46, height: 46, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '700', letterSpacing: 0.4 },
  onlineDot: { position: 'absolute', width: 11, height: 11, borderRadius: 6, right: -1, bottom: -1, borderWidth: 2 },
  memberStatus: { minHeight: 45, flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 13 },
  memberStatusIcon: { width: 31, height: 31, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  memberStatusCopy: { flex: 1 },
  memberStatusName: { fontSize: 11, fontWeight: '700' },
  memberStatusMeta: { fontSize: 8, marginTop: 3 },
  activePill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 9, paddingHorizontal: 8, paddingVertical: 6 },
  activePillText: { fontSize: 7, letterSpacing: 0.5, fontWeight: '700' },
  checkinCard: { borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 26, overflow: 'hidden' },
  checkinCopy: { flex: 1 },
  checkinOverline: { fontSize: 7, letterSpacing: 1, fontWeight: '700', marginBottom: 6 },
  checkinTitle: { fontSize: 13, fontWeight: '700' },
  checkinSub: { fontSize: 9, marginTop: 4 },
  checkinAction: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, marginTop: 11 },
  checkinActionText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.6 },
  homeQrTile: { width: 68, height: 68, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  memberDot: { width: 6, height: 6, borderRadius: 4 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 },
  sectionTitle: { fontSize: 18, letterSpacing: -0.35, fontWeight: '700' },
  sectionMeta: { fontSize: 9, fontWeight: '700', letterSpacing: 1.1 },
  rhythmRow: { flexDirection: 'row', gap: 11, marginBottom: 27 },
  streakCard: { flex: 0.94, minHeight: 147, padding: 14, borderWidth: 1, borderRadius: 20, shadowOpacity: 0.035, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 1 },
  attendanceCard: { flex: 1.28, minHeight: 147, padding: 14, borderWidth: 1, borderRadius: 20, shadowOpacity: 0.035, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 1 },
  cardLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconPlate: { width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  miniLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  streakNumberRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5, marginTop: 9 },
  streakNumber: { fontSize: 35, lineHeight: 39, fontWeight: '700', letterSpacing: -1 },
  streakUnit: { fontSize: 11, fontWeight: '500' },
  cardFootnote: { fontSize: 9, lineHeight: 14, marginTop: 5, maxWidth: 115 },
  visitCount: { marginLeft: 'auto', fontSize: 14, fontWeight: '700' },
  visitTarget: { fontSize: 11, fontWeight: '500' },
  weekDots: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 17 },
  dayColumn: { alignItems: 'center', gap: 6 },
  dayDot: { width: 20, height: 20, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontSize: 9, fontWeight: '600' },
  linkText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
  workoutCard: { flexDirection: 'row', padding: 10, borderWidth: 1, borderRadius: 21, marginBottom: 27, minHeight: 147, shadowOpacity: 0.04, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 1 },
  workoutArtwork: { width: 117, borderRadius: 15, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  artRing: { width: 67, height: 67, borderRadius: 35, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  artCore: { position: 'absolute', width: 43, height: 43, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  artNo: { position: 'absolute', bottom: 10, fontSize: 8, letterSpacing: 1, fontWeight: '700' },
  workoutDetails: { flex: 1, paddingVertical: 7, paddingLeft: 14, paddingRight: 5 },
  workoutEyebrow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  todayDot: { width: 6, height: 6, borderRadius: 3 },
  todayLabel: { fontSize: 8, letterSpacing: 1, fontWeight: '700' },
  workoutTitle: { fontSize: 15, fontWeight: '700', letterSpacing: -0.25, marginTop: 7 },
  workoutMeta: { fontSize: 11, marginTop: 4 },
  workoutBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  levelText: { fontSize: 8, letterSpacing: 1, fontWeight: '700' },
  roundArrow: { width: 29, height: 29, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  nextEventCard: { minHeight: 74, borderWidth: 1, borderRadius: 17, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: -12, marginBottom: 25 },
  nextEventDate: { width: 54, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 4 },
  nextEventDateText: { fontSize: 7, letterSpacing: 0.2, fontWeight: '700' },
  nextEventCopy: { flex: 1 },
  nextEventEyebrow: { fontSize: 7, letterSpacing: 0.9, fontWeight: '700', marginBottom: 4 },
  nextEventTitle: { fontSize: 11, fontWeight: '700' },
  nextEventMeta: { fontSize: 8, marginTop: 4 },
  nextEventArrow: { width: 27, height: 27, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  progressCard: { borderWidth: 1, borderRadius: 20, padding: 16, shadowOpacity: 0.035, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 1 },
  progressCopy: { paddingBottom: 10 },
  progressMetric: { fontSize: 28, fontWeight: '700', letterSpacing: -0.8 },
  progressPercent: { fontSize: 17, fontWeight: '700' },
  progressLabel: { fontSize: 11, marginTop: -1 },
  progressNote: { fontSize: 10, fontWeight: '600', marginTop: 7 },
  chart: { height: 77, flexDirection: 'row', alignItems: 'flex-end', gap: 7, paddingBottom: 1 },
  chartBarWrap: { flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center' },
  chartBar: { width: '100%', borderRadius: 4 },
  progressDivider: { height: 1, marginTop: 14, marginBottom: 12 },
  progressFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressFooterText: { fontSize: 8, fontWeight: '700', letterSpacing: 1 },
  progressFooterValue: { fontSize: 10, fontWeight: '700' },
});
