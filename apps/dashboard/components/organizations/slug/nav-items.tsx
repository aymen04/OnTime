import {
  BellIcon,
  CreditCardIcon,
  HomeIcon,
  LockKeyholeIcon,
  SettingsIcon,
  StoreIcon,
  UserIcon,
  UserPlus2Icon,
  CalendarIcon,
  ArrowRightLeftIcon,
  ClockIcon,
  InboxIcon,
  TrendingUpIcon // <-- Ajout de l'icône ici
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { replaceOrgSlug, routes } from '@workspace/routes';

type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  icon: LucideIcon;
};

// 1. MENU PRINCIPAL (La barre latérale)
// On ajoute "role" comme paramètre (optionnel pour ne pas casser tes autres composants)
export function createMainNavItems(slug: string, role?: string | null): NavItem[] {
  // Les liens de base que tout le monde voit
  const links: NavItem[] = [
    {
      title: 'Tableau de bord',
      href: replaceOrgSlug(routes.dashboard.organizations.slug.Home, slug),
      icon: HomeIcon
    },
    {
      title: 'Échanges de shifts',
      href: `/organizations/${slug}/swaps`,
      icon: ArrowRightLeftIcon,
    },
    {
      title: 'Mes disponibilités',
      href: `/organizations/${slug}/availabilities`,
      icon: ClockIcon,
    }
  ];

  // Les liens réservés aux managers
  if (role === 'manager') {
    // On ajoute le Planificateur en 2ème position
    links.splice(1, 0, {
      title: 'Planificateur',
      href: `/organizations/${slug}/schedule`,
      icon: CalendarIcon,
    });
    
    // NOUVEAU LIEN : Suivi Business (uniquement pour le manager)
    links.push({
      title: 'Suivi Business',
      href: `/organizations/${slug}/metrics`,
      icon: TrendingUpIcon,
    });
    
    // On ajoute les Demandes à la fin
    links.push({
      title: 'Demandes',
      href: `/organizations/${slug}/requests`,
      icon: InboxIcon,
    });
  }

  return links;
}

// 2. MENU COMPTE UTILISATEUR (Paramètres persos)
export function createAccountNavItems(slug: string): NavItem[] {
  return [
    {
      title: 'Mon Profil',
      href: replaceOrgSlug(routes.dashboard.organizations.slug.settings.account.Profile, slug),
      icon: UserIcon
    },
    {
      title: 'Sécurité',
      href: replaceOrgSlug(routes.dashboard.organizations.slug.settings.account.Security, slug),
      icon: LockKeyholeIcon
    },
    {
      title: 'Notifications',
      href: replaceOrgSlug(routes.dashboard.organizations.slug.settings.account.Notifications, slug),
      icon: BellIcon
    }
  ];
}

// 3. MENU ORGANISATION (Paramètres de l'entreprise)
export function createOrganizationNavItems(slug: string): NavItem[] {
  return [
    {
      title: 'Général',
      href: replaceOrgSlug(routes.dashboard.organizations.slug.settings.organization.General, slug),
      icon: StoreIcon
    },
    {
      title: 'Membres & Équipe',
      href: replaceOrgSlug(routes.dashboard.organizations.slug.settings.organization.Members, slug),
      icon: UserPlus2Icon
    },
    {
      title: 'Facturation',
      href: replaceOrgSlug(routes.dashboard.organizations.slug.settings.organization.Billing, slug),
      icon: CreditCardIcon
    }
  ];
}