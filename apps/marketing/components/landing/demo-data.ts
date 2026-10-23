export type Role = 'floor' | 'kitchen' | 'bar';
export type Slot = 'am' | 'pm';
/** Recurring availability of an employee for one day of the week. */
export type Availability = 'all' | Slot | 'off' | 'leave';

export type DemoEmployee = {
  id: string;
  name: string;
  role: Role;
  availability: Availability[];
};

export type DemoShift = {
  id: string;
  employeeId: string;
  day: number;
  slot: Slot;
};

export const SLOT_HOURS: Record<Slot, number> = { am: 6, pm: 7 };

export const ROLE_STYLES: Record<Role, { chip: string; dot: string }> = {
  floor: {
    chip: 'border-sky-300/70 bg-sky-100 text-sky-950 dark:border-sky-400/30 dark:bg-sky-400/15 dark:text-sky-100',
    dot: 'bg-sky-500'
  },
  kitchen: {
    chip: 'border-orange-300/70 bg-orange-100 text-orange-950 dark:border-orange-400/30 dark:bg-orange-400/15 dark:text-orange-100',
    dot: 'bg-orange-500'
  },
  bar: {
    chip: 'border-violet-300/70 bg-violet-100 text-violet-950 dark:border-violet-400/30 dark:bg-violet-400/15 dark:text-violet-100',
    dot: 'bg-violet-500'
  }
};

// Days run Monday (0) to Sunday (6).
export const DEMO_EMPLOYEES: DemoEmployee[] = [
  {
    id: 'lea',
    name: 'Léa',
    role: 'floor',
    availability: ['all', 'all', 'am', 'off', 'all', 'all', 'off']
  },
  {
    id: 'karim',
    name: 'Karim',
    role: 'kitchen',
    availability: ['all', 'all', 'all', 'all', 'off', 'all', 'all']
  },
  {
    id: 'sofia',
    name: 'Sofia',
    role: 'bar',
    availability: ['pm', 'pm', 'leave', 'leave', 'pm', 'pm', 'pm']
  },
  {
    id: 'tom',
    name: 'Tom',
    role: 'floor',
    availability: ['off', 'all', 'all', 'all', 'all', 'all', 'all']
  },
  {
    id: 'mei',
    name: 'Mei',
    role: 'kitchen',
    availability: ['all', 'off', 'all', 'all', 'all', 'off', 'all']
  },
  {
    id: 'noah',
    name: 'Noah',
    role: 'bar',
    availability: ['all', 'all', 'all', 'pm', 'off', 'all', 'all']
  }
];

// What "Auto-schedule" produces: every shift fits the availability above.
const PLAN: Record<string, (Slot | null)[]> = {
  lea: ['am', 'pm', 'am', null, 'am', 'pm', null],
  karim: ['am', 'am', null, 'pm', null, 'am', 'pm'],
  sofia: ['pm', null, null, null, 'pm', 'pm', 'pm'],
  tom: [null, 'am', 'pm', 'am', 'pm', null, 'am'],
  mei: ['pm', null, 'am', 'am', 'pm', null, 'am'],
  noah: [null, 'pm', 'pm', 'pm', null, 'am', null]
};

export const DEMO_PLAN: DemoShift[] = Object.entries(PLAN).flatMap(
  ([employeeId, days]) =>
    days.flatMap((slot, day) =>
      slot ? [{ id: `${employeeId}-${day}`, employeeId, day, slot }] : []
    )
);

export function fitsAvailability(
  availability: Availability,
  slot: Slot
): boolean {
  return availability === 'all' || availability === slot;
}
