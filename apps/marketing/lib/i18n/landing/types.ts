type Copy = { title: string; body: string };

type Heading = {
  eyebrow: string;
  title: string;
  description: string;
};

export type RosterStatus = 'on' | 'late' | 'upcoming';

/** Every string of the landing page. Values may contain `{placeholders}`, see `format()`. */
export type LandingDictionary = {
  meta: { title: string; description: string };
  hero: {
    badge: string;
    titleLead: string;
    titleHighlight: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    reassurance: string[];
  };
  demo: {
    businessName: string;
    week: string;
    autoSchedule: string;
    scheduling: string;
    reset: string;
    team: string;
    days: string[];
    dayNames: string[];
    roles: { floor: string; kitchen: string; bar: string };
    slots: { am: string; pm: string };
    availability: {
      all: string;
      am: string;
      pm: string;
      off: string;
      leave: string;
    };
    idleMessage: string;
    schedulingMessage: string;
    doneMessage: string;
    movedMessage: string;
    errors: { unavailable: string; leave: string; occupied: string };
    stats: { shifts: string; hours: string; conflicts: string };
    swipeHint: string;
  };
  pain: Heading & {
    items: Copy[];
    chat: {
      group: string;
      members: string;
      messages: { author: string; time: string; text: string }[];
    };
  };
  steps: Heading & {
    items: Copy[];
    visuals: {
      days: string[];
      button: string;
      placed: string;
      published: string;
    };
  };
  features: Heading & {
    clock: Copy & {
      shift: string;
      button: string;
      status: string;
      location: string;
    };
    live: Copy & {
      liveLabel: string;
      scheduled: string;
      onShift: string;
      late: string;
      roster: { name: string; time: string; status: RosterStatus }[];
      statusLabels: Record<RosterStatus, string>;
    };
    swaps: Copy & { steps: string[]; done: string };
    timeOff: Copy & {
      request: string;
      dates: string;
      approved: string;
      locked: string;
    };
    cost: Copy & {
      label: string;
      amount: string;
      trend: string;
      days: string[];
      alert: string;
      alertDetail: string;
    };
    exports: Copy & {
      columns: string[];
      rows: string[][];
      button: string;
    };
    nights: Copy & { chips: string[] };
  };
  comparison: Heading & {
    oldLabel: string;
    newLabel: string;
    rows: { topic: string; old: string; new: string }[];
  };
  industries: Heading & {
    items: (Copy & { bullets: string[] })[];
    employee: Heading & {
      bullets: string[];
      phone: {
        greeting: string;
        nextShiftLabel: string;
        nextShift: string;
        hoursLabel: string;
        hoursValue: string;
        clockIn: string;
        swap: string;
        timeOff: string;
        notification: string;
      };
    };
  };
  pricing: Heading & {
    popular: string;
    plans: {
      name: string;
      price: string;
      period: string;
      seats: string;
      note: string;
      cta: string;
    }[];
    includedTitle: string;
    included: string[];
    footnote: string;
  };
  faq: Heading & {
    contactLead: string;
    contactLink: string;
    items: { question: string; answer: string }[];
  };
  cta: {
    title: string;
    description: string;
    primary: string;
    secondary: string;
  };
};
