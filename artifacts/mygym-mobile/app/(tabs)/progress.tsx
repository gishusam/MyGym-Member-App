import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

type Range = '3M' | '6M' | '1Y';
const series: Record<Range, { labels: string[]; values: number[]; change: string }> = {
  '3M': { labels: ['SEP', 'OCT', 'NOV'], values: [78.2, 77.4, 76.8], change: '−1.4 kg' },
  '6M': { labels: ['JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV'], values: [78.6, 78.1, 77.8, 77.4, 77.1, 76.8], change: '−1.8 kg' },
  '1Y': { labels: ['DEC', 'FEB', 'APR', 'JUN', 'AUG', 'OCT', 'NOV'], values: [80.2, 79.7, 79.1, 78.6, 77.8, 77.1, 76.8], change: '−3.4 kg' },
};

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

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const [range, setRange] = useState<Range>('6M');
  const active = series[range];
  const chart = chartPath(active.values);
  const currentWeight = active.values[active.values.length - 1].toFixed(1);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topInset + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.eyebrow, { color: colors.forestMid }]}>SMALL WINS ADD UP</Text>
      <Text style={[styles.title, { color: colors.foreground }]}>Progress</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>A steady look at where your effort is taking you.</Text>

      <View style={[styles.weightCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardTop}>
          <View>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>BODY WEIGHT</Text>
            <View style={styles.weightLine}>
              <Text style={[styles.weightNumber, { color: colors.foreground }]}>{currentWeight}</Text>
              <Text style={[styles.weightUnit, { color: colors.mutedForeground }]}>kg</Text>
            </View>
          </View>
          <View style={[styles.changePill, { backgroundColor: colors.accent }]}>
            <Feather name="trending-down" size={13} color={colors.primary} />
            <Text style={[styles.changeText, { color: colors.primary }]}>{active.change}</Text>
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
        <View
          testID="body-weight-chart"
          accessible
          accessibilityRole="image"
          accessibilityLabel={`Body weight trend from ${active.values[0].toFixed(1)} kilograms to ${currentWeight} kilograms over ${range}. Change ${active.change}.`}
          style={styles.chartWrap}
        >
          <Svg width="100%" height={190} viewBox="0 0 320 190" preserveAspectRatio="none">
            <Line x1="20" y1="55" x2="300" y2="55" stroke={colors.border} strokeWidth="1" strokeDasharray="3 5" />
            <Line x1="20" y1="105" x2="300" y2="105" stroke={colors.border} strokeWidth="1" strokeDasharray="3 5" />
            <Path d={chart.area} fill={colors.accent} fillOpacity={0.42} />
            <Path d={chart.path} fill="none" stroke={colors.forestMid} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {chart.points.map((point, index) => (
              <Circle key={index} cx={point.x} cy={point.y} r={index === chart.points.length - 1 ? 5 : 3} fill={index === chart.points.length - 1 ? colors.forestMid : colors.card} stroke={colors.forestMid} strokeWidth="2" />
            ))}
          </Svg>
          <View style={styles.chartLabels}>
            {active.labels.map((label) => <Text key={label} style={[styles.chartLabel, { color: colors.mutedForeground }]}>{label}</Text>)}
          </View>
        </View>
        <View style={[styles.chartFooter, { borderTopColor: colors.border }]}>
          <View style={[styles.chartLegendDot, { backgroundColor: colors.forestMid }]} />
          <Text style={[styles.chartLegendText, { color: colors.mutedForeground }]}>MONTHLY CHECK-IN</Text>
          <Text style={[styles.updatedText, { color: colors.mutedForeground }]}>Updated 16 Nov</Text>
        </View>
      </View>

      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Measurements</Text>
        <Text style={[styles.sectionAside, { color: colors.mutedForeground }]}>16 NOV 2026</Text>
      </View>
      <View style={[styles.measureCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <MeasurementRow label="Waist" value="82.0 cm" change="−3.0 cm" colors={colors} />
        <MeasurementRow label="Chest" value="98.5 cm" change="+1.2 cm" positive colors={colors} />
        <MeasurementRow label="Body fat" value="19.6%" change="−1.4%" colors={colors} last />
      </View>

      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Milestones</Text>
        <Text style={[styles.sectionAside, { color: colors.mutedForeground }]}>3 EARNED</Text>
      </View>
      <View style={styles.milestoneGrid}>
        <Milestone icon="calendar" title="First month" detail="12 visits completed" accent="green" colors={colors} />
        <Milestone icon="award" title="Six-week streak" detail="Consistency champion" accent="gold" colors={colors} />
        <Milestone icon="trending-down" title="New rhythm" detail="3 kg body-weight change" accent="green" colors={colors} />
      </View>
      <View style={styles.privateNote}>
        <Feather name="lock" size={13} color={colors.mutedForeground} />
        <Text style={[styles.privateText, { color: colors.mutedForeground }]}>Your progress is private to you.</Text>
      </View>
      <View style={{ height: 115 }} />
    </ScrollView>
  );
}

function MeasurementRow({ label, value, change, positive = false, last = false, colors }: {
  label: string;
  value: string;
  change: string;
  positive?: boolean;
  last?: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.measureRow, !last && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
      <Text style={[styles.measureName, { color: colors.foreground }]}>{label}</Text>
      <Text style={[styles.measureValue, { color: colors.foreground }]}>{value}</Text>
      <View style={[styles.measureChange, { backgroundColor: positive ? colors.accent : colors.warm }]}>
        <Text style={[styles.measureChangeText, { color: positive ? colors.primary : colors.gold }]}>{change}</Text>
      </View>
    </View>
  );
}

function Milestone({ icon, title, detail, accent, colors }: {
  icon: 'calendar' | 'award' | 'trending-down';
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
  milestoneGrid: { gap: 9 },
  milestoneCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 17, minHeight: 66, paddingHorizontal: 13, gap: 11 },
  milestoneIcon: { width: 36, height: 36, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  milestoneTitle: { fontSize: 11, fontWeight: '700', flex: 1 },
  milestoneDetail: { fontSize: 9, textAlign: 'right', maxWidth: 120 },
  privateNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 19 },
  privateText: { fontSize: 9 },
});
