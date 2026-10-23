import { type LandingDictionary } from './types';

export const en: LandingDictionary = {
  meta: {
    title: 'Semiweekly — Staff scheduling in one click',
    description:
      "Semiweekly builds your team's schedule from everyone's availability in one click. Drag & drop to adjust, GPS clock-in, shift swaps and time off. Built for restaurants, shops and seasonal teams open 7 days a week."
  },
  hero: {
    badge: 'Early access — now onboarding our first teams',
    titleLead: "Next week's schedule.",
    titleHighlight: 'One click.',
    description:
      "Semiweekly builds your team's schedule from everyone's availability, around opening hours and approved time off. Then you fine-tune it with drag & drop, just like a calendar.",
    primaryCta: 'Start free trial',
    secondaryCta: 'Watch it plan a week',
    reassurance: ['From $8.99/month', 'Set up in minutes', 'Cancel anytime']
  },
  demo: {
    businessName: 'Harbor Café',
    week: 'Week of July 14',
    autoSchedule: 'Auto-schedule',
    scheduling: 'Scheduling…',
    reset: 'Reset',
    team: 'Team',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    dayNames: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ],
    roles: { floor: 'Floor', kitchen: 'Kitchen', bar: 'Bar' },
    slots: { am: '10a–4p', pm: '4p–11p' },
    availability: {
      all: 'All day',
      am: 'Mornings',
      pm: 'Evenings',
      off: 'Unavailable',
      leave: 'Time off'
    },
    idleMessage: "Everyone's availability is in. Hit Auto-schedule.",
    schedulingMessage: 'Matching availability, opening hours and time off…',
    doneMessage:
      'Week scheduled, zero conflicts. Now drag any shift to adjust.',
    movedMessage: 'Done: {name} now works on {day}.',
    errors: {
      unavailable: "Blocked: {name} isn't available on {day}.",
      leave: 'Blocked: {name} is on approved time off.',
      occupied: 'Blocked: {name} already works on {day}. No double shifts.'
    },
    stats: { shifts: 'shifts', hours: 'hours', conflicts: 'conflicts' },
    swipeHint: 'Swipe to see the whole week'
  },
  pain: {
    eyebrow: 'Sound familiar?',
    title: "Sunday, 11 pm. You're still working on the schedule.",
    description:
      'Scheduling a small team that changes every season should not eat your weekends.',
    items: [
      {
        title: 'The spreadsheet nobody reads',
        body: 'You rebuild it every week, post a screenshot in the group chat, and someone still shows up at the wrong time.'
      },
      {
        title: 'Swaps by text message',
        body: '"Can you cover my Saturday?" You find out at 5 pm, when nobody shows up.'
      },
      {
        title: 'Scheduled on their day off',
        body: 'Time off agreed in passing, forgotten in the schedule. Now you are one person short on Friday night.'
      },
      {
        title: 'Payroll surprises',
        body: 'Hours scribbled on paper, overtime spotted too late, and an evening of maths every pay period.'
      }
    ],
    chat: {
      group: 'Harbor Café crew 🍳',
      members: '8 members',
      messages: [
        {
          author: 'Tom',
          time: '10:52 pm',
          text: 'Can someone take my Saturday night?? 🙏'
        },
        {
          author: 'Sofia',
          time: '10:54 pm',
          text: "I told you I'm off Thursday…"
        },
        {
          author: 'Karim',
          time: '10:58 pm',
          text: "Who's opening tomorrow?"
        },
        {
          author: 'Léa',
          time: '11:03 pm',
          text: 'Am I working Sunday or not? 😅'
        },
        {
          author: 'You',
          time: '11:09 pm',
          text: 'New schedule coming tonight, promise 😩'
        }
      ]
    }
  },
  steps: {
    eyebrow: 'How it works',
    title: 'From availability to a published week in three steps',
    description:
      'No training, no setup project. Your first schedule is ready before your coffee gets cold.',
    items: [
      {
        title: 'Your team shares availability',
        body: 'Each employee sets their recurring availability from their phone, once. They update it when life changes.'
      },
      {
        title: 'You click Auto-schedule',
        body: 'Semiweekly places everyone in seconds, within opening hours, around approved time off, with no double shifts.'
      },
      {
        title: 'Drag, drop, publish',
        body: 'Adjust anything like you would in a calendar, then publish. Everyone gets their shifts on their phone.'
      }
    ],
    visuals: {
      days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
      button: 'Auto-schedule',
      placed: '28 shifts placed',
      published: 'Schedule published'
    }
  },
  features: {
    eyebrow: 'Everything in one place',
    title: 'Plan it. Clock it. Approve it.',
    description:
      'One app for the schedule, the time clock and every request your team sends you.',
    clock: {
      title: 'Clock in from any phone',
      body: "GPS-verified clock-in that opens 15 minutes before the shift. Outside the zone? It's flagged for you, never blocked. No time clock to buy.",
      shift: 'Today · 4:00 pm – 11:00 pm',
      button: 'Clock in',
      status: 'On site',
      location: '24 m from Harbor Café'
    },
    live: {
      title: "Know who's here, right now",
      body: 'Scheduled, on shift, late: your live dashboard updates the second your team clocks in.',
      liveLabel: 'Live',
      scheduled: 'Scheduled',
      onShift: 'On shift',
      late: 'Late',
      roster: [
        { name: 'Léa', time: '10:00 am', status: 'on' },
        { name: 'Karim', time: '10:00 am', status: 'on' },
        { name: 'Tom', time: '11:00 am', status: 'late' },
        { name: 'Sofia', time: '4:00 pm', status: 'upcoming' }
      ],
      statusLabels: { on: 'On shift', late: 'Late', upcoming: 'Upcoming' }
    },
    swaps: {
      title: 'Shift swaps without the chaos',
      body: 'Your employee asks a coworker, the coworker accepts, you approve. The shift moves by itself.',
      steps: ['Tom asks Léa', 'Léa accepts', 'You approve'],
      done: 'Shift transferred to Léa'
    },
    timeOff: {
      title: 'Time off that blocks the schedule',
      body: 'Approve a request in one tap and those days are locked. Nobody can schedule over them by mistake.',
      request: 'Sofia · Time off',
      dates: 'Jul 16 – Jul 17',
      approved: 'Approved',
      locked: 'Locked in the schedule'
    },
    cost: {
      title: 'Labor costs under control',
      body: 'Weekly hours and estimated labor cost at a glance, with an alert before anyone slips into overtime.',
      label: 'Labor cost this week',
      amount: '$3,184',
      trend: '−6% vs last week',
      days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
      alert: 'Overtime alert',
      alertDetail: 'Karim · 38 h of 40 h'
    },
    exports: {
      title: 'Payroll-ready timesheets',
      body: 'Scheduled vs. clocked hours for every employee, exported to CSV or PDF in one click.',
      columns: ['Employee', 'Scheduled', 'Clocked'],
      rows: [
        ['Léa', '32 h', '32.5 h'],
        ['Karim', '38 h', '38 h'],
        ['Tom', '30 h', '29.2 h']
      ],
      button: 'Export'
    },
    nights: {
      title: 'Open 7 days a week? Night shifts included.',
      body: 'Split opening hours, shifts that run past midnight and a time zone per location. Built for businesses that never really close.',
      chips: [
        'Split opening hours',
        'Shifts past midnight',
        'Weekends & holidays',
        'Time zone per location'
      ]
    }
  },
  comparison: {
    eyebrow: 'Before / after',
    title: 'Goodbye spreadsheet. Goodbye group chat.',
    description:
      'Everything you juggle today between Excel, texts and sticky notes, in one place.',
    oldLabel: 'The old way',
    newLabel: 'With Semiweekly',
    rows: [
      {
        topic: 'Building the week',
        old: 'Hours of copy-paste, every single week',
        new: 'One click, then drag & drop'
      },
      {
        topic: 'Availability',
        old: 'Scattered across texts and memory',
        new: 'Shared once, always up to date'
      },
      {
        topic: 'Shift swaps',
        old: 'Text messages you hear about too late',
        new: 'Asked, accepted and approved in the app'
      },
      {
        topic: 'Time off',
        old: 'Agreed in passing, forgotten in the schedule',
        new: 'Approved in one tap, blocked automatically'
      },
      {
        topic: 'Clock-in',
        old: 'Paper sheet or expensive hardware',
        new: 'Any phone, GPS-verified'
      },
      {
        topic: 'Payroll',
        old: 'Adding up hours by hand',
        new: 'Timesheets exported in one click'
      }
    ]
  },
  industries: {
    eyebrow: "Who it's for",
    title: 'Made for teams that never close and never stay the same',
    description:
      'From 3 people up. Built for small businesses with part-timers, students and seasonal staff.',
    items: [
      {
        title: 'Restaurants, cafés & bars',
        body: 'Lunch rush, dinner service, late closes. Every service covered without the Sunday-night headache.',
        bullets: [
          'Split shifts and late closes',
          'Floor, kitchen and bar at a glance',
          'Last-minute swaps approved in seconds'
        ]
      },
      {
        title: 'Shops & retail',
        body: 'Open 7 days with staff who juggle studies, kids and second jobs. Coverage without the guesswork.',
        bullets: [
          'Opening hours always covered',
          "Part-timers' availability respected",
          'Weekends planned in one click'
        ]
      },
      {
        title: 'Seasonal businesses',
        body: 'New crew every season? Invite them by link, collect their availability and schedule them on day one.',
        bullets: [
          'Onboard a new hire in minutes',
          'Availability collected before day one',
          'Rebuild the week when the team changes'
        ]
      }
    ],
    employee: {
      eyebrow: 'For your team',
      title: 'An app your team will actually open',
      description:
        'Nothing to install. Shifts, clock-in, swaps and time off live on one simple screen, right in their phone browser.',
      bullets: [
        'Next shift and hours this week, front and center',
        'One-tap clock in and clock out',
        'Swap a shift or request time off in seconds',
        'Notified as soon as the schedule changes'
      ],
      phone: {
        greeting: 'Hi Léa 👋',
        nextShiftLabel: 'Next shift',
        nextShift: 'Today · 4:00 – 11:00 pm',
        hoursLabel: 'This week',
        hoursValue: '26 h of 32 h',
        clockIn: 'Clock in',
        swap: 'Swap a shift',
        timeOff: 'Time off',
        notification: 'Your swap with Tom was approved ✓'
      }
    }
  },
  pricing: {
    eyebrow: 'Pricing',
    title: 'Simple pricing. Every feature in every plan.',
    description:
      'A flat price for your whole team, manager included. No per-feature upsell.',
    popular: 'Most popular',
    plans: [
      {
        name: 'Starter',
        price: '$8.99',
        period: '/month',
        seats: 'Up to 5 members',
        note: 'Manager included · under $1.80 per person',
        cta: 'Start free trial'
      },
      {
        name: 'Team',
        price: '$24',
        period: '/month',
        seats: 'Up to 8 members',
        note: 'Manager included · $3 per person',
        cta: 'Start free trial'
      },
      {
        name: 'Lifetime',
        price: '$1,590',
        period: 'one-time',
        seats: 'Unlimited members',
        note: 'Pay once, use it forever',
        cta: 'Get lifetime access'
      }
    ],
    includedTitle: 'Included in every plan',
    included: [
      'One-click auto-scheduling',
      'Drag & drop schedule editor',
      'GPS clock-in from any phone',
      'Shift swaps and time off',
      'Live dashboard and labor costs',
      'Timesheet exports (CSV, PDF)',
      'Night shifts and 7/7 opening hours',
      'Email support'
    ],
    footnote:
      'Prices in USD. Taxes may apply. Upgrade, downgrade or cancel anytime.'
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Questions, answered',
    description: 'Everything you need to know before your first schedule.',
    contactLead: 'Still unsure?',
    contactLink: 'Talk to us',
    items: [
      {
        question: 'How does one-click scheduling work?',
        answer:
          'Each employee enters their recurring availability. When you click Auto-schedule, Semiweekly fills your opening hours with the people who are available, skips approved time off and never books anyone twice. You keep full control: drag & drop anything before you publish.'
      },
      {
        question: 'Do my employees need to install an app?',
        answer:
          'No. Semiweekly works in any phone browser. Your team signs in, sees their shifts, clocks in and sends requests from the same screen, and can add it to their home screen like an app.'
      },
      {
        question: 'How does GPS clock-in work?',
        answer:
          "Employees can clock in from 15 minutes before their shift. Their position is compared with your location's address: inside the radius, all good; outside, the clock-in is flagged for you to review. It's never blocked, so nobody is stuck at the door."
      },
      {
        question: 'Can I still edit the schedule by hand?',
        answer:
          'Of course. Auto-scheduling gives you a solid first draft, then you drag, drop, add or delete shifts freely. If you try to put someone on approved time off, outside their availability or on two shifts at once, Semiweekly stops you right away.'
      },
      {
        question: 'What happens when my team grows?',
        answer:
          'Upgrade in one click from your dashboard. Starter covers up to 5 members, Team up to 8, and Lifetime has no limit. The manager counts as a member.'
      },
      {
        question: 'Does it handle night shifts and 7-day weeks?',
        answer:
          'Yes. Opening hours can be split per day, shifts can run past midnight, and every location has its own time zone.'
      },
      {
        question: 'I run several locations. Does it work for me?',
        answer:
          'Yes. Each location gets its own workspace, team and schedule, and you switch between them from a single account.'
      },
      {
        question: 'Can I try it before paying?',
        answer:
          'Yes. Every plan starts with a free trial: invite your team, run your first auto-schedule and decide afterwards.'
      }
    ]
  },
  cta: {
    title: 'Your next schedule is one click away.',
    description:
      'Invite your team today and let Semiweekly plan next week for you.',
    primary: 'Start free trial',
    secondary: 'Talk to us'
  }
};
