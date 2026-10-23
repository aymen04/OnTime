import { z } from 'zod';
import { DayOfWeek } from '@workspace/database';
import { WorkHoursDto } from '~/types/dtos/work-hours-dto';
import { WorkTimeSlotDto } from '~/types/dtos/work-time-slot-dto';

export const updateBusinessHoursSchema = z.object({
  businessHours: z.array(
    z.object({
      dayOfWeek: z.nativeEnum(DayOfWeek),
      timeSlots: z.array(
        z.object({
          id: z.string().trim().uuid('Id is invalid.').min(1).max(36),
          start: z.string().datetime(), // On garde la date exacte envoyée par l'UI
          end: z.string().datetime()    // On garde la date exacte envoyée par l'UI
        })
      )
    })
  )
}).refine((data) => areWorkHoursValid(data.businessHours), {
  message: "Les horaires se chevauchent ou sont invalides."
});

export type UpdateBusinessHoursSchema = z.infer<typeof updateBusinessHoursSchema>;

// Helper ultra-fiable
function getMins(isoStr: string) {
  const d = new Date(isoStr);
  return d.getHours() * 60 + d.getMinutes();
}

export function isEndGreaterThanStart(timeSlot: WorkTimeSlotDto): boolean {
  const startMins = getMins(timeSlot.start);
  let endMins = getMins(timeSlot.end);
  if (endMins === 0) endMins = 1440;
  return endMins > startMins;
}

export function isEveryEndGreaterThanStart(workHours: WorkHoursDto[]): boolean {
  for (const w of workHours) {
    if (w.timeSlots && w.timeSlots.length > 0) {
      for (const slot of w.timeSlots) {
        if (!isEndGreaterThanStart(slot)) return false;
      }
    }
  }
  return true;
}

export function areThereNoOverlaps(workHours: WorkHoursDto[]): boolean {
  for (const w of workHours) {
    if (w.timeSlots && w.timeSlots.length > 1) {
      const slots = [...w.timeSlots].sort((a, b) => getMins(a.start) - getMins(b.start));
      for (let j = 1; j < slots.length; j++) {
        const prev = slots[j - 1];
        const current = slots[j];
        if (getMins(current.start) < getMins(prev.end)) return false;
      }
    }
  }
  return true;
}

export function getOverlappingTimeSlotsIds(timeSlots?: WorkTimeSlotDto[]): string[] {
  if (!timeSlots || timeSlots.length < 2) return [];
  const overlappingIds: string[] = [];
  const slots = [...timeSlots].sort((a, b) => getMins(a.start) - getMins(b.start));
  for (let i = 1; i < slots.length; i++) {
    const prev = slots[i - 1];
    const current = slots[i];
    if (getMins(current.start) < getMins(prev.end)) {
      overlappingIds.push(prev.id);
      overlappingIds.push(current.id);
    }
  }
  return [...new Set(overlappingIds)];
}

export function noDuplicateDayOfWeek(workHours: WorkHoursDto[]): boolean {
  const seen = new Set<DayOfWeek>();
  for (const w of workHours) {
    if (seen.has(w.dayOfWeek)) return false;
    seen.add(w.dayOfWeek);
  }
  return seen.size === 7;
}

export function areWorkHoursValid(workHours: WorkHoursDto[]): boolean {
  return noDuplicateDayOfWeek(workHours) && isEveryEndGreaterThanStart(workHours) && areThereNoOverlaps(workHours);
}