# OnTime

SaaS de planning pour commerces (cafés, restos, salons). Mobile-first (Expo), multi-tenant, rôles Manager / Employé.

## Décisions v1

- **RLS dès le premier jour**, via fonctions `SECURITY DEFINER` (`current_company_id()`, `is_manager()`) — pas de policy `users` qui relit `users`.
- **Profil créé par trigger** `auth.users` → `public.users` (plus d’insert client après signup).
- **Postes** : texte libre `shifts.position_label` (pas de table `positions` pour l’instant).
- **Disponibilités** : récurrentes par `day_of_week` (0 = dimanche, comme `Date.getDay()`), plage 6 AM → 6 AM.
- **Client unique Expo** pour l’instant. Un web manager (Next.js) viendra plus tard.

## Stack

Expo SDK 57 · Expo Router · TypeScript · Supabase (Auth + Postgres)

## Setup

1. Crée un projet Supabase.
2. Colle et exécute [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql) dans le SQL Editor.
3. Auth → désactive la confirmation email tant que tu es en dev.
4. Copie `.env.example` vers `.env` :

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

5. Installe et lance :

```bash
npm install
npx expo start
```

Ouvre iOS / Android, ou `w` pour le web.

## Parcours

- Inscription / connexion. Code commerce optionnel à l’inscription.
- Sans commerce → créer (devient manager, slug généré) ou rejoindre (employé).
- Employé : dispos, calendrier liste/semaine, tickets, dashboard.
- Manager : planning (pool du jour + overlap 6–14 / 14–22 / 22–6), équipe, tickets, dashboard. Le code d’invitation est sur le profil.

Intersection : dispo 9h–18h + clic sur 14–22 → shift 14h–18h. Aucun overlap → refus.

## Sécurité

Les policies s’appuient sur `auth.uid()` via des fonctions `SECURITY DEFINER`. Les RPC `create_company` / `join_company` sont le seul moyen de rattacher un compte à un commerce. Ne jamais remettre RLS à off.
