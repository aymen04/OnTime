import { colors } from '@/lib/theme';
import { minutesToLabel } from '@/lib/time';
import {
  AVAILABILITY_MAX,
  AVAILABILITY_MIN,
  LEGAL_MAX,
  LEGAL_MIN,
} from '@/lib/types';
import { useRef, useState } from 'react';
import { LayoutChangeEvent, PanResponder, StyleSheet, Text, View } from 'react-native';

const THUMB = 28;
const TRACK_H = 4;
const STEP = 60;
const MIN_GAP = STEP;
const SPAN = AVAILABILITY_MAX - AVAILABILITY_MIN;
const RANGE_TOP = (THUMB + 8 - TRACK_H) / 2;

type Props = {
  start: number;
  end: number;
  onChange: (start: number, end: number) => void;
};

function snap(value: number) {
  return Math.round(value / STEP) * STEP;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function label(minutes: number) {
  return minutesToLabel(minutes).replace(' +1', ' j+1');
}

function overlap(a0: number, a1: number, b0: number, b1: number) {
  const start = Math.max(a0, b0);
  const end = Math.min(a1, b1);
  return end > start ? { start, end } : null;
}

export function TimeRangeSlider({ start, end, onChange }: Props) {
  const [width, setWidth] = useState(0);
  const widthRef = useRef(0);
  const startRef = useRef(start);
  const endRef = useRef(end);
  const onChangeRef = useRef(onChange);
  const dragOrigin = useRef(0);

  startRef.current = start;
  endRef.current = end;
  onChangeRef.current = onChange;

  const toX = (minutes: number, w = width) => ((minutes - AVAILABILITY_MIN) / SPAN) * w;
  const dxToMinutes = (dx: number) => (dx / Math.max(widthRef.current, 1)) * SPAN;

  const startPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragOrigin.current = startRef.current;
      },
      onPanResponderMove: (_, g) => {
        const next = snap(
          clamp(dragOrigin.current + dxToMinutes(g.dx), AVAILABILITY_MIN, endRef.current - MIN_GAP),
        );
        if (next !== startRef.current) onChangeRef.current(next, endRef.current);
      },
    }),
  ).current;

  const endPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragOrigin.current = endRef.current;
      },
      onPanResponderMove: (_, g) => {
        const next = snap(
          clamp(dragOrigin.current + dxToMinutes(g.dx), startRef.current + MIN_GAP, AVAILABILITY_MAX),
        );
        if (next !== endRef.current) onChangeRef.current(startRef.current, next);
      },
    }),
  ).current;

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    widthRef.current = w;
    setWidth(w);
  };

  const startX = width ? toX(start) : 0;
  const endX = width ? toX(end) : 0;
  const startOutside = start < LEGAL_MIN;
  const endOutside = end > LEGAL_MAX;

  const segments =
    width > 0
      ? (
          [
            { zone: overlap(start, end, AVAILABILITY_MIN, LEGAL_MIN), color: colors.warning },
            { zone: overlap(start, end, LEGAL_MIN, LEGAL_MAX), color: colors.teal },
            { zone: overlap(start, end, LEGAL_MAX, AVAILABILITY_MAX), color: colors.warning },
          ] as const
        ).flatMap(({ zone, color }) =>
          zone
            ? [
                {
                  left: toX(zone.start),
                  width: Math.max(toX(zone.end) - toX(zone.start), 0),
                  color,
                },
              ]
            : [],
        )
      : [];

  return (
    <View style={styles.wrap}>
      <View style={styles.values}>
        <View>
          <Text style={styles.caption}>Début</Text>
          <Text style={[styles.value, startOutside && styles.valueOutside]}>{label(start)}</Text>
        </View>
        <View style={styles.valuesEnd}>
          <Text style={styles.caption}>Fin</Text>
          <Text style={[styles.value, endOutside && styles.valueOutside]}>{label(end)}</Text>
        </View>
      </View>

      <View style={styles.slider} onLayout={onLayout}>
        <View style={styles.track} />
        {width > 0 ? (
          <>
            <View
              style={[
                styles.legalBand,
                {
                  left: toX(LEGAL_MIN),
                  width: Math.max(toX(LEGAL_MAX) - toX(LEGAL_MIN), 0),
                },
              ]}
            />
            {segments.map((seg, i) => (
              <View
                key={i}
                style={[styles.range, { left: seg.left, width: seg.width, backgroundColor: seg.color }]}
              />
            ))}
            <View
              {...startPan.panHandlers}
              hitSlop={12}
              style={[styles.thumb, startOutside && styles.thumbOutside, { left: startX - THUMB / 2 }]}
              accessibilityRole="adjustable"
              accessibilityLabel={`Début ${label(start)}`}
            />
            <View
              {...endPan.panHandlers}
              hitSlop={12}
              style={[styles.thumb, endOutside && styles.thumbOutside, { left: endX - THUMB / 2 }]}
              accessibilityRole="adjustable"
              accessibilityLabel={`Fin ${label(end)}`}
            />
          </>
        ) : null}
      </View>

      <View style={styles.ticks}>
        <Text style={[styles.tick, styles.tickOutside]}>12 AM</Text>
        <Text style={styles.tick}>6 AM</Text>
        <Text style={styles.tick}>6 AM j+1</Text>
        <Text style={[styles.tick, styles.tickOutside]}>12 PM j+1</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  values: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  valuesEnd: { alignItems: 'flex-end' },
  caption: { fontWeight: '700', color: colors.muted, fontSize: 12, marginBottom: 2 },
  value: { fontWeight: '800', color: colors.ink, fontSize: 18 },
  valueOutside: { color: colors.warning },
  slider: {
    height: THUMB + 8,
    justifyContent: 'center',
  },
  track: {
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    backgroundColor: colors.line,
  },
  legalBand: {
    position: 'absolute',
    height: TRACK_H + 6,
    borderRadius: (TRACK_H + 6) / 2,
    backgroundColor: colors.tealSoft,
    top: RANGE_TOP - 3,
    opacity: 0.7,
  },
  range: {
    position: 'absolute',
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    top: RANGE_TOP,
  },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.12)',
    top: 4,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  thumbOutside: {
    borderColor: colors.warning,
    borderWidth: 1.5,
  },
  ticks: { flexDirection: 'row', justifyContent: 'space-between' },
  tick: { fontSize: 11, fontWeight: '600', color: colors.muted },
  tickOutside: { color: colors.warning },
});
