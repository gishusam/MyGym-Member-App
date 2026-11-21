import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

const events = [
  { id: 'run', category: 'COMMUNITY RUN', title: 'Community 5K run', time: '7:30 AM', duration: '45 min', place: 'Marina Green · Meet at the club', spots: '12 spots left', icon: 'navigation' as const, tone: 'coral' as const },
  { id: 'yoga', category: 'STUDIO CLASS', title: 'Yoga flow with Coach Mina', time: '11:00 AM', duration: '1 hr', place: 'Movement studio · Level 2', spots: 'You’re going', icon: 'wind' as const, tone: 'blue' as const },
  { id: 'social', category: 'MEMBER SOCIAL', title: 'Members’ social morning', time: '1:00 PM', duration: '1 hr', place: 'The lounge · Coffee on us', spots: 'Open to all', icon: 'coffee' as const, tone: 'navy' as const },
];

function getNextCommunityRunDate() {
  const now = new Date();
  const daysUntilSaturday = (6 - now.getDay() + 7) % 7;
  const eventDate = new Date(now);
  eventDate.setDate(now.getDate() + daysUntilSaturday);
  eventDate.setHours(7, 30, 0, 0);
  if (eventDate <= now) eventDate.setDate(eventDate.getDate() + 7);
  return eventDate;
}

export default function EventsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const [going, setGoing] = useState<Record<string, boolean>>({ yoga: true });
  const runDate = getNextCommunityRunDate();
  const upcomingEvents = events.map((event, index) => {
    const eventDate = new Date(runDate);
    eventDate.setDate(runDate.getDate() + index);
    return {
      ...event,
      dateLabel: new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric' })
        .format(eventDate)
        .toUpperCase(),
    };
  });
  const eventMonth = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' })
    .format(runDate)
    .toUpperCase();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topInset + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.accentForeground }]}>AROUND THE CLUB</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Events</Text>
        </View>
        <View style={[styles.monthPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="calendar" size={13} color={colors.primary} />
          <Text style={[styles.monthText, { color: colors.foreground }]}>{eventMonth}</Text>
        </View>
      </View>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Good people. Good plans. Pick your next one.</Text>

      <View style={[styles.featurePanel, { backgroundColor: colors.forestDeep }]}>
        <View style={[styles.featureStamp, { backgroundColor: colors.forestOverlay }]}>
          <Feather name="sunrise" size={17} color={colors.lime} />
        </View>
        <Text style={[styles.featureKicker, { color: colors.forestCaption }]}>THIS WEEK AT MYGYM</Text>
        <Text style={[styles.featureTitle, { color: colors.forestText }]}>Move together.</Text>
        <Text style={[styles.featureCopy, { color: colors.forestMuted }]}>A few good reasons to get out the door.</Text>
        <View pointerEvents="none" style={[styles.orbit, { borderColor: colors.forestRing }]} />
      </View>

      <View style={styles.sectionRow}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Coming up</Text>
        <Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>3 LOCAL EVENTS</Text>
      </View>

      {upcomingEvents.map((event) => {
        const isGoing = Boolean(going[event.id]);
        const highlight = event.tone === 'coral' ? colors.accent : event.tone === 'blue' ? colors.secondary : colors.muted;
        const eventTint = event.tone === 'coral' ? colors.gold : colors.primary;
        return (
          <View key={event.id} style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.eventTop}>
              <View style={[styles.eventIcon, { backgroundColor: highlight }]}>
                <Feather name={event.icon} size={17} color={eventTint} />
              </View>
              <View style={styles.eventHeading}>
                <Text style={[styles.category, { color: eventTint }]}>{event.category}</Text>
                <Text style={[styles.eventTitle, { color: colors.foreground }]}>{event.title}</Text>
              </View>
              <View style={[styles.dayBadge, { backgroundColor: colors.background }]}>
                <Text style={[styles.dayBadgeText, { color: colors.foreground }]}>{event.dateLabel}</Text>
              </View>
            </View>
            <View style={[styles.eventRule, { backgroundColor: colors.border }]} />
            <View style={styles.eventMetaRow}>
              <View style={styles.metaItem}>
                <Feather name="clock" size={12} color={colors.mutedForeground} />
                <Text style={[styles.metaText, { color: colors.foreground }]}>{event.time}</Text>
              </View>
              <View style={[styles.durationPill, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.durationText, { color: colors.secondaryForeground }]}>{event.duration}</Text>
              </View>
              <Text style={[styles.spotsText, { color: isGoing ? colors.gold : colors.mutedForeground }]}>{isGoing ? 'YOU’RE GOING' : event.spots.toUpperCase()}</Text>
            </View>
            <View style={styles.eventBottom}>
              <View style={styles.placeRow}>
                <Feather name="map-pin" size={12} color={colors.mutedForeground} />
                <Text style={[styles.placeText, { color: colors.mutedForeground }]}>{event.place}</Text>
              </View>
              <Pressable
                testID={`event-join-${event.id}`}
                accessibilityRole="button"
                accessibilityLabel={`${isGoing ? 'Cancel attendance for' : 'Join'} ${event.title}`}
                accessibilityState={{ selected: isGoing }}
                onPress={() => setGoing((previous) => ({ ...previous, [event.id]: !previous[event.id] }))}
                style={({ pressed }) => [
                  styles.joinButton,
                  { backgroundColor: isGoing ? colors.secondary : colors.primary, opacity: pressed ? 0.78 : 1 },
                ]}
              >
                <Text style={[styles.joinText, { color: isGoing ? colors.primary : colors.primaryForeground }]}>{isGoing ? 'Going' : 'Join event'}</Text>
                <Feather name={isGoing ? 'check' : 'arrow-right'} size={13} color={isGoing ? colors.primary : colors.primaryForeground} />
              </Pressable>
            </View>
          </View>
        );
      })}

      <View style={[styles.localNote, { backgroundColor: colors.warm }]}>
        <Feather name="info" size={13} color={colors.gold} />
        <Text style={[styles.noteText, { color: colors.foreground }]}>Local preview events. Your going status stays on this screen only.</Text>
      </View>
      <View style={{ height: 115 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 22, paddingBottom: 28 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { fontSize: 10, letterSpacing: 1.5, fontWeight: '700', marginBottom: 7 },
  title: { fontSize: 31, letterSpacing: -1, fontWeight: '700' },
  monthPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  monthText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.6 },
  subtitle: { fontSize: 12, lineHeight: 18, marginTop: 7, marginBottom: 19 },
  featurePanel: { minHeight: 145, borderRadius: 22, padding: 18, overflow: 'hidden', marginBottom: 25 },
  featureStamp: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  featureKicker: { fontSize: 8, letterSpacing: 1.2, fontWeight: '700' },
  featureTitle: { fontSize: 21, fontWeight: '700', letterSpacing: -0.4, marginTop: 5 },
  featureCopy: { fontSize: 10, marginTop: 4 },
  orbit: { position: 'absolute', width: 150, height: 150, borderRadius: 80, borderWidth: 1, right: -48, top: 24 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 18, letterSpacing: -0.3, fontWeight: '700' },
  sectionMeta: { fontSize: 8, fontWeight: '700', letterSpacing: 0.9 },
  eventCard: { borderWidth: 1, borderRadius: 19, padding: 14, marginBottom: 11 },
  eventTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  eventIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  eventHeading: { flex: 1 },
  category: { fontSize: 7, fontWeight: '700', letterSpacing: 0.8, marginBottom: 4 },
  eventTitle: { fontSize: 13, fontWeight: '700', letterSpacing: -0.15 },
  dayBadge: { borderRadius: 9, paddingHorizontal: 8, paddingVertical: 6 },
  dayBadgeText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.3 },
  eventRule: { height: 1, marginTop: 13, marginBottom: 11 },
  eventMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 10, fontWeight: '700' },
  durationPill: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4 },
  durationText: { fontSize: 8, fontWeight: '600' },
  spotsText: { fontSize: 7, fontWeight: '700', letterSpacing: 0.45, marginLeft: 'auto' },
  eventBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 8 },
  placeRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  placeText: { flexShrink: 1, fontSize: 8 },
  joinButton: { borderRadius: 11, minHeight: 35, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  joinText: { fontSize: 9, fontWeight: '700' },
  localNote: { borderRadius: 13, paddingHorizontal: 11, paddingVertical: 10, flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 },
  noteText: { flex: 1, fontSize: 9, lineHeight: 14 },
});
