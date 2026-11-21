import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useColors } from '@/hooks/useColors';

const LOG_KEY = '@mygym/workout-logs-v1';
const days = [
  { day: 'MON', title: 'Strength foundations', focus: 'Upper body', duration: '45 min', exercises: [
    { id: 'bench', name: 'Barbell bench press', sets: 3, reps: '8–10', weight: '40' },
    { id: 'row', name: 'Seated cable row', sets: 3, reps: '10–12', weight: '32.5' },
    { id: 'press', name: 'Dumbbell shoulder press', sets: 3, reps: '8–10', weight: '10' },
    { id: 'pulldown', name: 'Lat pulldown', sets: 3, reps: '10–12', weight: '35' },
  ] },
  { day: 'TUE', title: 'Easy miles', focus: 'Cardio', duration: '30 min', exercises: [] },
  { day: 'WED', title: 'Lower body strength', focus: 'Lower body', duration: '50 min', exercises: [
    { id: 'squat', name: 'Goblet squat', sets: 4, reps: '8–10', weight: '20' },
    { id: 'rdl', name: 'Dumbbell Romanian deadlift', sets: 3, reps: '10–12', weight: '16' },
    { id: 'lunge', name: 'Reverse lunge', sets: 3, reps: '8 / side', weight: '8' },
  ] },
  { day: 'THU', title: 'Rest & recover', focus: 'Recovery', duration: 'Optional', exercises: [] },
  { day: 'FRI', title: 'Strength foundations', focus: 'Upper body', duration: '45 min', exercises: [
    { id: 'deadlift', name: 'Kettlebell deadlift', sets: 3, reps: '10–12', weight: '24' },
    { id: 'pushup', name: 'Incline push-up', sets: 3, reps: '8–12', weight: '0' },
    { id: 'carry', name: 'Farmer carry', sets: 3, reps: '30 sec', weight: '16' },
  ] },
  { day: 'SAT', title: 'Open gym', focus: 'Your choice', duration: 'Flexible', exercises: [] },
  { day: 'SUN', title: 'Rest day', focus: 'Recovery', duration: 'Take a breath', exercises: [] },
];

type Exercise = (typeof days)[number]['exercises'][number];
type ScheduledDay = (typeof days)[number] & { date: Date; dateKey: string; month: string };
type WorkoutLog = {
  id: string;
  date: string;
  workout: string;
  completedAt: string;
  exercises: { id: string; weight: string; reps: string; completed: boolean }[];
};
type EntryState = { weight: string; reps: string; completed: boolean };
type SaveState = 'loading' | 'ready' | 'saving' | 'saved' | 'error';

function triggerHaptic() {
  if (Platform.OS !== 'web') {
    void Haptics.selectionAsync();
  }
}

function getScheduledWeek(): ScheduledDay[] {
  const today = new Date();
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return days.map((day, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return {
      ...day,
      date,
      dateKey,
      month: new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(date).toUpperCase(),
    };
  });
}

export default function WorkoutsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const [selectedDay, setSelectedDay] = useState((new Date().getDay() + 6) % 7);
  const scheduledWeek = useMemo(getScheduledWeek, []);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [entryState, setEntryState] = useState<Record<string, EntryState>>({});
  const [saveState, setSaveState] = useState<SaveState>('loading');
  const [error, setError] = useState('');
  const activeDay = scheduledWeek[selectedDay] ?? scheduledWeek[0];
  const isTrainingDay = activeDay.exercises.length > 0;
  const completedCount = activeDay.exercises.filter((exercise) => entryState[exercise.id]?.completed).length;
  const allComplete = isTrainingDay && completedCount === activeDay.exercises.length;
  const currentDate = activeDay.dateKey;
  const existingLog = useMemo(() => logs.find((log) => log.id === `${currentDate}-${activeDay.title}`), [logs, currentDate, activeDay.title]);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(LOG_KEY)
      .then((raw) => {
        if (!mounted) return;
        if (raw) setLogs(JSON.parse(raw) as WorkoutLog[]);
        setSaveState('ready');
      })
      .catch(() => {
        if (mounted) {
          setSaveState('error');
          setError('Your saved sessions could not be loaded. You can still complete a workout.');
        }
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const initial: Record<string, EntryState> = {};
    activeDay.exercises.forEach((exercise) => {
      const saved = existingLog?.exercises.find((item) => item.id === exercise.id);
      initial[exercise.id] = {
        weight: saved?.weight ?? exercise.weight,
        reps: saved?.reps ?? exercise.reps.split(/[–/ ]/)[0],
        completed: saved?.completed ?? false,
      };
    });
    setEntryState(initial);
  }, [activeDay, existingLog]);

  const persistLog = useCallback(async (exerciseStates: Record<string, EntryState>, completeAll = false) => {
    const exercises: WorkoutLog['exercises'] = activeDay.exercises.map((exercise) => ({
      id: exercise.id,
      weight: exerciseStates[exercise.id]?.weight ?? exercise.weight,
      reps: exerciseStates[exercise.id]?.reps ?? exercise.reps.split(/[–/ ]/)[0],
      completed: completeAll || Boolean(exerciseStates[exercise.id]?.completed),
    }));
    const log: WorkoutLog = {
      id: `${currentDate}-${activeDay.title}`,
      date: currentDate,
      workout: activeDay.title,
      completedAt: new Date().toISOString(),
      exercises,
    };
    const next = [log, ...logs.filter((item) => item.id !== log.id)];
    setSaveState('saving');
    setError('');
    setLogs(next);
    try {
      await AsyncStorage.setItem(LOG_KEY, JSON.stringify(next));
      setSaveState('saved');
    } catch {
      setSaveState('error');
      setError('Could not save this session on your device. Please try again.');
    }
  }, [activeDay, currentDate, logs]);

  const setExerciseValue = (id: string, key: 'weight' | 'reps', value: string) => {
    if (!/^\d{0,3}([.]\d{0,1})?$/.test(value)) return;
    setEntryState((previous) => ({
      ...previous,
      [id]: { ...previous[id], [key]: value, completed: previous[id]?.completed ?? false },
    }));
    setSaveState('ready');
  };

  const toggleExercise = async (exercise: Exercise) => {
    triggerHaptic();
    const next = {
      ...entryState,
      [exercise.id]: { ...entryState[exercise.id], completed: !entryState[exercise.id]?.completed },
    };
    setEntryState(next);
    await persistLog(next);
  };

  const completeSession = async () => {
    if (!isTrainingDay) return;
    const next: Record<string, EntryState> = {};
    activeDay.exercises.forEach((exercise) => {
      next[exercise.id] = { ...entryState[exercise.id], completed: true };
    });
    setEntryState(next);
    triggerHaptic();
    await persistLog(next, true);
  };

  const statusLabel = saveState === 'loading' ? 'Loading your logs…'
    : saveState === 'saving' ? 'Saving on this device…'
      : saveState === 'saved' ? 'Saved on this device'
        : saveState === 'error' ? 'Not saved' : 'Workout log stays on this device';

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
          <Text style={[styles.logBadgeText, { color: colors.primary }]}>{logs.length} logged</Text>
        </View>
      </View>
      <Text style={[styles.intro, { color: colors.mutedForeground }]}>One good session at a time.</Text>

      <View style={styles.sectionRow}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>This week</Text>
        <Text style={[styles.weekLabel, { color: colors.mutedForeground }]}>
          {`${scheduledWeek[0].date.getDate()} ${scheduledWeek[0].month} — ${scheduledWeek[6].date.getDate()} ${scheduledWeek[6].month}`}
        </Text>
      </View>
      <View style={[styles.weekStrip, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {scheduledWeek.map((day, index) => {
          const selected = index === selectedDay;
          const logged = logs.some((log) => log.date === day.dateKey);
          return (
            <Pressable
              key={day.day}
              testID={`workout-day-${day.day.toLowerCase()}`}
              accessibilityRole="button"
              accessibilityLabel={`${day.day}, ${day.month} ${day.date.getDate()}${logged ? ', workout logged' : ''}`}
              accessibilityState={{ selected }}
              onPress={() => { triggerHaptic(); setSelectedDay(index); }}
              style={({ pressed }) => [
                styles.dayButton,
                 selected && { backgroundColor: colors.forestMid },
                pressed && { opacity: 0.75 },
              ]}
            >
              <Text style={[styles.dayName, { color: selected ? colors.primaryForeground : colors.mutedForeground }]}>{day.day}</Text>
              <Text style={[styles.dayDate, { color: selected ? colors.primaryForeground : colors.foreground }]}>{day.date.getDate()}</Text>
              <View style={[styles.dayIndicator, { backgroundColor: logged ? (selected ? colors.lime : colors.forestMid) : 'transparent' }]} />
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.sessionHeading, { backgroundColor: colors.accent }]}>
        <View style={styles.sessionTop}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionOverline, { color: colors.gold }]}>{activeDay.day}, {activeDay.month} {activeDay.date.getDate()} · {activeDay.focus.toUpperCase()}</Text>
            <Text style={[styles.sessionTitle, { color: colors.foreground }]}>{activeDay.title}</Text>
            <Text style={[styles.heroCopy, { color: colors.secondaryForeground }]}>
              {isTrainingDay ? `${activeDay.exercises.length} movements · ${completedCount} completed` : `${activeDay.focus} · ${activeDay.duration}`}
            </Text>
          </View>
          <View style={[styles.durationBadge, { backgroundColor: colors.card }]}>
            <Feather name="clock" size={13} color={colors.gold} />
            <Text style={[styles.durationText, { color: colors.foreground }]}>{activeDay.duration}</Text>
          </View>
        </View>
        {isTrainingDay && (
          <View style={[styles.progressLine, { backgroundColor: colors.card }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.forestMid, width: `${(completedCount / activeDay.exercises.length) * 100}%` }]} />
          </View>
        )}
      </View>

      {isTrainingDay ? (
        <>
          <View style={styles.exerciseList}>
            {activeDay.exercises.map((exercise, index) => {
              const done = Boolean(entryState[exercise.id]?.completed);
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
                      <Text style={[styles.exerciseTarget, { color: colors.mutedForeground }]}>{exercise.sets} sets · {exercise.reps} reps</Text>
                    </View>
                    <Pressable
                      testID={`exercise-complete-${exercise.id}`}
                      accessibilityRole="checkbox"
                      accessibilityLabel={`Mark ${exercise.name} ${done ? 'incomplete' : 'complete'}`}
                      accessibilityState={{ checked: done }}
                      onPress={() => void toggleExercise(exercise)}
                      style={({ pressed }) => [
                        styles.checkButton,
                        { backgroundColor: done ? colors.primary : colors.background, borderColor: done ? colors.primary : colors.border },
                        pressed && { opacity: 0.7 },
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
                          testID={`exercise-weight-${exercise.id}`}
                          accessibilityLabel={`${exercise.name} weight in kilograms`}
                          value={entryState[exercise.id]?.weight ?? exercise.weight}
                          onChangeText={(value) => setExerciseValue(exercise.id, 'weight', value)}
                          keyboardType="decimal-pad"
                          maxLength={5}
                          style={[styles.input, { color: colors.foreground }]}
                          placeholder="0"
                          placeholderTextColor={colors.mutedForeground}
                        />
                      </View>
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>REPS DONE</Text>
                      <View style={[styles.inputShell, { borderColor: colors.border, backgroundColor: colors.background }]}>
                        <TextInput
                          testID={`exercise-reps-${exercise.id}`}
                          accessibilityLabel={`${exercise.name} completed repetitions`}
                          value={entryState[exercise.id]?.reps ?? exercise.reps.split(/[–/ ]/)[0]}
                          onChangeText={(value) => {
                            if (/^\d{0,2}$/.test(value)) setExerciseValue(exercise.id, 'reps', value);
                          }}
                          keyboardType="number-pad"
                          maxLength={2}
                          style={[styles.input, { color: colors.foreground }]}
                          placeholder="0"
                          placeholderTextColor={colors.mutedForeground}
                        />
                      </View>
                    </View>
                    <Text style={[styles.inputSuffix, { color: colors.mutedForeground }]}>reps</Text>
                  </View>
                </View>
              );
            })}
          </View>
          <Pressable
            testID="save-workout-log"
            accessibilityRole="button"
            accessibilityLabel="Save workout weights and repetitions"
            disabled={saveState === 'loading' || saveState === 'saving'}
            onPress={() => {
              triggerHaptic();
              void persistLog(entryState);
            }}
            style={({ pressed }) => [
              styles.saveWorkoutButton,
              {
                borderColor: colors.border,
                backgroundColor: colors.card,
                opacity: saveState === 'loading' || saveState === 'saving' ? 0.55 : pressed ? 0.75 : 1,
              },
            ]}
          >
            <Feather name="bookmark" size={15} color={colors.primary} />
            <Text style={[styles.saveWorkoutText, { color: colors.primary }]}>Save workout log</Text>
          </Pressable>
          <Pressable
            testID="complete-workout-button"
            accessibilityRole="button"
            accessibilityLabel={allComplete ? 'Workout completed' : 'Complete this workout'}
            accessibilityState={{ disabled: allComplete || saveState === 'loading' || saveState === 'saving' }}
            disabled={allComplete || saveState === 'loading' || saveState === 'saving'}
            onPress={() => void completeSession()}
            style={({ pressed }) => [
              styles.completeButton,
              { backgroundColor: allComplete ? colors.forestMid : colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Feather name={allComplete ? 'check-circle' : 'check'} size={17} color={colors.primaryForeground} />
            <Text style={[styles.completeButtonText, { color: colors.primaryForeground }]}>{allComplete ? 'Session complete' : 'Complete session'}</Text>
          </Pressable>
        </>
      ) : (
        <View style={[styles.restCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.restIcon, { backgroundColor: colors.accent }]}><Feather name={activeDay.focus === 'Recovery' ? 'wind' : 'sun'} size={19} color={colors.primary} /></View>
          <Text style={[styles.restTitle, { color: colors.foreground }]}>{activeDay.focus === 'Recovery' ? 'Recovery counts, too.' : 'Your day, your movement.'}</Text>
          <Text style={[styles.restCopy, { color: colors.mutedForeground }]}>{activeDay.focus === 'Recovery' ? 'Let your body adapt. A gentle stretch or a walk is plenty.' : 'No assigned session today. Explore the club or take it easy.'}</Text>
        </View>
      )}

      <View style={styles.saveRow}>
        <Feather name={saveState === 'error' ? 'alert-circle' : 'lock'} size={13} color={saveState === 'error' ? colors.destructive : colors.mutedForeground} />
        <Text style={[styles.saveText, { color: saveState === 'error' ? colors.destructive : colors.mutedForeground }]}>{statusLabel}</Text>
      </View>
      {error ? <Text accessibilityRole="alert" style={[styles.errorText, { color: colors.destructive }]}>{error}</Text> : null}

      {logs.length > 0 && (
        <View style={styles.historySection}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent sessions</Text>
          {logs.slice(0, 3).map((log) => (
            <View key={log.id} style={[styles.historyRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.historyIcon, { backgroundColor: colors.accent }]}><Feather name="check" size={14} color={colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.historyTitle, { color: colors.foreground }]}>{log.workout}</Text>
                <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>{new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(`${log.date}T12:00:00`))} · {log.exercises.filter((item) => item.completed).length} exercises</Text>
              </View>
              <Text style={[styles.historyComplete, { color: colors.accentForeground }]}>{log.exercises.every((item) => item.completed) ? 'DONE' : 'IN PROGRESS'}</Text>
            </View>
          ))}
        </View>
      )}
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
  weekStrip: { borderWidth: 1, borderRadius: 19, padding: 7, flexDirection: 'row', justifyContent: 'space-between' },
  dayButton: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 14 },
  dayName: { fontSize: 8, fontWeight: '700', letterSpacing: 0.4 },
  dayDate: { fontSize: 14, fontWeight: '700', marginTop: 5 },
  dayIndicator: { width: 4, height: 4, borderRadius: 2, marginTop: 5 },
  sessionHeading: { borderRadius: 20, padding: 15, marginTop: 23, marginBottom: 16 },
  sessionTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionOverline: { fontSize: 8, letterSpacing: 1, fontWeight: '700', marginBottom: 5 },
  sessionTitle: { fontSize: 20, letterSpacing: -0.45, fontWeight: '700' },
  heroCopy: { fontSize: 9, marginTop: 5 },
  durationBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 11, paddingHorizontal: 9, paddingVertical: 7 },
  durationText: { fontSize: 9, fontWeight: '600' },
  progressLine: { height: 5, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 5, borderRadius: 3 },
  completionText: { fontSize: 10, marginTop: 8, marginBottom: 12 },
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
