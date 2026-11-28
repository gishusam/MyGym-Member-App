import React, { useEffect, useMemo, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useColors } from '@/hooks/useColors';
import { formatMemberApiError, MemberWorkout, WorkoutSession } from '@/lib/member-api';
import { useMemberApi } from '@/lib/useMemberApi';

type EntryState = {
  weight: string;
  reps: string;
  duration: string;
  completed: boolean;
};

function triggerHaptic() {
  if (Platform.OS !== 'web') void Haptics.selectionAsync();
}

function gymDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function sessionDateLabel(session: WorkoutSession) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi',
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${session.sessionDate}T12:00:00+03:00`));
}

export default function WorkoutsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const api = useMemberApi();
  const queryClient = useQueryClient();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [entryState, setEntryState] = useState<Record<string, EntryState>>({});
  const currentDate = gymDateKey();

  const workoutsQuery = useQuery({
    queryKey: ['member', 'workouts'],
    queryFn: () => api<MemberWorkout[]>('/member/workouts'),
  });
  const workouts = workoutsQuery.data ?? [];
  const activeWorkout =
    workouts.find((workout) => workout.id === selectedAssignmentId) ?? workouts[0] ?? null;
  const todaySession = activeWorkout?.sessions.find((item) => item.sessionDate === currentDate);
  const completedCount = activeWorkout
    ? activeWorkout.exercises.filter((exercise) => entryState[exercise.id]?.completed).length
    : 0;
  const allComplete =
    Boolean(activeWorkout?.exercises.length) &&
    completedCount === (activeWorkout?.exercises.length ?? 0);
  const sessions = useMemo(
    () =>
      workouts
        .flatMap((workout) =>
          workout.sessions.map((session) => ({ ...session, workoutName: workout.programName })),
        )
        .sort((a, b) => b.sessionDate.localeCompare(a.sessionDate)),
    [workouts],
  );

  const saveMutation = useMutation({
    mutationFn: ({
      assignmentId,
      exercises,
    }: {
      assignmentId: string;
      exercises: {
        exerciseId: string;
        completed: boolean;
        weightKg: number | null;
        repsCompleted: number | null;
        durationSecondsCompleted: number | null;
      }[];
    }) =>
      api<WorkoutSession>(`/member/workouts/${assignmentId}/sessions`, {
        method: 'POST',
        body: JSON.stringify({ exercises }),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['member', 'workouts'] }),
        queryClient.invalidateQueries({ queryKey: ['member', 'progress'] }),
      ]);
    },
  });

  useEffect(() => {
    if (!activeWorkout) {
      setEntryState({});
      return;
    }
    const savedById = new Map(todaySession?.exercises.map((item) => [item.exerciseId, item]));
    const initial: Record<string, EntryState> = {};
    for (const exercise of activeWorkout.exercises) {
      const saved = savedById.get(exercise.id);
      initial[exercise.id] = {
        weight: saved?.weightKg == null ? '' : String(saved.weightKg),
        reps: saved?.repsCompleted == null ? '' : String(saved.repsCompleted),
        duration: saved?.durationSecondsCompleted == null ? '' : String(saved.durationSecondsCompleted),
        completed: saved?.completed ?? false,
      };
    }
    setEntryState(initial);
  }, [activeWorkout, todaySession]);

  const persistSession = async (
    exerciseStates: Record<string, EntryState>,
    completeAll = false,
  ) => {
    if (!activeWorkout) return;
    try {
      const exercises = activeWorkout.exercises.map((exercise) => {
        const state = exerciseStates[exercise.id] ?? {
          weight: '',
          reps: '',
          duration: '',
          completed: false,
        };
        return {
          exerciseId: exercise.id,
          completed: completeAll || state.completed,
          weightKg: state.weight ? Number(state.weight) : null,
          repsCompleted:
            exercise.repetitions == null || !state.reps ? null : Number(state.reps),
          durationSecondsCompleted:
            exercise.durationSeconds == null || !state.duration
              ? null
              : Number(state.duration),
        };
      });
      await saveMutation.mutateAsync({ assignmentId: activeWorkout.id, exercises });
    } catch {
      // The mutation's error is rendered below; don't present an unsaved log as complete.
    }
  };

  const setExerciseValue = (
    id: string,
    key: 'weight' | 'reps' | 'duration',
    value: string,
  ) => {
    const pattern = key === 'weight' ? /^\d{0,4}([.]\d{0,2})?$/ : /^\d{0,5}$/;
    if (!pattern.test(value)) return;
    setEntryState((previous) => ({
      ...previous,
      [id]: {
        weight: previous[id]?.weight ?? '',
        reps: previous[id]?.reps ?? '',
        duration: previous[id]?.duration ?? '',
        completed: previous[id]?.completed ?? false,
        [key]: value,
      },
    }));
  };

  const toggleExercise = async (exerciseId: string) => {
    triggerHaptic();
    const next = {
      ...entryState,
      [exerciseId]: {
        weight: entryState[exerciseId]?.weight ?? '',
        reps: entryState[exerciseId]?.reps ?? '',
        duration: entryState[exerciseId]?.duration ?? '',
        completed: !entryState[exerciseId]?.completed,
      },
    };
    setEntryState(next);
    await persistSession(next);
  };

  const completeSession = async () => {
    if (!activeWorkout) return;
    const next: Record<string, EntryState> = {};
    activeWorkout.exercises.forEach((exercise) => {
      next[exercise.id] = {
        weight: entryState[exercise.id]?.weight ?? '',
        reps: entryState[exercise.id]?.reps ?? '',
        duration: entryState[exercise.id]?.duration ?? '',
        completed: true,
      };
    });
    setEntryState(next);
    triggerHaptic();
    await persistSession(next, true);
  };

  const error = workoutsQuery.error ?? saveMutation.error;
  const saveLabel = workoutsQuery.isPending
    ? 'Loading your trainer-approved plan…'
    : saveMutation.isPending
      ? 'Saving to your MyGym account…'
      : saveMutation.isSuccess
        ? 'Saved to your MyGym account'
        : error
          ? 'Not saved'
          : 'Your sessions are private to you';

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topInset + 20 }]}
      bottomOffset={24}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.accentForeground }]}>YOUR TRAINING</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Workouts</Text>
        </View>
        <View style={[styles.logBadge, { backgroundColor: colors.accent }]}>
          <Feather name="check-circle" size={14} color={colors.primary} />
          <Text style={[styles.logBadgeText, { color: colors.primary }]}>{sessions.length} logged</Text>
        </View>
      </View>
      <Text style={[styles.intro, { color: colors.mutedForeground }]}>
        One good session at a time.
      </Text>

      <View style={styles.sectionRow}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Assigned by your trainer</Text>
        <Text style={[styles.weekLabel, { color: colors.mutedForeground }]}>
          {workouts.length} {workouts.length === 1 ? 'PLAN' : 'PLANS'}
        </Text>
      </View>
      {workouts.length ? (
        <View style={[styles.planList, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {workouts.map((workout) => {
            const selected = activeWorkout?.id === workout.id;
            return (
              <Pressable
                key={workout.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => {
                  triggerHaptic();
                  setSelectedAssignmentId(workout.id);
                }}
                style={[
                  styles.planChoice,
                  selected && { backgroundColor: colors.forestMid },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.planName, { color: selected ? colors.primaryForeground : colors.foreground }]}>
                    {workout.programName}
                  </Text>
                  <Text style={[styles.planGoal, { color: selected ? colors.forestText : colors.mutedForeground }]}>
                    {workout.goal} · {workout.recommendedDaysPerWeek} days/week
                  </Text>
                </View>
                <Feather
                  name={selected ? 'check-circle' : 'chevron-right'}
                  size={17}
                  color={selected ? colors.primaryForeground : colors.mutedForeground}
                />
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={[styles.restCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.restIcon, { backgroundColor: colors.accent }]}>
            <Feather name="activity" size={19} color={colors.primary} />
          </View>
          <Text style={[styles.restTitle, { color: colors.foreground }]}>
            {workoutsQuery.isPending ? 'Loading your plan…' : 'No workout assigned yet'}
          </Text>
          <Text style={[styles.restCopy, { color: colors.mutedForeground }]}>
            {workoutsQuery.isPending
              ? 'Your trainer-approved sessions will show here.'
              : 'When your trainer assigns a program, it will appear here.'}
          </Text>
        </View>
      )}

      {activeWorkout ? (
        <>
          <View style={[styles.sessionHeading, { backgroundColor: colors.accent }]}>
            <View style={styles.sessionTop}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sectionOverline, { color: colors.gold }]}>
                  TODAY · {activeWorkout.status.replace('_', ' ').toUpperCase()}
                </Text>
                <Text style={[styles.sessionTitle, { color: colors.foreground }]}>
                  {activeWorkout.programName}
                </Text>
                <Text style={[styles.heroCopy, { color: colors.secondaryForeground }]}>
                  {activeWorkout.exercises.length} movements · {completedCount} completed
                </Text>
              </View>
              <View style={[styles.durationBadge, { backgroundColor: colors.card }]}>
                <Feather name="clock" size={13} color={colors.gold} />
                <Text style={[styles.durationText, { color: colors.foreground }]}>
                  {activeWorkout.expectedSessionMinutes} min
                </Text>
              </View>
            </View>
            <View style={[styles.progressLine, { backgroundColor: colors.card }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.forestMid,
                    width: `${activeWorkout.exercises.length ? (completedCount / activeWorkout.exercises.length) * 100 : 0}%`,
                  },
                ]}
              />
            </View>
          </View>

          {activeWorkout.notes ? (
            <View style={[styles.trainerNote, { backgroundColor: colors.warm }]}>
              <Feather name="message-circle" size={13} color={colors.gold} />
              <Text style={[styles.noteText, { color: colors.foreground }]}>
                Trainer note: {activeWorkout.notes}
              </Text>
            </View>
          ) : null}

          <View style={styles.exerciseList}>
            {activeWorkout.exercises.map((exercise, index) => {
              const state = entryState[exercise.id];
              const done = Boolean(state?.completed);
              const target = exercise.repetitions
                ? `${exercise.sets} sets · ${exercise.repetitions} reps`
                : `${exercise.sets} sets · ${Math.ceil((exercise.durationSeconds ?? 0) / 60)} min`;
              const quantityLabel = exercise.repetitions ? 'REPS DONE' : 'SECONDS DONE';
              const quantityValue = exercise.repetitions ? state?.reps ?? '' : state?.duration ?? '';
              return (
                <View key={exercise.id} style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.exerciseTop}>
                    <View style={[styles.exerciseIndex, { backgroundColor: done ? colors.accent : colors.muted }]}>
                      {done
                        ? <Feather name="check" size={14} color={colors.primary} />
                        : <Text style={[styles.exerciseIndexText, { color: colors.mutedForeground }]}>{String(index + 1).padStart(2, '0')}</Text>}
                    </View>
                    <View style={styles.exerciseNameWrap}>
                      <Text style={[styles.exerciseName, { color: colors.foreground }]}>{exercise.name}</Text>
                      <Text style={[styles.exerciseTarget, { color: colors.mutedForeground }]}>{target}</Text>
                    </View>
                    <Pressable
                      accessibilityRole="checkbox"
                      accessibilityLabel={`Mark ${exercise.name} ${done ? 'incomplete' : 'complete'}`}
                      accessibilityState={{ checked: done }}
                      disabled={saveMutation.isPending}
                      onPress={() => void toggleExercise(exercise.id)}
                      style={[
                        styles.checkButton,
                        { backgroundColor: done ? colors.primary : colors.background, borderColor: done ? colors.primary : colors.border },
                      ]}
                    >
                      {done && <Feather name="check" size={15} color={colors.primaryForeground} />}
                    </Pressable>
                  </View>
                  <View style={styles.inputRow}>
                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>WEIGHT · KG</Text>
                      <View style={[styles.inputShell, { borderColor: colors.border, backgroundColor: colors.background }]}>
                        <TextInput
                          accessibilityLabel={`${exercise.name} weight in kilograms`}
                          value={state?.weight ?? ''}
                          onChangeText={(value) => setExerciseValue(exercise.id, 'weight', value)}
                          keyboardType="decimal-pad"
                          maxLength={7}
                          style={[styles.input, { color: colors.foreground }]}
                          placeholder="—"
                          placeholderTextColor={colors.mutedForeground}
                        />
                      </View>
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>{quantityLabel}</Text>
                      <View style={[styles.inputShell, { borderColor: colors.border, backgroundColor: colors.background }]}>
                        <TextInput
                          accessibilityLabel={`${exercise.name} ${quantityLabel.toLowerCase()}`}
                          value={quantityValue}
                          onChangeText={(value) =>
                            setExerciseValue(exercise.id, exercise.repetitions ? 'reps' : 'duration', value)
                          }
                          keyboardType="number-pad"
                          maxLength={5}
                          style={[styles.input, { color: colors.foreground }]}
                          placeholder="—"
                          placeholderTextColor={colors.mutedForeground}
                        />
                      </View>
                    </View>
                    <Text style={[styles.inputSuffix, { color: colors.mutedForeground }]}>
                      {exercise.repetitions ? 'reps' : 'sec'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={saveMutation.isPending}
            onPress={() => {
              triggerHaptic();
              void persistSession(entryState);
            }}
            style={({ pressed }) => [
              styles.saveWorkoutButton,
              {
                borderColor: colors.border,
                backgroundColor: colors.card,
                opacity: saveMutation.isPending ? 0.55 : pressed ? 0.75 : 1,
              },
            ]}
          >
            <Feather name="bookmark" size={15} color={colors.primary} />
            <Text style={[styles.saveWorkoutText, { color: colors.primary }]}>Save workout log</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: allComplete || saveMutation.isPending }}
            disabled={allComplete || saveMutation.isPending}
            onPress={() => void completeSession()}
            style={({ pressed }) => [
              styles.completeButton,
              { backgroundColor: allComplete ? colors.forestMid : colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Feather name={allComplete ? 'check-circle' : 'check'} size={17} color={colors.primaryForeground} />
            <Text style={[styles.completeButtonText, { color: colors.primaryForeground }]}>
              {allComplete ? 'Session complete' : 'Complete session'}
            </Text>
          </Pressable>
        </>
      ) : null}

      <View style={styles.saveRow}>
        <Feather name={error ? 'alert-circle' : 'lock'} size={13} color={error ? colors.destructive : colors.mutedForeground} />
        <Text style={[styles.saveText, { color: error ? colors.destructive : colors.mutedForeground }]}>
          {saveLabel}
        </Text>
      </View>
      {error ? (
        <Text accessibilityRole="alert" style={[styles.errorText, { color: colors.destructive }]}>
          {formatMemberApiError(error)}
        </Text>
      ) : null}

      {sessions.length > 0 ? (
        <View style={styles.historySection}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent sessions</Text>
          {sessions.slice(0, 4).map((session) => (
            <View key={session.id} style={[styles.historyRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.historyIcon, { backgroundColor: colors.accent }]}>
                <Feather name={session.status === 'completed' ? 'check' : 'clock'} size={14} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.historyTitle, { color: colors.foreground }]}>{session.workoutName}</Text>
                <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>
                  {sessionDateLabel(session)} · {session.exercises.filter((item) => item.completed).length} exercises
                </Text>
              </View>
              <Text style={[styles.historyComplete, { color: colors.accentForeground }]}>
                {session.status === 'completed' ? 'DONE' : 'IN PROGRESS'}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
      <View style={{ height: 120 }} />
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 22, paddingBottom: 28 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { fontSize: 10, letterSpacing: 1.5, fontWeight: '700', marginBottom: 7 },
  title: { fontSize: 31, letterSpacing: -1, fontWeight: '700' },
  intro: { fontSize: 13, marginTop: 7 },
  logBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 13, paddingHorizontal: 11, paddingVertical: 8 },
  logBadgeText: { fontSize: 10, fontWeight: '700' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, marginBottom: 12 },
  sectionTitle: { fontSize: 18, letterSpacing: -0.3, fontWeight: '700' },
  weekLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  planList: { borderWidth: 1, borderRadius: 19, padding: 7 },
  planChoice: { minHeight: 58, borderRadius: 13, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  planName: { fontSize: 11, fontWeight: '700' },
  planGoal: { fontSize: 9, marginTop: 4, textTransform: 'capitalize' },
  sessionHeading: { borderRadius: 20, padding: 15, marginTop: 23, marginBottom: 16 },
  sessionTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionOverline: { fontSize: 8, letterSpacing: 1, fontWeight: '700', marginBottom: 5 },
  sessionTitle: { fontSize: 20, letterSpacing: -0.45, fontWeight: '700' },
  heroCopy: { fontSize: 9, marginTop: 5 },
  durationBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 11, paddingHorizontal: 9, paddingVertical: 7 },
  durationText: { fontSize: 9, fontWeight: '600' },
  progressLine: { height: 5, borderRadius: 3, overflow: 'hidden', marginTop: 13 },
  progressFill: { height: 5, borderRadius: 3 },
  trainerNote: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', borderRadius: 13, padding: 11, marginBottom: 12 },
  noteText: { flex: 1, fontSize: 10, lineHeight: 15 },
  exerciseList: { gap: 10 },
  exerciseCard: { borderWidth: 1, borderRadius: 19, padding: 14 },
  exerciseTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  exerciseIndex: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  exerciseIndexText: { fontSize: 9, fontWeight: '700' },
  exerciseNameWrap: { flex: 1 },
  exerciseName: { fontSize: 13, fontWeight: '700', letterSpacing: -0.15 },
  exerciseTarget: { fontSize: 10, marginTop: 3 },
  checkButton: { width: 29, height: 29, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 9, marginTop: 14, paddingLeft: 44 },
  inputGroup: { flex: 1 },
  inputLabel: { fontSize: 8, letterSpacing: 0.75, fontWeight: '700', marginBottom: 6 },
  inputShell: { height: 39, borderWidth: 1, borderRadius: 11, justifyContent: 'center' },
  input: { paddingHorizontal: 11, paddingVertical: 0, fontSize: 13, fontWeight: '600', height: '100%' },
  inputSuffix: { fontSize: 9, paddingBottom: 12, marginLeft: -3 },
  completeButton: { minHeight: 52, borderRadius: 17, marginTop: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9 },
  completeButtonText: { fontSize: 13, fontWeight: '700' },
  saveWorkoutButton: { minHeight: 46, borderWidth: 1, borderRadius: 15, marginTop: 15, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  saveWorkoutText: { fontSize: 11, fontWeight: '700' },
  restCard: { borderWidth: 1, borderRadius: 20, padding: 21, marginTop: 4 },
  restIcon: { width: 43, height: 43, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  restTitle: { fontSize: 17, fontWeight: '700', marginTop: 15 },
  restCopy: { fontSize: 12, lineHeight: 18, marginTop: 6 },
  saveRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 17 },
  saveText: { fontSize: 10 },
  errorText: { fontSize: 11, textAlign: 'center', marginTop: 6 },
  historySection: { marginTop: 29 },
  historyRow: { minHeight: 61, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 11 },
  historyIcon: { width: 31, height: 31, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  historyTitle: { fontSize: 11, fontWeight: '700' },
  historyDate: { fontSize: 9, marginTop: 3 },
  historyComplete: { fontSize: 8, fontWeight: '700', letterSpacing: 0.7 },
});
