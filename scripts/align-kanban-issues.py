#!/usr/bin/env python3
"""Aligner les issues kanban sur le monorepo Next/Prisma actuel + stack simple."""

from __future__ import annotations

import json
import subprocess
import sys

REPO = "aymen04/OnTime"

# number -> (title|None, body, remove_labels, add_labels)
UPDATES: dict[int, tuple[str | None, str, list[str], list[str]]] = {}


def body(notes: str, epic: str, effort: str, etat: str, version: str) -> str:
    effort_label = {"S": "S (< 1 j)", "M": "M (2–4 j)", "L": "L (1 sem+)"}[effort]
    return (
        f"{notes.rstrip()}\n\n"
        f"**Épic :** {epic}\n"
        f"**Effort :** {effort_label}\n"
        f"**État :** {etat}\n"
        f"**Version :** {version}\n"
    )


def set_issue(
    n: int,
    *,
    title: str | None,
    notes: str,
    epic: str,
    effort: str,
    etat: str,
    version: str,
    remove: list[str],
    add: list[str],
) -> None:
    UPDATES[n] = (title, body(notes, epic, effort, etat, version), remove, add)


# --- Fondation / décision stack ---
set_issue(
    3,
    title="Décision stack : Prisma/Postgres du template (Supabase abandonné)",
    notes="""## Décision (tranchée)

Le repo est le monorepo **Next.js + Prisma + Auth.js**. On **n'utilise pas Supabase**.

Tout le métier OnTime vit dans `packages/database` (Prisma) + `apps/dashboard`.

Voir le tableau stack dans #1.

Plus rien à trancher — issue de traçabilité.""",
    epic="Fondation",
    effort="S",
    etat="Dans le template",
    version="MVP",
    remove=["état:Nouveau"],
    add=["état:Dans le template"],
)

# --- Équipe / Pointage / Dashboard encore « Existe dans Expo » ---
set_issue(
    12,
    title=None,
    notes="""Liste Membership de l'`Organization`, actif/inactif, résumé des disponibilités.

Spec métier : CDC §9. À implémenter dans le dashboard Next (pas de code Expo dans ce repo).""",
    epic="Équipe",
    effort="S",
    etat="À porter",
    version="MVP",
    remove=["état:Existe dans Expo"],
    add=["état:À porter"],
)

set_issue(
    13,
    title="Adresse Organization + géocodage Nominatim",
    notes="""`Organization.address` existe déjà dans Prisma — étendre avec lat/lng si besoin.

Recherche adresse debounce 600 ms via **Nominatim** (gratuit, sans clé — choix stack #1).

Spec : CDC §10.""",
    epic="Pointage",
    effort="S",
    etat="Partiel",
    version="MVP",
    remove=["état:Existe dans Expo"],
    add=["état:Partiel"],
)

set_issue(
    14,
    title=None,
    notes="""Clock in/out dans le dashboard web : géoloc navigateur (`navigator.geolocation`), rayon 150 m, `flagged` si hors zone, fenêtre −15 min avant le shift.

Jamais bloquant : hors zone = flagged.

Spec : CDC §10. Réf. historique Expo `locationService.ts` (hors repo).""",
    epic="Pointage",
    effort="M",
    etat="À porter",
    version="MVP",
    remove=["état:Existe dans Expo"],
    add=["état:À porter"],
)

set_issue(
    15,
    title=None,
    notes="""Côté ADMIN : 5 derniers pointages / 14 jours par employé, badge si flagged, en dépli dans la carte membre.

Spec : CDC §9.""",
    epic="Pointage",
    effort="S",
    etat="À porter",
    version="MVP",
    remove=["état:Existe dans Expo"],
    add=["état:À porter"],
)

set_issue(
    16,
    title="Dashboard ADMIN (stats) + accueil MEMBER (prochain shift, heures, clock)",
    notes="""Accueil différencié selon `Membership.role` (ADMIN / MEMBER).

Spec : CDC §13. À construire dans `apps/dashboard` (remplacer les widgets CRM contacts du template).""",
    epic="Dashboard",
    effort="M",
    etat="À porter",
    version="MVP",
    remove=["état:Existe dans Expo"],
    add=["état:À porter"],
)

set_issue(
    17,
    title="Stripe OnTime : produit/prix + essai gratuit + blocage si impayé",
    notes="""**Stripe est déjà le provider billing** (`packages/billing` → Stripe).

À faire :
- Créer produit/prix OnTime dans Stripe Dashboard
- Remplir `NEXT_PUBLIC_BILLING_PRICE_*` + `BILLING_STRIPE_*` (voir `apps/dashboard/.env.example`)
- Brancher essai gratuit + garde « subscription inactive » sur le dashboard

Pas de Lemon Squeezy.""",
    epic="Billing",
    effort="M",
    etat="Dans le template",
    version="MVP",
    remove=["état:Nouveau"],
    add=["état:Dans le template"],
)

set_issue(
    18,
    title="Activer reset mot de passe + confirmation email (prod)",
    notes="""Déjà dans le template :
- `ResetPasswordRequest` (Prisma)
- flux forgot/reset password Auth.js
- `emailVerified` / verify-email
- emails via **NodeMailer** (`EMAIL_NODEMAILER_URL` dans `.env.example`)

À faire pour la prod : SMTP réel (ou Resend plus tard), activer les garde-fous email, tester le parcours bout-en-bout.

Pas de nouveau provider à inventer pour le MVP.""",
    epic="Auth & onboarding",
    effort="M",
    etat="Dans le template",
    version="MVP",
    remove=["état:Nouveau"],
    add=["état:Dans le template"],
)

set_issue(
    19,
    title=None,
    notes="""Staging + compte démo client.

Stack simple : Postgres managé (ou Neon) + deploy Vercel/Fly des apps `dashboard` (+ `marketing` si besoin). Pas de Supabase.""",
    epic="Fondation",
    effort="S",
    etat="Nouveau",
    version="MVP",
    remove=[],
    add=[],
)

set_issue(
    20,
    title=None,
    notes="""Tickets `time_off` / `issue` + approve/reject ADMIN. Dates start/end pour congés.

Spec : CDC §8. Modèles à ajouter en Prisma (#1) puis UI dashboard.""",
    epic="Tickets",
    effort="M",
    etat="À porter",
    version="V1",
    remove=["état:Existe dans Expo"],
    add=["état:À porter"],
)

set_issue(
    21,
    title=None,
    notes="""Workflow 3 étapes MEMBER A → MEMBER B → ADMIN + transfert atomique du shift (transaction Prisma).

Spec : CDC §8. À porter dans le dashboard (pas de RPC Supabase).""",
    epic="Swaps",
    effort="L",
    etat="À porter",
    version="V1",
    remove=["état:Existe dans Expo"],
    add=["état:À porter"],
)

set_issue(
    23,
    title=None,
    notes="""UI grille Début/Fin des dispos dans le dashboard (composant type TimeRangeSlider).

Mockup `composant-plage-horaire.png`. L'ancien `TimeRangeSlider.tsx` Expo n'est **plus dans ce repo** — à réécrire en React/shadcn.""",
    epic="Disponibilités",
    effort="M",
    etat="À porter",
    version="V1",
    remove=["état:Partiel"],
    add=["état:À porter"],
)

set_issue(
    26,
    title=None,
    notes="""Le modèle Prisma `Notification` existe déjà dans le template — aucune logique OnTime branchée.

À brancher : événements ticket, swap, pointage flaggé (in-app).

Infra partielle → logique métier à écrire.""",
    epic="Notifications",
    effort="M",
    etat="Partiel",
    version="V1",
    remove=["état:Nouveau"],
    add=["état:Partiel"],
)

set_issue(
    28,
    title="Branding par Organization : logo + palette 12 couleurs",
    notes="""Déjà dans le template : `Organization.logo` + `OrganizationLogo`.

Manque : palette (primary/accent ou 12 couleurs) en base + UI settings.

Spec CDC : colonnes logo/couleurs ; à modéliser en Prisma puis brancher le thème dashboard.""",
    epic="Branding",
    effort="M",
    etat="Partiel",
    version="V2",
    remove=[],
    add=[],
)

set_issue(
    29,
    title="Organization switcher multi-établissements",
    notes="""Le template gère déjà **plusieurs Memberships** par User + switch d'org.

À adapter UX OnTime (commerces) et règles métier (un employé sur plusieurs établissements).

Pas à reconstruire from scratch.""",
    epic="Auth & onboarding",
    effort="L",
    etat="Dans le template",
    version="V2",
    remove=["état:Nouveau"],
    add=["état:Dans le template"],
)

set_issue(
    32,
    title=None,
    notes="""Provider email MVP : **NodeMailer** (défaut `packages/email`).

Déjà : invitation email template.

À ajouter : planning publié, rappel de shift.

Resend/Postmark/SendGrid = option plus tard (1 clé API), pas requis MVP.""",
    epic="Notifications",
    effort="M",
    etat="Partiel",
    version="V2",
    remove=["état:Nouveau"],
    add=["état:Partiel"],
)

set_issue(
    33,
    title="Horaires d'ouverture Organization branchés au planning",
    notes="""Déjà dans Prisma : `WorkHours` + `WorkTimeSlot` liés à `Organization` (business hours du template).

À brancher au planning OnTime (contraintes créneaux), à la place de l'ancien `company_settings` opening/closing.""",
    epic="Planning",
    effort="S",
    etat="Partiel",
    version="V2",
    remove=[],
    add=[],
)

set_issue(
    36,
    title="App mobile (Expo) branchée sur l'API du monorepo",
    notes="""Hors scope immédiat : l'app Expo **n'est plus dans ce repo**.

Plus tard : app mobile séparée (ou `apps/mobile`) consommant `apps/public-api` / mêmes modèles Prisma — plus de Supabase client-side.

État : nouveau chantier, pas un rebase partiel du code actuel.""",
    epic="Mobile",
    effort="L",
    etat="Nouveau",
    version="V3+",
    remove=["état:Partiel"],
    add=["état:Nouveau"],
)


def run(cmd: list[str], check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, check=check, text=True, capture_output=True)


def ensure_labels() -> None:
    existing = {
        x["name"]
        for x in json.loads(
            run(["gh", "label", "list", "--repo", REPO, "--limit", "200", "--json", "name"]).stdout
        )
    }
    wanted = [
        ("état:À porter", "0E8A16", "À implémenter dans le monorepo (spec CDC)"),
        ("état:Dans le template", "5319E7", "Déjà fourni par le starter — à configurer/adapter"),
        ("état:Partiel", "FBCA04", "Partiellement présent (template ou schéma)"),
        ("état:Nouveau", "D4C5F9", "Nouveau"),
    ]
    for name, color, desc in wanted:
        if name in existing:
            run(
                ["gh", "label", "edit", name, "--repo", REPO, "--color", color, "--description", desc],
                check=False,
            )
        else:
            run(
                ["gh", "label", "create", name, "--repo", REPO, "--color", color, "--description", desc]
            )


def apply(n: int, title: str | None, body_text: str, remove: list[str], add: list[str]) -> None:
    cmd = ["gh", "issue", "edit", str(n), "--repo", REPO, "--body", body_text]
    if title:
        cmd.extend(["--title", title])
    for lab in remove:
        cmd.extend(["--remove-label", lab])
    for lab in add:
        cmd.extend(["--add-label", lab])
    run(cmd)
    print(f"  updated #{n}" + (f" — {title}" if title else ""))


def main() -> int:
    print("==> Labels")
    ensure_labels()
    print(f"==> Updating {len(UPDATES)} issues")
    for n in sorted(UPDATES):
        title, body_text, remove, add = UPDATES[n]
        apply(n, title, body_text, remove, add)

    # Close #3 as decided
    print("==> Closing #3 (décision prise)")
    run(
        [
            "gh",
            "issue",
            "close",
            "3",
            "--repo",
            REPO,
            "--reason",
            "completed",
            "--comment",
            "Décision actée : **PostgreSQL + Prisma** du monorepo. Supabase abandonné. Stack détaillée dans #1.",
        ]
    )
    print("==> Done")
    print(f"    https://github.com/{REPO}/issues")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except subprocess.CalledProcessError as e:
        print(e.stderr or e.stdout or str(e), file=sys.stderr)
        raise SystemExit(1)
