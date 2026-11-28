import React, { useMemo, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { useQuery } from '@tanstack/react-query';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { formatMemberApiError, MemberProgress } from '@/lib/member-api';
import { useMemberApi } from '@/lib/useMemberApi';

type Range = '3M' | '6M' | '1Y';
type Assessment = MemberProgress['assessments'][number];

function chartPath(values: number[]) {
  const left = 20;
  const right = 300;
  const top = 23;
  const bottom = 154;
  const minimum = Math.min(...values) - 0.6;
  const maximum = Math.max(...values) + 0.6;
  const points = values.map((value, index) => ({
    x: left + ((right - left) * index) / Math.max(values.length - 1, 1),
    y: bottom - ((value - minimum) / (maximum - minimum)) * (bottom - top),
  }));
  return {
    points,
    path: points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' '),
    area: `M ${points[0].x} ${bottom} ${points.map((point) => `L ${point.x} ${point.y}`).join(' ')} L ${points[points.length - 1].x} ${bottom} Z`,
  };
}

function shortDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi',
    month: 'short',
  }).format(new Date(value)).toUpperCase();
}

function measurementChange(current: number | null, previous: number | null, unit: string) {
  if (current == null || previous == null) return '—';
  const difference = current - previous;
  if (difference === 0) return `No change`;
  const sign = difference > 0 ? '+' : '−';
  return `${sign}${Math.abs(difference).toFixed(1)}${unit}`;
}

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const api = useMemberApi();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const [range, setRange] = useState<Range>('6M');
  const progressQuery = useQuery({
    queryKey: ['member', 'progress'],
    queryFn: () => api<MemberProgress>('/member/progress'),
  });
  const progress = progressQuery.data;
  const assessments = progress?.assessments ?? [];
  const daysBack = range === '3M' ? 92 : range === '6M' ? 183 : 366;
  const cutoff = Date.now() - daysBack * 24 * 60 * 60 * 1000;
  const weightAssessments = useMemo(
    () =>
      assessments
        .filter((item) => item.weightKg != null && new Date(item.recordedAt).getTime() >= cutoff)
        .slice()
        .reverse(),
    [assessments, cutoff],
  );
  const values = weightAssessments.map((item) => item.weightKg as number);
  const chart = values.length ? chartPath(values) : null;
  const current = assessments[0] ?? null;
  const previous = assessments[1] ?? null;
  const weightChange = measurementChange(current?.weightKg ?? null, previous?.weightKg ?? null, ' kg');
  const latestDate = current
    ? new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Nairobi', day: 'numeric', month: 'short', year: 'numeric' })
        .format(new Date(current.recordedAt))
        .toUpperCase()
    : 'NO ASSESSMENT YET';

  const rows: { label: string; value: number | null | undefined; unit: string; digits?: number }[] = [
    { label: 'Body weight', value: current?.weightKg, unit: ' kg', digits: 1 },
    { label: 'Height', value: current?.heightCm, unit: ' cm', digits: 1 },
    { label: 'BMI', value: current?.bmi, unit: '', digits: 1 },
    { label: 'Body fat', value: current?.bodyFatPercent, unit: '%', digits: 1 },
    { label: 'Muscle', value: current?.musclePercent, unit: '%', digits: 1 },
    { label: 'Visceral fat', value: current?.visceralFatLevel, unit: '', digits: 1 },
  ];
  const previousValues: Record<string, number | null | undefined> = {
    'Body weight': previous?.weightKg,
    Height: previous?.heightCm,
    BMI: previous?.bmi,
    'Body fat': previous?.bodyFatPercent,
    Muscle: previous?.musclePercent,
    'Visceral fat': previous?.visceralFatLevel,
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topInset + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.eyebrow, { color: colors.accentForeground }]}>SMALL WINS ADD UP</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>Progress</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Your recorded check-ins and assessment history.
      </Text>

      <View style={[styles.summaryCard, { backgroundColor: colors.forestDeep }]}>
        <View style={styles.summaryTop}>
          <View style={styles.summaryCopy}>
            <Text style={[styles.summaryOverline, { color: colors.forestCaption }]}>THIS MONTH</Text>
            <Text style={[styles.summaryTitle, { color: colors.forestText }]}>Keep building your rhythm.</Text>
            <Text style={[styles.summarySub, { color: colors.forestMuted }]}>
              Counts reflect records in your MyGym account.
            </Text>
          </View>
          <View
            testID="monthly-visits-ring"
            accessible
            accessibilityRole="image"
            accessibilityLabel={`${progress?.checkInsThisMonth ?? 0} gym visits recorded this month`}
            style={styles.ringWrap}
          >
            <Svg width={88} height={88} viewBox="0 0 88 88">
              <Circle cx="44" cy="44" r="35" fill="none" stroke={colors.forestRing} strokeWidth="7" />
              <Circle cx="44" cy="44" r="35" fill="none" stroke={colors.forestMid} strokeWidth="7" />
            </Svg>
            <View style={styles.ringCenter}>
              <Text style={[styles.ringNumber, { color: colors.forestText }]}>{progress?.checkInsThisMonth ?? 0}</Text>
              <Text style={[styles.ringCaption, { color: colors.forestCaption }]}>VISITS</Text>
            </View>
          </View>
        </View>
        <View style={[styles.summaryRule, { backgroundColor: colors.forestLine }]} />
        <View style={styles.summaryStats}>
          <View style={styles.summaryStat}>
            <Text style={[styles.summaryStatLabel, { color: colors.forestCaption }]}>BODY WEIGHT</Text>
            <Text style={[styles.summaryStatValue, { color: colors.forestText }]}>
              {current?.weightKg == null ? '—' : current.weightKg.toFixed(1)}
              {current?.weightKg != null ? <Text style={[styles.summaryUnit, { color: colors.forestMuted }]}> kg</Text> : null}
            </Text>
          </View>
          <View style={[styles.summaryStatDivider, { backgroundColor: colors.forestLine }]} />
          <View style={styles.summaryStat}>
            <Text style={[styles.summaryStatLabel, { color: colors.forestCaption }]}>WORKOUTS</Text>
            <Text style={[styles.summaryStatValue, { color: colors.forestMid }]}>
              {progress?.workoutsThisMonth ?? 0}
              <Text style={[styles.summaryUnit, { color: colors.forestMid }]}> this month</Text>
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.weightCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardTop}>
          <View>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>BODY WEIGHT</Text>
            <View style={styles.weightLine}>
              <Text style={[styles.weightNumber, { color: colors.foreground }]}>
                {current?.weightKg == null ? '—' : current.weightKg.toFixed(1)}
              </Text>
              <Text style={[styles.weightUnit, { color: colors.mutedForeground }]}>
                {current?.weightKg == null ? '' : 'kg'}
              </Text>
            </View>
          </View>
          <View style={[styles.changePill, { backgroundColor: colors.accent }]}>
            <Feather name="activity" size={13} color={colors.primary} />
            <Text style={[styles.changeText, { color: colors.primary }]}>{weightChange}</Text>
          </View>
        </View>
        <View style={[styles.rangeSwitch, { backgroundColor: colors.background }]}>
          {(['3M', '6M', '1Y'] as Range[]).map((item) => (
            <Pressable
              key={item}
              testID={`weight-range-${item.toLowerCase()}`}
              accessibilityRole="button"
              accessibilityLabel={`Show ${item === '1Y' ? 'one year' : item === '3M' ? 'three months' : 'six months'} of body weight history`}
              accessibilityState={{ selected: range === item }}
              onPress={() => setRange(item)}
              style={({ pressed }) => [
                styles.rangeButton,
                range === item && { backgroundColor: colors.card },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.rangeText, { color: range === item ? colors.primary : colors.mutedForeground }]}>{item}</Text>
            </Pressable>
          ))}
        </View>
        {progressQuery.isPending ? (
          <Text style={[styles.emptyChart, { color: colors.mutedForeground }]}>Loading your assessment history…</Text>
        ) : chart && values.length >= 2 ? (
          <View
            testID="body-weight-chart"
            accessible
            accessibilityRole="image"
            accessibilityLabel={`Recorded weight from ${values[0].toFixed(1)} to ${values[values.length - 1].toFixed(1)} kilograms over ${range}`}
            style={styles.chartWrap}
          >
            <Svg width="100%" height={190} viewBox="0 0 320 190" preserveAspectRatio="none">
              <Line x1="20" y1="55" x2="300" y2="55" stroke={colors.border} strokeWidth="1" strokeDasharray="3 5" />
              <Line x1="20" y1="105" x2="300" y2="105" stroke={colors.border} strokeWidth="1" strokeDasharray="3 5" />
              <Path d={chart.area} fill={colors.accent} fillOpacity={0.42} />
              <Path d={chart.path} fill="none" stroke={colors.forestMid} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              {chart.points.map((point, index) => (
                <Circle key={weightAssessments[index].id} cx={point.x} cy={point.y} r={index === chart.points.length - 1 ? 5 : 3} fill={index === chart.points.length - 1 ? colors.forestMid : colors.card} stroke={colors.forestMid} strokeWidth="2" />
              ))}
            </Svg>
            <View style={styles.chartLabels}>
              {weightAssessments.map((item) => (
                <Text key={item.id} style={[styles.chartLabel, { color: colors.mutedForeground }]}>
                  {shortDate(item.recordedAt)}
                </Text>
              ))}
            </View>
          </View>
        ) : (
          <Text style={[styles.emptyChart, { color: colors.mutedForeground }]}>
            {values.length === 1
              ? `One weight recorded: ${values[0].toFixed(1)} kg. Add another assessment to see a trend.`
              : 'No body-weight assessments in this range yet.'}
          </Text>
        )}
        <View style={[styles.chartFooter, { borderTopColor: colors.border }]}>
          <View style={[styles.chartLegendDot, { backgroundColor: colors.forestMid }]} />
          <Text style={[styles.chartLegendText, { color: colors.mutedForeground }]}>RECORDED ASSESSMENTS</Text>
          <Text style={[styles.updatedText, { color: colors.mutedForeground }]}>{latestDate}</Text>
        </View>
      </View>

      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Latest measurements</Text>
        <Text style={[styles.sectionAside, { color: colors.mutedForeground }]}>{latestDate}</Text>
      </View>
      {current ? (
        <View style={[styles.measureCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {rows.filter((row) => row.value != null).map((row, index, visibleRows) => {
            const value = row.value as number;
            const change = measurementChange(
              value,
              previousValues[row.label] == null ? null : previousValues[row.label] as number,
              row.unit,
            );
            return (
              <MeasurementRow
                key={row.label}
                label={row.label}
                value={`${value.toFixed(row.digits ?? 1)}${row.unit}`}
                change={change}
                last={index === visibleRows.length - 1}
                colors={colors}
              />
            );
          })}
        </View>
      ) : (
        <View style={[styles.emptyMeasurements, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="clipboard" size={17} color={colors.primary} />
          <Text style={[styles.emptyChart, { color: colors.mutedForeground }]}>
            {progressQuery.error
              ? formatMemberApiError(progressQuery.error)
              : 'Your trainer’s assessments will appear here.'}
          </Text>
        </View>
      )}

      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>This month</Text>
        <Text style={[styles.sectionAside, { color: colors.mutedForeground }]}>FROM YOUR RECORDS</Text>
      </View>
      <View style={styles.milestoneGrid}>
        <Milestone icon="calendar" title="Gym visits" detail={`${progress?.checkInsThisMonth ?? 0} recorded`} accent="green" colors={colors} />
        <Milestone icon="activity" title="Completed workouts" detail={`${progress?.workoutsThisMonth ?? 0} recorded`} accent="gold" colors={colors} />
        <Milestone icon="clipboard" title="Assessments" detail={`${assessments.length} on file`} accent="green" colors={colors} />
      </View>
      <View style={styles.privateNote}>
        <Feather name="lock" size={13} color={colors.mutedForeground} />
        <Text style={[styles.privateText, { color: colors.mutedForeground }]}>Your progress is private to you.</Text>
      </View>
      <View style={{ height: 115 }} />
    </ScrollView>
  );
}

function MeasurementRow({ label, value, change, last = false, colors }: {
  label: string;
  value: string;
  change: string;
  last?: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.measureRow, !last && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
      <Text style={[styles.measureName, { color: colors.foreground }]}>{label}</Text>
      <Text style={[styles.measureValue, { color: colors.foreground }]}>{value}</Text>
      <View style={[styles.measureChange, { backgroundColor: colors.accent }]}>
        <Text style={[styles.measureChangeText, { color: colors.primary }]}>{change}</Text>
      </View>
    </View>
  );
}

function Milestone({ icon, title, detail, accent, colors }: {
  icon: 'calendar' | 'activity' | 'clipboard';
  title: string;
  detail: string;
  accent: 'green' | 'gold';
  colors: ReturnType<typeof useColors>;
}) {
  const iconColor = accent === 'gold' ? colors.gold : colors.primary;
  const plateColor = accent === 'gold' ? colors.warm : colors.accent;
  return (
    <View style={[styles.milestoneCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.milestoneIcon, { backgroundColor: plateColor }]}>
        <Feather name={icon} size={16} color={iconColor} />
      </View>
      <Text style={[styles.milestoneTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.milestoneDetail, { color: colors.mutedForeground }]}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 22, paddingBottom: 28 },
  eyebrow: { fontSize: 10, letterSpacing: 1.5, fontWeight: '700', marginBottom: 8 },
  title: { fontSize: 31, letterSpacing: -1, fontWeight: '700' },
  subtitle: { fontSize: 13, lineHeight: 19, marginTop: 7, marginBottom: 22, maxWidth: 315 },
  summaryCard: { borderRadius: 22, padding: 17, marginBottom: 18 },
  summaryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  summaryCopy: { flex: 1 },
  summaryOverline: { fontSize: 8, letterSpacing: 1.1, fontWeight: '700' },
  summaryTitle: { fontSize: 16, letterSpacing: -0.3, fontWeight: '700', marginTop: 8 },
  summarySub: { fontSize: 9, lineHeight: 14, marginTop: 5, maxWidth: 165 },
  ringWrap: { width: 88, height: 88, alignItems: 'center', justifyContent: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  ringNumber: { fontSize: 22, lineHeight: 24, fontWeight: '700' },
  ringCaption: { fontSize: 7, letterSpacing: 0.6, fontWeight: '700', marginTop: 1 },
  summaryRule: { height: 1, marginTop: 13, marginBottom: 12 },
  summaryStats: { flexDirection: 'row', alignItems: 'center' },
  summaryStat: { flex: 1 },
  summaryStatLabel: { fontSize: 7, letterSpacing: 0.7, fontWeight: '700' },
  summaryStatValue: { fontSize: 15, fontWeight: '700', marginTop: 4 },
  summaryUnit: { fontSize: 9, fontWeight: '600' },
  summaryStatDivider: { width: 1, height: 28, marginHorizontal: 13 },
  weightCard: { borderWidth: 1, borderRadius: 22, padding: 16 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricLabel: { fontSize: 8, letterSpacing: 1.1, fontWeight: '700' },
  weightLine: { flexDirection: 'row', alignItems: 'baseline', gap: 5, marginTop: 5 },
  weightNumber: { fontSize: 32, fontWeight: '700', letterSpacing: -1 },
  weightUnit: { fontSize: 12, fontWeight: '600' },
  changePill: { borderRadius: 11, paddingHorizontal: 9, paddingVertical: 7, flexDirection: 'row', gap: 5, alignItems: 'center' },
  changeText: { fontSize: 10, fontWeight: '700' },
  rangeSwitch: { flexDirection: 'row', borderRadius: 11, padding: 3, alignSelf: 'flex-start', marginTop: 17, gap: 2 },
  rangeButton: { borderRadius: 8, paddingHorizontal: 11, paddingVertical: 6 },
  rangeText: { fontSize: 9, fontWeight: '700' },
  chartWrap: { marginTop: 12, width: '100%' },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -1, paddingHorizontal: 1 },
  chartLabel: { fontSize: 8, fontWeight: '700', letterSpacing: 0.5 },
  emptyChart: { fontSize: 10, lineHeight: 16, marginTop: 20 },
  chartFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, borderTopWidth: 1, paddingTop: 12, marginTop: 13 },
  chartLegendDot: { width: 6, height: 6, borderRadius: 3 },
  chartLegendText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.7 },
  updatedText: { fontSize: 8, marginLeft: 'auto' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 27, marginBottom: 12 },
  sectionTitle: { fontSize: 18, letterSpacing: -0.3, fontWeight: '700' },
  sectionAside: { fontSize: 8, fontWeight: '700', letterSpacing: 0.8 },
  measureCard: { borderWidth: 1, borderRadius: 19, paddingHorizontal: 15 },
  measureRow: { minHeight: 57, flexDirection: 'row', alignItems: 'center', gap: 8 },
  measureName: { flex: 1, fontSize: 12, fontWeight: '600' },
  measureValue: { fontSize: 11, fontWeight: '700', minWidth: 57, textAlign: 'right' },
  measureChange: { borderRadius: 9, paddingHorizontal: 7, paddingVertical: 5, minWidth: 60, alignItems: 'center' },
  measureChangeText: { fontSize: 9, fontWeight: '700' },
  emptyMeasurements: { borderWidth: 1, borderRadius: 19, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 10 },
  milestoneGrid: { gap: 9 },
  milestoneCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 17, minHeight: 66, paddingHorizontal: 13, gap: 11 },
  milestoneIcon: { width: 36, height: 36, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  milestoneTitle: { fontSize: 11, fontWeight: '700', flex: 1 },
  milestoneDetail: { fontSize: 9, textAlign: 'right', maxWidth: 120 },
  privateNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 18 },
  privateText: { fontSize: 9 },
});
