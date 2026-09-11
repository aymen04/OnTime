import { AVAILABILITY_MAX, AVAILABILITY_MIN, DAY_LABELS } from '@/lib/types';

export function clampMinutes(value: number) {
  return Math.min(AVAILABILITY_MAX, Math.max(AVAILABILITY_MIN, value));
}

export function minutesToLabel(total: number) {
  const wrapped = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours24 = Math.floor(wrapped / 60);
  const minutes = wrapped % 60;
  const suffix = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const mm = minutes.toString().padStart(2, '0');
  const nextDay = total >= 24 * 60 ? ' +1' : '';
  return `${hours12}:${mm} ${suffix}${nextDay}`;
}

export function overlapMinutes(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): { start: number; end: number } | null {
  const start = Math.max(aStart, bStart);
  const end = Math.min(aEnd, bEnd);
  if (end <= start) return null;
  return { start, end };
}

export function bestOverlap(
  windows: { start_minutes: number; end_minutes: number }[],
  slotStart: number,
  slotEnd: number,
) {
  let best: { start: number; end: number } | null = null;
  for (const window of windows) {
    const hit = overlapMinutes(window.start_minutes, window.end_minutes, slotStart, slotEnd);
    if (!hit) continue;
    if (!best || hit.end - hit.start > best.end - best.start) {
      best = hit;
    }
  }
  return best;
}

export function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function dateFromMinutes(day: Date, minutes: number) {
  const d = new Date(day);
  d.setHours(0, 0, 0, 0);
  d.setMinutes(minutes);
  return d;
}

export function isoDay(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDayHeading(date: Date) {
  return `${DAY_LABELS[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`;
}

export function formatRange(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const startMin = start.getHours() * 60 + start.getMinutes();
  const endMin =
    end.getHours() * 60 + end.getMinutes() + (isoDay(end) !== isoDay(start) ? 24 * 60 : 0);
  return `${minutesToLabel(startMin)} – ${minutesToLabel(endMin)}`;
}

export function hoursBetween(startIso: string, endIso: string) {
  return (new Date(endIso).getTime() - new Date(startIso).getTime()) / 36e5;
}

export function sameWeek(date: Date, weekStart: Date) {
  const start = startOfWeek(weekStart);
  const end = addDays(start, 7);
  return date >= start && date < end;
}
