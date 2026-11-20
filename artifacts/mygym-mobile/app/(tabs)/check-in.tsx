import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import QRCode from 'react-native-qrcode-svg';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

const DEMO_TOKEN = 'MYGYM-DEMO-MG-2048-731-2027';

export default function CheckInScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const todayLabel = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
  const [checkedIn, setCheckedIn] = useState(false);
  const [confirmedAt, setConfirmedAt] = useState('');

  const confirm = () => {
    setConfirmedAt(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
    setCheckedIn(true);
    if (Platform.OS !== 'web') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topInset + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.eyebrow, { color: colors.forestMid }]}>AT THE CLUB</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>{checkedIn ? 'You’re in.' : 'Check in'}</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        {checkedIn ? 'Your visit has been added to today.' : 'A quick hello, then you’re onto the good stuff.'}
      </Text>

      {checkedIn ? (
        <View style={[styles.successCard, { backgroundColor: colors.forestDeep }]}>
          <View style={[styles.successIcon, { backgroundColor: colors.forestOverlay }]}>
            <Feather name="check" size={27} color={colors.lime} />
          </View>
          <Text style={[styles.successOverline, { color: colors.lime }]}>VISIT CONFIRMED</Text>
          <Text style={[styles.successTitle, { color: colors.forestText }]}>Welcome to the club, Alex.</Text>
          <Text style={[styles.successCopy, { color: colors.forestMuted }]}>Today · {todayLabel} · {confirmedAt}</Text>
          <View style={[styles.successRule, { backgroundColor: colors.forestLine }]} />
          <Text style={[styles.successFoot, { color: colors.forestMuted }]}>This is a local demo check-in. No visit was sent to a club system.</Text>
          <Pressable
            testID="reset-checkin-button"
            accessibilityRole="button"
            accessibilityLabel="Return to demo pass"
            onPress={() => setCheckedIn(false)}
            style={({ pressed }) => [styles.resetButton, { backgroundColor: colors.lime, opacity: pressed ? 0.82 : 1 }]}
          >
            <Text style={[styles.resetText, { color: colors.forestDeep }]}>Back to demo pass</Text>
            <Feather name="arrow-right" size={15} color={colors.forestDeep} />
          </Pressable>
          <View
            pointerEvents="none"
            style={[styles.successOrbit, { borderColor: colors.forestRing }]}
          />
        </View>
      ) : (
        <>
          <View
            style={[
              styles.passCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                shadowColor: colors.forestDeep,
              },
            ]}
          >
            <View style={styles.passHeader}>
              <View style={[styles.clubMark, { backgroundColor: colors.primary }]}>
                <Feather name="hexagon" size={17} color={colors.lime} />
              </View>
              <View style={styles.passIdentity}>
                <Text style={[styles.memberName, { color: colors.foreground }]}>Alex Morgan</Text>
                <Text style={[styles.memberPlan, { color: colors.mutedForeground }]}>FOUNDERS CLUB</Text>
              </View>
              <View style={[styles.activePill, { backgroundColor: colors.accent }]}>
                <View style={[styles.activeDot, { backgroundColor: colors.forestMid }]} />
                <Text style={[styles.activeText, { color: colors.primary }]}>ACTIVE</Text>
              </View>
            </View>
            <View style={styles.qrContainer} accessibilityRole="image" accessibilityLabel={`Demo QR pass encoded with member token ${DEMO_TOKEN}`}>
              <QRCode
                value={DEMO_TOKEN}
                size={198}
                color={colors.forestDeep}
                backgroundColor={colors.card}
                quietZone={11}
              />
            </View>
            <Text style={[styles.scanInstruction, { color: colors.foreground }]}>Show this pass at the front desk</Text>
            <Text style={[styles.memberCode, { color: colors.mutedForeground }]}>MEMBER ID · MG-2048-731</Text>
            <View style={[styles.passDivider, { backgroundColor: colors.border }]} />
            <View style={styles.validityRow}>
              <View>
                <Text style={[styles.validityLabel, { color: colors.mutedForeground }]}>MEMBERSHIP</Text>
                <Text style={[styles.validityValue, { color: colors.foreground }]}>Active</Text>
              </View>
              <View style={styles.validityRight}>
                <Text style={[styles.validityLabel, { color: colors.mutedForeground }]}>VALID THROUGH</Text>
                <Text style={[styles.validityValue, { color: colors.foreground }]}>30 Sep 2027</Text>
              </View>
            </View>
          </View>

          <View style={[styles.demoNotice, { backgroundColor: colors.warm }]}>
            <Feather name="info" size={15} color={colors.gold} />
            <Text style={[styles.demoNoticeText, { color: colors.foreground }]}>
              Demo pass only. The QR contains a sample member token, not a live credential.
            </Text>
          </View>
          <Pressable
            testID="confirm-checkin-button"
            accessibilityRole="button"
            accessibilityLabel="Confirm demo check-in"
            onPress={confirm}
            style={({ pressed }) => [
              styles.confirmButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.84 : 1 },
            ]}
          >
            <Feather name="check" size={17} color={colors.primaryForeground} />
            <Text style={[styles.confirmText, { color: colors.primaryForeground }]}>Confirm check-in</Text>
          </Pressable>
          <Text style={[styles.localNote, { color: colors.mutedForeground }]}>Confirmation stays on this screen only.</Text>
        </>
      )}
      <View style={{ height: 115 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 22, paddingBottom: 28 },
  eyebrow: { fontSize: 10, letterSpacing: 1.5, fontWeight: '700', marginBottom: 8 },
  title: { fontSize: 31, letterSpacing: -1, fontWeight: '700' },
  subtitle: { fontSize: 13, lineHeight: 19, marginTop: 7, marginBottom: 23 },
  passCard: { borderWidth: 1, borderRadius: 23, padding: 19, alignItems: 'center', shadowOpacity: 0.06, shadowRadius: 18, shadowOffset: { width: 0, height: 7 }, elevation: 2 },
  passHeader: { width: '100%', flexDirection: 'row', alignItems: 'center' },
  clubMark: { width: 37, height: 37, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  passIdentity: { marginLeft: 10, flex: 1 },
  memberName: { fontSize: 13, fontWeight: '700' },
  memberPlan: { fontSize: 8, letterSpacing: 1, fontWeight: '700', marginTop: 4 },
  activePill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6 },
  activeDot: { width: 5, height: 5, borderRadius: 3 },
  activeText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.6 },
  qrContainer: { width: 222, height: 222, marginTop: 20, alignItems: 'center', justifyContent: 'center' },
  scanInstruction: { fontSize: 12, fontWeight: '600', marginTop: 7 },
  memberCode: { fontSize: 8, letterSpacing: 1.1, fontWeight: '600', marginTop: 6 },
  passDivider: { height: 1, width: '100%', marginTop: 19, marginBottom: 14 },
  validityRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  validityRight: { alignItems: 'flex-end' },
  validityLabel: { fontSize: 8, letterSpacing: 0.9, fontWeight: '700', marginBottom: 4 },
  validityValue: { fontSize: 11, fontWeight: '600' },
  demoNotice: { flexDirection: 'row', gap: 9, borderRadius: 14, padding: 12, marginTop: 14, alignItems: 'flex-start' },
  demoNoticeText: { flex: 1, fontSize: 10, lineHeight: 15 },
  confirmButton: { height: 52, borderRadius: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 16 },
  confirmText: { fontSize: 13, fontWeight: '700' },
  localNote: { fontSize: 9, textAlign: 'center', marginTop: 10 },
  successCard: { borderRadius: 24, minHeight: 300, marginTop: 6, padding: 22, justifyContent: 'center', overflow: 'hidden' },
  successIcon: { width: 55, height: 55, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  successOverline: { fontSize: 9, fontWeight: '700', letterSpacing: 1.2, marginTop: 26 },
  successTitle: { fontSize: 22, lineHeight: 28, fontWeight: '700', marginTop: 8, maxWidth: 270 },
  successCopy: { fontSize: 11, marginTop: 9 },
  successRule: { height: 1, marginTop: 21, marginBottom: 12 },
  successFoot: { fontSize: 10, lineHeight: 15, maxWidth: 270 },
  resetButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 13, paddingVertical: 11, marginTop: 19 },
  resetText: { fontSize: 11, fontWeight: '700' },
  successOrbit: { width: 175, height: 175, borderRadius: 100, borderWidth: 1, position: 'absolute', right: -67, top: 31 },
});
