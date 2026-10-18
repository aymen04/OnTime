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
  ClockIcon // Ajout de l'icône pour les disponibilités
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
export function createMainNavItems(slug: string): NavItem[] {
  return [
    {
      title: 'Tableau de bord',
      href: replaceOrgSlug(routes.dashboard.organizations.slug.Home, slug),
      icon: HomeIcon
    },
    {
      title: 'Planificateur',
      href: `/organizations/${slug}/schedule`,
      icon: CalendarIcon,
    },
    {
      title: 'Échanges de shifts',
      href: `/organizations/${slug}/swaps`,
      icon: ArrowRightLeftIcon,
    },
    // NOUVEAU LIEN : Mes disponibilités
    {
      title: 'Mes disponibilités',
      href: `/organizations/${slug}/availabilities`,
      icon: ClockIcon,
    }
  ];
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