import React from 'react';
import { Feather } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { EventRegistration, formatMemberApiError, MemberEvent } from '@/lib/member-api';
import { useMemberApi } from '@/lib/useMemberApi';

function formatDate(value: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi',
    ...options,
  }).format(new Date(value));
}

function eventDuration(startsAt: string, endsAt: string) {
  const minutes = Math.max(0, Math.round((new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60_000));
  return minutes >= 60
    ? `${Math.floor(minutes / 60)} hr${minutes % 60 ? ` ${minutes % 60} min` : ''}`
    : `${minutes} min`;
}

export default function EventsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const api = useMemberApi();
  const queryClient = useQueryClient();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const eventsQuery = useQuery({
    queryKey: ['member', 'events'],
    queryFn: () => api<MemberEvent[]>('/member/events'),
  });
  const registrationMutation = useMutation({
    mutationFn: ({ eventId, join }: { eventId: string; join: boolean }) =>
      api<EventRegistration>(`/member/events/${eventId}/registration`, {
        method: join ? 'POST' : 'DELETE',
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['member', 'events'] });
    },
  });
  const events = eventsQuery.data ?? [];
  const monthLabel = events.length
    ? formatDate(events[0].startsAt, { month: 'long', year: 'numeric' }).toUpperCase()
    : formatDate(new Date().toISOString(), { month: 'long', year: 'numeric' }).toUpperCase();

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
          <Text style={[styles.monthText, { color: colors.foreground }]}>{monthLabel}</Text>
        </View>
      </View>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Good people. Good plans. Pick your next one.
      </Text>

      <View style={[styles.featurePanel, { backgroundColor: colors.forestDeep }]}>
        <View style={[styles.featureStamp, { backgroundColor: colors.forestOverlay }]}>
          <Feather name="sunrise" size={17} color={colors.lime} />
        </View>
        <Text style={[styles.featureKicker, { color: colors.forestCaption }]}>MYGYM FITNESS KE</Text>
        <Text style={[styles.featureTitle, { color: colors.forestText }]}>Move together.</Text>
        <Text style={[styles.featureCopy, { color: colors.forestMuted }]}>
          Your club’s upcoming classes and events.
        </Text>
        <View pointerEvents="none" style={[styles.orbit, { borderColor: colors.forestRing }]} />
      </View>

      <View style={styles.sectionRow}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Coming up</Text>
        <Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>
          {events.length} {events.length === 1 ? 'EVENT' : 'EVENTS'}
        </Text>
      </View>

      {eventsQuery.isPending ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Loading club events…</Text>
        </View>
      ) : events.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="calendar" size={20} color={colors.primary} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nothing scheduled yet</Text>
          <Text style={[styles.emptyCopy, { color: colors.mutedForeground }]}>
            Published MyGym events will appear here.
          </Text>
        </View>
      ) : (
        events.map((event) => {
          const isGoing = event.registrationStatus === 'confirmed';
          const isBusy = registrationMutation.isPending &&
            registrationMutation.variables?.eventId === event.id;
          const eventDateLabel = formatDate(event.startsAt, {
            weekday: 'short',
            day: 'numeric',
          }).toUpperCase();
          const eventTime = formatDate(event.startsAt, { hour: 'numeric', minute: '2-digit' });
          const spotsLabel = isGoing
            ? 'YOU’RE GOING'
            : event.remainingSlots === 0
              ? 'FULL'
              : `${event.remainingSlots} ${event.remainingSlots === 1 ? 'SPOT' : 'SPOTS'} LEFT`;
          return (
            <View key={event.id} style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.eventTop}>
                <View style={[styles.eventIcon, { backgroundColor: colors.accent }]}>
                  <Feather name="calendar" size={17} color={colors.primary} />
                </View>
                <View style={styles.eventHeading}>
                  <Text style={[styles.category, { color: colors.primary }]}>MYGYM EVENT</Text>
                  <Text style={[styles.eventTitle, { color: colors.foreground }]}>{event.name}</Text>
                </View>
                <View style={[styles.dayBadge, { backgroundColor: colors.background }]}>
                  <Text style={[styles.dayBadgeText, { color: colors.foreground }]}>{eventDateLabel}</Text>
                </View>
              </View>
              <View style={[styles.eventRule, { backgroundColor: colors.border }]} />
              <View style={styles.eventMetaRow}>
                <View style={styles.metaItem}>
                  <Feather name="clock" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.metaText, { color: colors.foreground }]}>{eventTime}</Text>
                </View>
                <View style={[styles.durationPill, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.durationText, { color: colors.secondaryForeground }]}>
                    {eventDuration(event.startsAt, event.endsAt)}
                  </Text>
                </View>
                <Text style={[styles.spotsText, { color: isGoing ? colors.gold : colors.mutedForeground }]}>
                  {spotsLabel}
                </Text>
              </View>
              {event.description || event.instructorName ? (
                <Text style={[styles.description, { color: colors.mutedForeground }]}>
                  {[event.description, event.instructorName ? `Coach: ${event.instructorName}` : null]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              ) : null}
              <View style={styles.eventBottom}>
                <Text style={[styles.placeText, { color: colors.mutedForeground }]}>
                  {event.registeredCount} / {event.capacity} booked
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${isGoing ? 'Cancel attendance for' : 'Join'} ${event.name}`}
                  accessibilityState={{ selected: isGoing, disabled: isBusy || (!isGoing && event.remainingSlots === 0) }}
                  disabled={isBusy || (!isGoing && event.remainingSlots === 0)}
                  onPress={() => registrationMutation.mutate({ eventId: event.id, join: !isGoing })}
                  style={({ pressed }) => [
                    styles.joinButton,
                    {
                      backgroundColor: isGoing ? colors.secondary : colors.primary,
                      opacity: isBusy ? 0.55 : pressed ? 0.78 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.joinText, { color: isGoing ? colors.primary : colors.primaryForeground }]}>
                    {isBusy ? 'Saving…' : isGoing ? 'Going' : 'Join event'}
                  </Text>
                  <Feather name={isGoing ? 'check' : 'arrow-right'} size={13} color={isGoing ? colors.primary : colors.primaryForeground} />
                </Pressable>
              </View>
            </View>
          );
        })
      )}

      {registrationMutation.error ? (
        <View style={[styles.errorNotice, { backgroundColor: colors.warm }]}>
          <Feather name="alert-circle" size={13} color={colors.gold} />
          <Text style={[styles.noteText, { color: colors.foreground }]}>
            {formatMemberApiError(registrationMutation.error)}
          </Text>
        </View>
      ) : null}
      {eventsQuery.error ? (
        <Text accessibilityRole="alert" style={[styles.errorText, { color: colors.destructive }]}>
          {formatMemberApiError(eventsQuery.error)}
        </Text>
      ) : null}
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
  description: { fontSize: 10, lineHeight: 15, marginTop: 11 },
  eventBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 8 },
  placeText: { flex: 1, fontSize: 9 },
  joinButton: { borderRadius: 11, minHeight: 35, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  joinText: { fontSize: 9, fontWeight: '700' },
  emptyState: { borderWidth: 1, borderRadius: 19, padding: 20, alignItems: 'center', marginTop: 4 },
  emptyTitle: { fontSize: 13, fontWeight: '700', marginTop: 8 },
  emptyCopy: { fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 5 },
  errorNotice: { borderRadius: 13, paddingHorizontal: 11, paddingVertical: 10, flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 4 },
  noteText: { flex: 1, fontSize: 9, lineHeight: 14 },
  errorText: { fontSize: 11, textAlign: 'center', marginTop: 8 },
});
