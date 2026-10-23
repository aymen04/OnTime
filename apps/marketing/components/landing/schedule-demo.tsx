'use client';

import * as React from 'react';
import {
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HandIcon,
  Loader2Icon,
  PalmtreeIcon,
  RotateCcwIcon,
  SparklesIcon,
  XCircleIcon
} from 'lucide-react';
import {
  motion,
  useInView,
  useReducedMotion,
  useSpring,
  useTransform,
  type PanInfo
} from 'motion/react';

import { cn } from '@workspace/ui/lib/utils';

import {
  DEMO_EMPLOYEES,
  DEMO_PLAN,
  fitsAvailability,
  ROLE_STYLES,
  SLOT_HOURS,
  type Availability,
  type DemoShift
} from '~/components/landing/demo-data';
import { format } from '~/lib/i18n/config';
import { type LandingDictionary } from '~/lib/i18n/landing';

type Phase = 'idle' | 'scheduling' | 'done';
type Feedback = { tone: 'success' | 'error'; text: string };
type DropTarget = { employeeId: string; day: number; valid: boolean };

const FIRST_DATE = 14;
const HINT_SHIFT_ID = 'karim-1';
const SCHEDULING_MS = 1100;
const REVEAL_MS = 1500;

export type ScheduleDemoProps = {
  t: LandingDictionary['demo'];
};

export function ScheduleDemo({ t }: ScheduleDemoProps): React.JSX.Element {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { once: true, amount: 0.35 });
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = React.useState<Phase>('idle');
  const [shifts, setShifts] = React.useState<DemoShift[]>([]);
  const [revealed, setRevealed] = React.useState(false);
  const [interacted, setInteracted] = React.useState(false);
  const [lastMovedId, setLastMovedId] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<Feedback | null>(null);
  const [target, setTarget] = React.useState<DropTarget | null>(null);
  const autoPlayed = React.useRef(false);
  const timers = React.useRef<number[]>([]);

  const clearTimers = (): void => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };
  React.useEffect(() => clearTimers, []);

  const runAutoSchedule = React.useCallback((): void => {
    clearTimers();
    setShifts([]);
    setRevealed(false);
    setLastMovedId(null);
    setFeedback(null);
    setPhase('scheduling');
    const delay = reduceMotion ? 0 : SCHEDULING_MS;
    timers.current.push(
      window.setTimeout(() => {
        setShifts(DEMO_PLAN);
        setPhase('done');
      }, delay),
      window.setTimeout(
        () => setRevealed(true),
        delay + (reduceMotion ? 0 : REVEAL_MS)
      )
    );
  }, [reduceMotion]);

  const reset = (): void => {
    clearTimers();
    setShifts([]);
    setRevealed(false);
    setInteracted(false);
    setFeedback(null);
    setPhase('idle');
  };

  // Plays the demo once, shortly after it scrolls into view.
  React.useEffect(() => {
    if (!inView || autoPlayed.current) {
      return;
    }
    const id = window.setTimeout(() => {
      autoPlayed.current = true;
      runAutoSchedule();
    }, 900);
    return () => window.clearTimeout(id);
  }, [inView, runAutoSchedule]);

  const checkDrop = (
    shift: DemoShift,
    employeeId: string,
    day: number
  ): keyof typeof t.errors | null => {
    const employee = DEMO_EMPLOYEES.find((e) => e.id === employeeId);
    const availability = employee?.availability[day];
    if (!availability || availability === 'leave') {
      return 'leave';
    }
    if (!fitsAvailability(availability, shift.slot)) {
      return 'unavailable';
    }
    const occupied = shifts.some(
      (s) => s.id !== shift.id && s.employeeId === employeeId && s.day === day
    );
    return occupied ? 'occupied' : null;
  };

  const findCell = (
    info: PanInfo
  ): { employeeId: string; day: number } | null => {
    const elements = document.elementsFromPoint(
      info.point.x - window.scrollX,
      info.point.y - window.scrollY
    );
    const cell = elements.find(
      (element): element is HTMLElement =>
        element instanceof HTMLElement && element.dataset.cell !== undefined
    );
    if (!cell?.dataset.cell) {
      return null;
    }
    const [employeeId, day] = cell.dataset.cell.split(':');
    return { employeeId, day: Number(day) };
  };

  const handleDrag = (shift: DemoShift, info: PanInfo): void => {
    const cell = findCell(info);
    if (!cell) {
      setTarget(null);
      return;
    }
    const valid = checkDrop(shift, cell.employeeId, cell.day) === null;
    setTarget((current) =>
      current?.employeeId === cell.employeeId &&
      current.day === cell.day &&
      current.valid === valid
        ? current
        : { ...cell, valid }
    );
  };

  const handleDragEnd = (shift: DemoShift, info: PanInfo): void => {
    setTarget(null);
    setInteracted(true);
    const cell = findCell(info);
    if (
      !cell ||
      (cell.employeeId === shift.employeeId && cell.day === shift.day)
    ) {
      return;
    }
    const employee = DEMO_EMPLOYEES.find((e) => e.id === cell.employeeId);
    const values = { name: employee?.name ?? '', day: t.dayNames[cell.day] };
    const error = checkDrop(shift, cell.employeeId, cell.day);
    if (error) {
      setFeedback({ tone: 'error', text: format(t.errors[error], values) });
      return;
    }
    setShifts((current) =>
      current.map((s) =>
        s.id === shift.id
          ? { ...s, employeeId: cell.employeeId, day: cell.day }
          : s
      )
    );
    setLastMovedId(shift.id);
    setFeedback({ tone: 'success', text: format(t.movedMessage, values) });
  };

  const totalHours = shifts.reduce((sum, s) => sum + SLOT_HOURS[s.slot], 0);
  const statusText =
    feedback?.text ??
    (phase === 'idle'
      ? t.idleMessage
      : phase === 'scheduling'
        ? t.schedulingMessage
        : t.doneMessage);

  return (
    <div
      ref={rootRef}
      className="relative overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-2xl shadow-black/5 dark:shadow-black/40"
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-orange-100 text-lg dark:bg-orange-400/15">
            🍳
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">{t.businessName}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ChevronLeftIcon className="size-3.5" />
              {t.week}
              <ChevronRightIcon className="size-3.5" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {phase === 'done' && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <RotateCcwIcon className="size-3.5" />
              {t.reset}
            </button>
          )}
          <motion.button
            type="button"
            onClick={runAutoSchedule}
            disabled={phase === 'scheduling'}
            whileTap={{ scale: 0.96 }}
            className={cn(
              'relative inline-flex h-9 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-brand-foreground shadow-sm transition-opacity disabled:opacity-80',
              phase === 'idle' && 'animate-pulse-ring'
            )}
          >
            {phase === 'scheduling' ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <SparklesIcon className="size-4" />
            )}
            {phase === 'scheduling' ? t.scheduling : t.autoSchedule}
          </motion.button>
        </div>
      </div>

      {/* Grid */}
      <div className="relative overflow-x-auto">
        <div className="relative min-w-[720px] p-3 sm:p-4">
          <div className="grid grid-cols-[minmax(132px,1.25fr)_repeat(7,minmax(0,1fr))] gap-1.5">
            <div className="px-2 pb-1 text-xs font-medium text-muted-foreground">
              {t.team}
            </div>
            {t.days.map((day, index) => (
              <div
                key={day}
                className="pb-1 text-center text-xs font-medium text-muted-foreground"
              >
                {day}{' '}
                <span className="text-foreground/70">{FIRST_DATE + index}</span>
              </div>
            ))}

            {DEMO_EMPLOYEES.map((employee, row) => {
              const hours = shifts
                .filter((s) => s.employeeId === employee.id)
                .reduce((sum, s) => sum + SLOT_HOURS[s.slot], 0);
              return (
                <React.Fragment key={employee.id}>
                  <div className="flex items-center gap-2.5 px-1.5">
                    <div
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                        ROLE_STYLES[employee.role].chip
                      )}
                    >
                      {employee.name.charAt(0)}
                    </div>
                    <div className="min-w-0 leading-tight">
                      <div className="truncate text-sm font-medium">
                        {employee.name}
                      </div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {t.roles[employee.role]} · {hours} h
                      </div>
                    </div>
                  </div>
                  {employee.availability.map((availability, day) => {
                    const shift = shifts.find(
                      (s) => s.employeeId === employee.id && s.day === day
                    );
                    const isTarget =
                      target?.employeeId === employee.id && target.day === day;
                    return (
                      <div
                        key={day}
                        data-cell={`${employee.id}:${day}`}
                        className={cn(
                          'relative flex h-14 items-stretch rounded-lg border border-dashed p-1 transition-colors',
                          availability === 'off' &&
                            'bg-diagonal-lines border-transparent',
                          availability === 'leave' &&
                            'border-amber-300/60 bg-amber-50 dark:border-amber-400/20 dark:bg-amber-400/5',
                          (availability === 'all' ||
                            availability === 'am' ||
                            availability === 'pm') &&
                            'border-border bg-muted/40',
                          isTarget &&
                            (target.valid
                              ? 'border-solid border-brand-strong bg-brand-soft ring-2 ring-brand/60'
                              : 'border-solid border-red-400 bg-red-500/5 ring-2 ring-red-400/50')
                        )}
                      >
                        {shift ? (
                          <ShiftChip
                            label={t.slots[shift.slot]}
                            roleLabel={t.roles[employee.role]}
                            role={employee.role}
                            draggable={phase === 'done'}
                            revealed={revealed}
                            popIn={shift.id === lastMovedId}
                            delay={day * 0.13 + row * 0.04}
                            showHint={
                              revealed &&
                              !interacted &&
                              shift.id === HINT_SHIFT_ID
                            }
                            onDrag={(info) => handleDrag(shift, info)}
                            onDragEnd={(info) => handleDragEnd(shift, info)}
                          />
                        ) : (
                          <AvailabilityLabel
                            availability={availability}
                            t={t}
                          />
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
          {phase === 'scheduling' && !reduceMotion && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-brand/30 to-transparent"
              initial={{ left: '-35%' }}
              animate={{ left: '105%' }}
              transition={{
                duration: 0.9,
                ease: 'easeInOut',
                repeat: Infinity
              }}
            />
          )}
        </div>
      </div>
      <p className="border-t px-4 py-1.5 text-center text-[11px] text-muted-foreground sm:hidden">
        {t.swipeHint} →
      </p>

      {/* Status bar */}
      <div className="flex flex-col gap-2 border-t bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div
          aria-live="polite"
          className={cn(
            'flex min-h-5 items-center gap-2 text-sm',
            feedback?.tone === 'error' && 'text-red-600 dark:text-red-400',
            feedback?.tone === 'success' && 'text-brand-strong dark:text-brand'
          )}
        >
          {feedback?.tone === 'error' ? (
            <XCircleIcon className="size-4 shrink-0" />
          ) : phase === 'done' ? (
            <CheckCircle2Icon className="size-4 shrink-0 text-brand-strong dark:text-brand" />
          ) : (
            <span className="size-2 shrink-0 animate-pulse rounded-full bg-brand-strong dark:bg-brand" />
          )}
          <motion.span
            key={statusText}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {statusText}
          </motion.span>
        </div>
        <div className="flex items-center gap-4 text-sm tabular-nums text-muted-foreground">
          <span>
            <AnimatedNumber
              value={shifts.length}
              className="font-semibold text-foreground"
            />{' '}
            {t.stats.shifts}
          </span>
          <span>
            <AnimatedNumber
              value={totalHours}
              className="font-semibold text-foreground"
            />{' '}
            {t.stats.hours}
          </span>
          <span>
            <span className="font-semibold text-brand-strong dark:text-brand">
              0
            </span>{' '}
            {t.stats.conflicts}
          </span>
        </div>
      </div>
    </div>
  );
}

type ShiftChipProps = {
  label: string;
  roleLabel: string;
  role: keyof typeof ROLE_STYLES;
  draggable: boolean;
  revealed: boolean;
  popIn: boolean;
  delay: number;
  showHint: boolean;
  onDrag: (info: PanInfo) => void;
  onDragEnd: (info: PanInfo) => void;
};

function ShiftChip({
  label,
  roleLabel,
  role,
  draggable,
  revealed,
  popIn,
  delay,
  showHint,
  onDrag,
  onDragEnd
}: ShiftChipProps): React.JSX.Element {
  const initial = !revealed
    ? { opacity: 0, y: 8, scale: 0.8 }
    : popIn
      ? { opacity: 0.4, scale: 0.85 }
      : false;
  return (
    <motion.div
      initial={initial}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={
        revealed
          ? { type: 'spring', stiffness: 500, damping: 30 }
          : { delay, type: 'spring', stiffness: 420, damping: 24 }
      }
      drag={draggable}
      dragSnapToOrigin
      dragMomentum={false}
      dragElastic={0.9}
      whileDrag={{
        scale: 1.08,
        zIndex: 50,
        boxShadow: '0 12px 28px -8px rgb(0 0 0 / 0.35)'
      }}
      onDrag={(_event, info) => onDrag(info)}
      onDragEnd={(_event, info) => onDragEnd(info)}
      className={cn(
        'relative flex w-full touch-none select-none flex-col justify-center rounded-md border px-1.5 leading-tight',
        ROLE_STYLES[role].chip,
        draggable && 'cursor-grab active:cursor-grabbing'
      )}
    >
      <span className="whitespace-nowrap text-[11px] font-semibold">
        {label}
      </span>
      <span className="text-[10px] opacity-70">{roleLabel}</span>
      {showHint && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-3 right-0 text-foreground"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            x: [0, 0, 26, 26],
            y: [0, 0, 8, 8]
          }}
          transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 0.6 }}
        >
          <HandIcon className="size-5 fill-background drop-shadow" />
        </motion.span>
      )}
    </motion.div>
  );
}

type AvailabilityLabelProps = {
  availability: Availability;
  t: LandingDictionary['demo'];
};

function AvailabilityLabel({
  availability,
  t
}: AvailabilityLabelProps): React.JSX.Element {
  return (
    <span
      className={cn(
        'flex w-full items-center justify-center gap-1 text-center text-[10px] leading-tight',
        availability === 'leave'
          ? 'font-medium text-amber-700 dark:text-amber-300'
          : 'text-muted-foreground/80'
      )}
    >
      {availability === 'leave' && <PalmtreeIcon className="size-3 shrink-0" />}
      {t.availability[availability]}
    </span>
  );
}

function AnimatedNumber({
  value,
  className
}: {
  value: number;
  className?: string;
}): React.JSX.Element {
  const spring = useSpring(value, { stiffness: 90, damping: 20 });
  const rounded = useTransform(spring, (latest) => Math.round(latest));
  React.useEffect(() => {
    spring.set(value);
  }, [spring, value]);
  return <motion.span className={className}>{rounded}</motion.span>;
}
