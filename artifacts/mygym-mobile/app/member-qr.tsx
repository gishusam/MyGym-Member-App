import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import QRCode from 'react-native-qrcode-svg';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';

const DEMO_TOKEN = 'MYGYM-DEMO-MG-2048-731-2027';

export default function MemberQrScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const [checkedIn, setCheckedIn] = useState(false);
  const [confirmedAt, setConfirmedAt] = useState('');
  const todayLabel = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const confirm = () => {
    setConfirmedAt(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
    setCheckedIn(true);
    if (Platform.OS !== 'web') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topInset + 10, paddingBottom: bottomInset + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <Pressable
          testID="member-qr-close"
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

      {checkedIn ? (
        <View style={[styles.successPanel, { backgroundColor: colors.forestDeep }]}>
          <View style={[styles.successIcon, { backgroundColor: colors.forestOverlay }]}>
            <Feather name="check" size={25} color={colors.forestMid} />
          </View>
          <Text style={[styles.successOverline, { color: colors.forestMid }]}>DEMO VISIT CONFIRMED</Text>
          <Text style={[styles.successTitle, { color: colors.forestText }]}>You’re checked in, Alex.</Text>
          <Text style={[styles.successSub, { color: colors.forestMuted }]}>{todayLabel} · {confirmedAt}</Text>
          <View style={[styles.successRule, { backgroundColor: colors.forestLine }]} />
          <Text style={[styles.successNote, { color: colors.forestMuted }]}>This confirmation is a local demo only. Nothing was sent to a club system.</Text>
          <Pressable
            testID="reset-checkin-button"
            accessibilityRole="button"
            accessibilityLabel="Return to demo member pass"
            onPress={() => setCheckedIn(false)}
            style={({ pressed }) => [styles.backToPass, { backgroundColor: colors.forestMid, opacity: pressed ? 0.78 : 1 }]}
          >
            <Text style={[styles.backToPassText, { color: colors.primaryForeground }]}>Back to pass</Text>
            <Feather name="arrow-right" size={14} color={colors.primaryForeground} />
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.intro}>
            <Text style={[styles.eyebrow, { color: colors.accentForeground }]}>AT THE CLUB</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Your member pass</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Show this sample pass at the front desk.</Text>
          </View>

          <View style={[styles.passPanel, { backgroundColor: colors.forestDeep }]}>
            <View style={styles.memberRow}>
              <View style={[styles.clubMark, { backgroundColor: colors.forestOverlay }]}>
                <Feather name="hexagon" size={17} color={colors.forestMid} />
              </View>
              <View style={styles.memberIdentity}>
                <Text style={[styles.memberName, { color: colors.forestText }]}>Alex Morgan</Text>
                <Text style={[styles.memberPlan, { color: colors.forestCaption }]}>FOUNDERS CLUB · MG-2048-731</Text>
              </View>
            </View>

            <View style={[styles.qrTile, { backgroundColor: colors.card }]} accessibilityRole="image" accessibilityLabel={`Demo QR pass encoded with sample member token ${DEMO_TOKEN}`}>
              <QRCode
                value={DEMO_TOKEN}
                size={194}
                color={colors.forestDeep}
                backgroundColor={colors.card}
                quietZone={8}
              />
            </View>
            <Text style={[styles.scanText, { color: colors.forestText }]}>Scan at the front desk</Text>
            <Text style={[styles.demoLabel, { color: colors.forestCaption }]}>SAMPLE QR · NOT A LIVE CREDENTIAL</Text>
            <View style={[styles.passRule, { backgroundColor: colors.forestLine }]} />
            <View style={styles.validityRow}>
              <View>
                <Text style={[styles.metaLabel, { color: colors.forestCaption }]}>MEMBERSHIP</Text>
                <Text style={[styles.metaValue, { color: colors.forestText }]}>Active</Text>
              </View>
              <View style={[styles.activeThrough, { backgroundColor: colors.forestMid }]}>
                <Text style={[styles.activeThroughText, { color: colors.primaryForeground }]}>ACTIVE THROUGH 30 SEP 2027</Text>
              </View>
            </View>
          </View>

          <View style={[styles.disclosure, { backgroundColor: colors.warm }]}>
            <Feather name="info" size={14} color={colors.gold} />
            <Text style={[styles.disclosureText, { color: colors.foreground }]}>Demo only. The QR contains a sample token; this screen does not issue a real member credential or wallet pass.</Text>
          </View>
          <Pressable
            testID="confirm-checkin-button"
            accessibilityRole="button"
            accessibilityLabel="Confirm local demo check-in"
            onPress={confirm}
            style={({ pressed }) => [styles.confirmButton, { backgroundColor: colors.primary, opacity: pressed ? 0.82 : 1 }]}
          >
            <Feather name="check" size={16} color={colors.primaryForeground} />
            <Text style={[styles.confirmText, { color: colors.primaryForeground }]}>Confirm demo check-in</Text>
          </Pressable>
          <Text style={[styles.localNote, { color: colors.mutedForeground }]}>Confirmation stays on this screen only.</Text>
        </>
      )}
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
  subtitle: { fontSize: 11, marginTop: 5 },
  passPanel: { borderRadius: 24, padding: 18, alignItems: 'center' },
  memberRow: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 10 },
  clubMark: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  memberIdentity: { flex: 1 },
  memberName: { fontSize: 14, fontWeight: '700' },
  memberPlan: { fontSize: 7, letterSpacing: 0.8, fontWeight: '700', marginTop: 4 },
  qrTile: { width: 218, height: 218, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 17 },
  scanText: { fontSize: 11, fontWeight: '700', marginTop: 11 },
  demoLabel: { fontSize: 7, fontWeight: '700', letterSpacing: 0.9, marginTop: 5 },
  passRule: { width: '100%', height: 1, marginTop: 17, marginBottom: 13 },
  validityRow: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  metaLabel: { fontSize: 7, fontWeight: '700', letterSpacing: 0.8, marginBottom: 4 },
  metaValue: { fontSize: 10, fontWeight: '700' },
  activeThrough: { borderRadius: 9, paddingHorizontal: 9, paddingVertical: 7 },
  activeThroughText: { fontSize: 7, letterSpacing: 0.4, fontWeight: '700' },
  disclosure: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 13, padding: 11, marginTop: 13 },
  disclosureText: { flex: 1, fontSize: 9, lineHeight: 14 },
  confirmButton: { minHeight: 48, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 13 },
  confirmText: { fontSize: 11, fontWeight: '700' },
  localNote: { fontSize: 8, textAlign: 'center', marginTop: 8 },
  successPanel: { flex: 1, minHeight: 330, borderRadius: 24, padding: 22, justifyContent: 'center', overflow: 'hidden' },
  successIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  successOverline: { fontSize: 8, fontWeight: '700', letterSpacing: 1.1, marginTop: 23 },
  successTitle: { fontSize: 22, lineHeight: 28, fontWeight: '700', marginTop: 7 },
  successSub: { fontSize: 10, marginTop: 8 },
  successRule: { height: 1, marginTop: 20, marginBottom: 12 },
  successNote: { fontSize: 9, lineHeight: 14 },
  backToPass: { alignSelf: 'flex-start', borderRadius: 11, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18 },
  backToPassText: { fontSize: 10, fontWeight: '700' },
});
