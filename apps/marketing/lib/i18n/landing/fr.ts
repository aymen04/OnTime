import { type LandingDictionary } from './types';

export const fr: LandingDictionary = {
  meta: {
    title: 'Semiweekly — Le planning de votre équipe en un clic',
    description:
      'Semiweekly construit le planning de votre équipe à partir des disponibilités de chacun, en un clic. Ajustez en glisser-déposer, pointage GPS, échanges de shifts et congés. Pensé pour les restaurants, commerces et équipes saisonnières ouverts 7j/7.'
  },
  hero: {
    badge: 'Accès anticipé — on accueille nos premières équipes',
    titleLead: 'Le planning de la semaine.',
    titleHighlight: 'En un clic.',
    description:
      'Semiweekly construit le planning de votre équipe à partir des dispos de chacun, en respectant vos horaires d’ouverture et les congés validés. Ensuite, vous ajustez en glisser-déposer, comme dans un agenda.',
    primaryCta: 'Démarrer l’essai gratuit',
    secondaryCta: 'Voir la démo',
    reassurance: [
      'Dès 8,99 $/mois',
      'Prêt en quelques minutes',
      'Sans engagement'
    ]
  },
  demo: {
    businessName: 'Le Comptoir',
    week: 'Semaine du 14 juillet',
    autoSchedule: 'Planifier',
    scheduling: 'Planification…',
    reset: 'Recommencer',
    team: 'Équipe',
    days: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    dayNames: [
      'lundi',
      'mardi',
      'mercredi',
      'jeudi',
      'vendredi',
      'samedi',
      'dimanche'
    ],
    roles: { floor: 'Salle', kitchen: 'Cuisine', bar: 'Bar' },
    slots: { am: '10h–16h', pm: '16h–23h' },
    availability: {
      all: 'Journée',
      am: 'Matin',
      pm: 'Soir',
      off: 'Indispo',
      leave: 'Congé'
    },
    idleMessage: 'Les dispos de toute l’équipe sont là. Cliquez sur Planifier.',
    schedulingMessage: 'On croise dispos, horaires d’ouverture et congés…',
    doneMessage:
      'Semaine planifiée, zéro conflit. Glissez un shift pour ajuster.',
    movedMessage: 'C’est fait : {name} travaille {day}.',
    errors: {
      unavailable: 'Bloqué : {name} n’est pas dispo {day}.',
      leave: 'Bloqué : {name} est en congé validé.',
      occupied: 'Bloqué : {name} travaille déjà {day}. Pas de double shift.'
    },
    stats: { shifts: 'shifts', hours: 'heures', conflicts: 'conflit' },
    swipeHint: 'Faites glisser pour voir toute la semaine'
  },
  pain: {
    eyebrow: 'Ça vous parle ?',
    title: 'Dimanche, 23 h. Vous êtes encore sur le planning.',
    description:
      'Planifier une petite équipe qui change à chaque saison ne devrait pas vous coûter vos week-ends.',
    items: [
      {
        title: 'Le tableur que personne ne lit',
        body: 'Vous le refaites chaque semaine, vous postez une capture dans le groupe, et quelqu’un arrive quand même à la mauvaise heure.'
      },
      {
        title: 'Les échanges par SMS',
        body: '« Tu peux me remplacer samedi ? » Vous l’apprenez à 17 h, quand personne ne se présente.'
      },
      {
        title: 'Planifié pendant son congé',
        body: 'Un congé accordé entre deux portes, oublié dans le planning. Résultat : il vous manque quelqu’un vendredi soir.'
      },
      {
        title: 'Les surprises de fin de mois',
        body: 'Des heures notées sur papier, des heures sup repérées trop tard, et une soirée de calculs à chaque paie.'
      }
    ],
    chat: {
      group: 'Équipe Le Comptoir 🍳',
      members: '8 membres',
      messages: [
        {
          author: 'Tom',
          time: '22:52',
          text: 'Quelqu’un peut prendre mon samedi soir ?? 🙏'
        },
        {
          author: 'Sofia',
          time: '22:54',
          text: 'Je t’avais dit que j’étais off jeudi…'
        },
        {
          author: 'Karim',
          time: '22:58',
          text: 'Qui ouvre demain ?'
        },
        {
          author: 'Léa',
          time: '23:03',
          text: 'Je bosse dimanche ou pas ? 😅'
        },
        {
          author: 'Vous',
          time: '23:09',
          text: 'Le nouveau planning arrive ce soir, promis 😩'
        }
      ]
    }
  },
  steps: {
    eyebrow: 'Comment ça marche',
    title: 'Des dispos au planning publié, en trois étapes',
    description:
      'Pas de formation, pas de projet de mise en place. Votre premier planning est prêt avant que votre café refroidisse.',
    items: [
      {
        title: 'L’équipe renseigne ses dispos',
        body: 'Chaque employé indique ses disponibilités récurrentes depuis son téléphone, une seule fois. Il les met à jour quand sa vie change.'
      },
      {
        title: 'Vous cliquez sur Planifier',
        body: 'Semiweekly place tout le monde en quelques secondes, dans vos horaires d’ouverture, autour des congés validés, sans aucun double shift.'
      },
      {
        title: 'Glissez, déposez, publiez',
        body: 'Ajustez ce que vous voulez comme dans un agenda, puis publiez. Chacun reçoit ses shifts sur son téléphone.'
      }
    ],
    visuals: {
      days: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
      button: 'Planifier',
      placed: '28 shifts placés',
      published: 'Planning publié'
    }
  },
  features: {
    eyebrow: 'Tout au même endroit',
    title: 'Planifiez. Pointez. Validez.',
    description:
      'Une seule app pour le planning, la pointeuse et toutes les demandes de votre équipe.',
    clock: {
      title: 'Pointage depuis n’importe quel téléphone',
      body: 'Pointage vérifié par GPS, ouvert 15 minutes avant le shift. Hors zone ? C’est signalé, jamais bloqué. Aucune pointeuse à acheter.',
      shift: 'Aujourd’hui · 16h00 – 23h00',
      button: 'Pointer',
      status: 'Sur place',
      location: 'À 24 m du Comptoir'
    },
    live: {
      title: 'Qui est là, en temps réel',
      body: 'Prévus, en poste, en retard : votre tableau de bord se met à jour à la seconde où l’équipe pointe.',
      liveLabel: 'En direct',
      scheduled: 'Prévus',
      onShift: 'En poste',
      late: 'En retard',
      roster: [
        { name: 'Léa', time: '10h00', status: 'on' },
        { name: 'Karim', time: '10h00', status: 'on' },
        { name: 'Tom', time: '11h00', status: 'late' },
        { name: 'Sofia', time: '16h00', status: 'upcoming' }
      ],
      statusLabels: { on: 'En poste', late: 'En retard', upcoming: 'À venir' }
    },
    swaps: {
      title: 'Des échanges de shifts sans le chaos',
      body: 'L’employé demande à un collègue, le collègue accepte, vous validez. Le shift change de main tout seul.',
      steps: ['Tom demande à Léa', 'Léa accepte', 'Vous validez'],
      done: 'Shift transféré à Léa'
    },
    timeOff: {
      title: 'Des congés qui bloquent le planning',
      body: 'Validez une demande en un clic et ces jours sont verrouillés. Impossible de planifier quelqu’un dessus par erreur.',
      request: 'Sofia · Congé',
      dates: '16 – 17 juil.',
      approved: 'Validé',
      locked: 'Verrouillé dans le planning'
    },
    cost: {
      title: 'La masse salariale sous contrôle',
      body: 'Heures de la semaine et coût salarial estimé en un coup d’œil, avec une alerte avant que quelqu’un passe en heures sup.',
      label: 'Coût salarial cette semaine',
      amount: '3 184 $',
      trend: '−6 % vs semaine dernière',
      days: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
      alert: 'Alerte heures sup',
      alertDetail: 'Karim · 38 h sur 40 h'
    },
    exports: {
      title: 'Des feuilles de temps prêtes pour la paie',
      body: 'Heures prévues vs pointées pour chaque employé, exportées en CSV ou PDF en un clic.',
      columns: ['Employé', 'Prévu', 'Pointé'],
      rows: [
        ['Léa', '32 h', '32,5 h'],
        ['Karim', '38 h', '38 h'],
        ['Tom', '30 h', '29,2 h']
      ],
      button: 'Exporter'
    },
    nights: {
      title: 'Ouvert 7j/7 ? Les shifts de nuit aussi.',
      body: 'Horaires d’ouverture en plusieurs créneaux, shifts qui passent minuit et un fuseau horaire par établissement. Pensé pour les commerces qui ne ferment presque jamais.',
      chips: [
        'Horaires en coupure',
        'Shifts après minuit',
        'Week-ends et jours fériés',
        'Fuseau par établissement'
      ]
    }
  },
  comparison: {
    eyebrow: 'Avant / après',
    title: 'Adieu le tableur. Adieu le groupe WhatsApp.',
    description:
      'Tout ce que vous jonglez aujourd’hui entre Excel, SMS et post-it, au même endroit.',
    oldLabel: 'Avant',
    newLabel: 'Avec Semiweekly',
    rows: [
      {
        topic: 'Faire la semaine',
        old: 'Des heures de copier-coller, chaque semaine',
        new: 'Un clic, puis du glisser-déposer'
      },
      {
        topic: 'Disponibilités',
        old: 'Éparpillées entre SMS et mémoire',
        new: 'Renseignées une fois, toujours à jour'
      },
      {
        topic: 'Échanges de shifts',
        old: 'Des SMS dont vous entendez parler trop tard',
        new: 'Demandés, acceptés et validés dans l’app'
      },
      {
        topic: 'Congés',
        old: 'Accordés entre deux portes, oubliés au planning',
        new: 'Validés en un clic, bloqués automatiquement'
      },
      {
        topic: 'Pointage',
        old: 'Feuille papier ou pointeuse hors de prix',
        new: 'N’importe quel téléphone, vérifié par GPS'
      },
      {
        topic: 'Paie',
        old: 'Additionner les heures à la main',
        new: 'Feuilles de temps exportées en un clic'
      }
    ]
  },
  industries: {
    eyebrow: 'Pour qui',
    title: 'Pour les équipes qui ne ferment jamais et changent tout le temps',
    description:
      'Dès 3 personnes. Pensé pour les petites structures avec des temps partiels, des étudiants et des saisonniers.',
    items: [
      {
        title: 'Restaurants, cafés et bars',
        body: 'Coup de feu du midi, service du soir, fermetures tardives. Chaque service couvert, sans la migraine du dimanche soir.',
        bullets: [
          'Coupures et fermetures tardives',
          'Salle, cuisine et bar en un coup d’œil',
          'Remplacements de dernière minute validés en secondes'
        ]
      },
      {
        title: 'Commerces et boutiques',
        body: 'Ouvert 7j/7 avec une équipe qui jongle entre études, enfants et second job. Une couverture sans devinettes.',
        bullets: [
          'Horaires d’ouverture toujours couverts',
          'Dispos des temps partiels respectées',
          'Week-ends planifiés en un clic'
        ]
      },
      {
        title: 'Activités saisonnières',
        body: 'Nouvelle équipe à chaque saison ? Invitez-la par lien, récupérez ses dispos et planifiez-la dès le premier jour.',
        bullets: [
          'Un nouvel arrivant intégré en quelques minutes',
          'Dispos récupérées avant le premier jour',
          'La semaine refaite quand l’équipe change'
        ]
      }
    ],
    employee: {
      eyebrow: 'Pour votre équipe',
      title: 'Une app que votre équipe ouvre vraiment',
      description:
        'Rien à installer. Shifts, pointage, échanges et congés tiennent sur un seul écran, directement dans le navigateur du téléphone.',
      bullets: [
        'Prochain shift et heures de la semaine, bien en vue',
        'Pointage d’entrée et de sortie en un clic',
        'Échanger un shift ou poser un congé en quelques secondes',
        'Notifié dès que le planning change'
      ],
      phone: {
        greeting: 'Salut Léa 👋',
        nextShiftLabel: 'Prochain shift',
        nextShift: 'Aujourd’hui · 16h – 23h',
        hoursLabel: 'Cette semaine',
        hoursValue: '26 h sur 32 h',
        clockIn: 'Pointer',
        swap: 'Échanger',
        timeOff: 'Congé',
        notification: 'Ton échange avec Tom est validé ✓'
      }
    }
  },
  pricing: {
    eyebrow: 'Tarifs',
    title: 'Des prix simples. Toutes les fonctionnalités dans chaque offre.',
    description:
      'Un prix fixe pour toute l’équipe, manager compris. Aucune option payante cachée.',
    popular: 'Le plus choisi',
    plans: [
      {
        name: 'Starter',
        price: '8,99 $',
        period: '/mois',
        seats: 'Jusqu’à 5 membres',
        note: 'Manager compris · moins de 1,80 $ par personne',
        cta: 'Essai gratuit'
      },
      {
        name: 'Équipe',
        price: '24 $',
        period: '/mois',
        seats: 'Jusqu’à 8 membres',
        note: 'Manager compris · 3 $ par personne',
        cta: 'Essai gratuit'
      },
      {
        name: 'À vie',
        price: '1 590 $',
        period: 'une fois',
        seats: 'Membres illimités',
        note: 'Payez une fois, utilisez-le pour toujours',
        cta: 'Accès à vie'
      }
    ],
    includedTitle: 'Inclus dans toutes les offres',
    included: [
      'Planning automatique en un clic',
      'Éditeur en glisser-déposer',
      'Pointage GPS depuis le téléphone',
      'Échanges de shifts et congés',
      'Tableau de bord en direct et coûts',
      'Export des feuilles de temps (CSV, PDF)',
      'Shifts de nuit et ouverture 7j/7',
      'Support par e-mail'
    ],
    footnote:
      'Prix en dollars US, hors taxes éventuelles. Changez d’offre ou résiliez quand vous voulez.'
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Vos questions, nos réponses',
    description: 'Tout ce qu’il faut savoir avant votre premier planning.',
    contactLead: 'Encore un doute ?',
    contactLink: 'Parlons-en',
    items: [
      {
        question: 'Comment marche le planning en un clic ?',
        answer:
          'Chaque employé renseigne ses disponibilités récurrentes. Quand vous cliquez sur Planifier, Semiweekly remplit vos horaires d’ouverture avec les personnes disponibles, contourne les congés validés et ne place jamais quelqu’un deux fois. Vous gardez la main : tout se déplace en glisser-déposer avant publication.'
      },
      {
        question: 'Mes employés doivent-ils installer une app ?',
        answer:
          'Non. Semiweekly fonctionne dans le navigateur de n’importe quel téléphone. L’équipe se connecte, voit ses shifts, pointe et envoie ses demandes depuis le même écran, et peut l’ajouter à l’écran d’accueil comme une app.'
      },
      {
        question: 'Comment fonctionne le pointage GPS ?',
        answer:
          'Le pointage ouvre 15 minutes avant le shift. La position de l’employé est comparée à l’adresse de votre établissement : dans le rayon, tout va bien ; en dehors, le pointage vous est signalé pour vérification. Il n’est jamais bloqué, personne ne reste coincé à la porte.'
      },
      {
        question: 'Je peux encore modifier le planning à la main ?',
        answer:
          'Bien sûr. Le planning automatique vous donne une première version solide, puis vous déplacez, ajoutez ou supprimez des shifts librement. Si vous essayez de placer quelqu’un pendant un congé validé, hors de ses dispos ou sur deux shifts à la fois, Semiweekly vous arrête tout de suite.'
      },
      {
        question: 'Que se passe-t-il quand mon équipe grandit ?',
        answer:
          'Vous changez d’offre en un clic depuis votre tableau de bord. Starter couvre jusqu’à 5 membres, Équipe jusqu’à 8, et l’offre À vie n’a pas de limite. Le manager compte comme un membre.'
      },
      {
        question: 'Ça gère les shifts de nuit et l’ouverture 7j/7 ?',
        answer:
          'Oui. Les horaires d’ouverture peuvent être découpés par jour, les shifts peuvent passer minuit et chaque établissement a son propre fuseau horaire.'
      },
      {
        question: 'J’ai plusieurs établissements. Ça marche pour moi ?',
        answer:
          'Oui. Chaque établissement a son espace, son équipe et son planning, et vous passez de l’un à l’autre depuis un seul compte.'
      },
      {
        question: 'Je peux essayer avant de payer ?',
        answer:
          'Oui. Chaque offre commence par un essai gratuit : invitez votre équipe, lancez votre premier planning automatique et décidez ensuite.'
      }
    ]
  },
  cta: {
    title: 'Votre prochain planning est à un clic.',
    description:
      'Invitez votre équipe aujourd’hui et laissez Semiweekly planifier la semaine prochaine.',
    primary: 'Démarrer l’essai gratuit',
    secondary: 'Parlons-en'
  }
};
