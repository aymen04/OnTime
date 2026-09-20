#!/usr/bin/env python3
"""Crée les 38 issues du kanban OnTime (labels inclus, sans GitHub Project)."""

from __future__ import annotations

import json
import subprocess
import sys

REPO = "aymen04/OnTime"

LABELS = [
    ("MVP", "0E8A16", "Version MVP"),
    ("V1", "1D76DB", "Version V1 — rétention"),
    ("V2", "5319E7", "Version V2 — différenciation"),
    ("V3+", "B60205", "Version V3+ — plus tard"),
    ("effort:S", "C2E0C6", "Effort S (< 1 j)"),
    ("effort:M", "FEF2C0", "Effort M (2–4 j)"),
    ("effort:L", "F9D0C4", "Effort L (1 sem+)"),
    ("état:Nouveau", "D4C5F9", "Nouveau"),
    ("état:Partiel", "FBCA04", "Partiel"),
    ("état:Existe dans Expo", "0052CC", "Logique déjà écrite dans Expo"),
    ("épic:Fondation", "BFDADC", "Fondation"),
    ("épic:Auth & onboarding", "D93F0B", "Auth & onboarding"),
    ("épic:Dashboard", "006B75", "Dashboard"),
    ("épic:Disponibilités", "F9D0C4", "Disponibilités"),
    ("épic:Planning", "C5DEF5", "Planning"),
    ("épic:Équipe", "BFD4F2", "Équipe"),
    ("épic:Pointage", "E99695", "Pointage"),
    ("épic:Billing", "F9D0C4", "Billing"),
    ("épic:Tickets", "D4C5F9", "Tickets"),
    ("épic:Swaps", "FEF2C0", "Swaps"),
    ("épic:Exports", "C2E0C6", "Exports"),
    ("épic:Notifications", "7057FF", "Notifications"),
    ("épic:Branding", "E4E669", "Branding"),
    ("épic:Mobile", "5319E7", "Mobile"),
]

# version, epic, effort, etat, title, notes
ISSUES: list[tuple[str, str, str, str, str, str]] = [
    (
        "MVP",
        "Fondation",
        "M",
        "Partiel",
        "Schéma de données aligné CDC §3 (+ fuseau horaire par commerce) + thème Blue/Inter",
        "Source de vérité : CDC §3, pas 001_init.sql. À adapter au bon template.",
    ),
    (
        "MVP",
        "Fondation",
        "S",
        "Nouveau",
        "Migration initiale + seed commerce démo",
        "Seed : 1 commerce, 1 manager, 4 employés, dispos, 1 semaine de shifts.",
    ),
    (
        "MVP",
        "Fondation",
        "S",
        "Nouveau",
        "Trancher le backend unique (Supabase existant vs base du template)",
        "Tant que l'Expo et le web ne pointent pas sur la même base, les données ne se parlent pas.",
    ),
    (
        "MVP",
        "Fondation",
        "M",
        "Existe dans Expo",
        "Isolation multi-tenant + garde par rôle sur chaque requête",
        "RLS si Supabase, sinon filtre par commerce côté serveur. Faille entre commerces sinon.",
    ),
    (
        "MVP",
        "Auth & onboarding",
        "M",
        "Existe dans Expo",
        "Créer un commerce (slug d'invitation, rôles, settings par défaut)",
        "Équivalent du RPC create_company, atomique.",
    ),
    (
        "MVP",
        "Auth & onboarding",
        "S",
        "Existe dans Expo",
        "Rejoindre un commerce via code (à l'inscription ou après)",
        "Équivalent du RPC join_company. Slug insensible à la casse.",
    ),
    (
        "MVP",
        "Dashboard",
        "S",
        "Existe dans Expo",
        "Navigation conditionnée par rôle (manager / employé)",
        "Accueil, Horaires, Équipe, Profil.",
    ),
    (
        "MVP",
        "Disponibilités",
        "M",
        "Existe dans Expo",
        "Disponibilités récurrentes CRUD (overnight jusqu'à 6h j+1)",
        "Minutes 360→1800. Logique de référence : lib/time.ts (Expo).",
    ),
    (
        "MVP",
        "Planning",
        "L",
        "Existe dans Expo",
        "Planning manager : pool du jour + créneaux 6-14/14-22/22-6 + bestOverlap",
        "Cœur du produit. Mockup workflow-assignation-planning.png.",
    ),
    (
        "MVP",
        "Planning",
        "S",
        "Existe dans Expo",
        "Planning : vue d'ensemble semaine (lecture seule) + suppression shift",
        "Vue d'ensemble semaine en lecture seule + suppression de shift.",
    ),
    (
        "MVP",
        "Planning",
        "S",
        "Existe dans Expo",
        "Planning employé : liste + semaine",
        "Vue employé du planning : liste + semaine.",
    ),
    (
        "MVP",
        "Équipe",
        "S",
        "Existe dans Expo",
        "Équipe : liste, actif/inactif, résumé des dispos",
        "Liste des membres, statut actif/inactif, résumé des disponibilités.",
    ),
    (
        "MVP",
        "Pointage",
        "S",
        "Existe dans Expo",
        "Adresse du commerce + géocodage Nominatim",
        "Debounce 600 ms, sans clé API.",
    ),
    (
        "MVP",
        "Pointage",
        "M",
        "Existe dans Expo",
        "Pointage clock in/out web (géoloc navigateur, 150 m, flagged, fenêtre -15 min)",
        "Jamais bloquant : hors zone = flagged. Référence : locationService.ts (Expo).",
    ),
    (
        "MVP",
        "Pointage",
        "S",
        "Existe dans Expo",
        "Pointages récents par employé + badge flagged (manager)",
        "5 derniers sur 14 jours, en dépli dans la carte.",
    ),
    (
        "MVP",
        "Dashboard",
        "M",
        "Existe dans Expo",
        "Dashboard manager (stats) + accueil employé (prochain shift, heures, clock)",
        "Dashboard différencié manager / employé.",
    ),
    (
        "MVP",
        "Billing",
        "M",
        "Nouveau",
        "Stripe : produit/prix OnTime + essai gratuit + blocage si impayé",
        "Sans ça, 0 € encaissé. Définir le prix par commerce.",
    ),
    (
        "MVP",
        "Auth & onboarding",
        "M",
        "Nouveau",
        "Reset mot de passe + confirmation email (prod)",
        "Bloquant dès le premier vrai client.",
    ),
    (
        "MVP",
        "Fondation",
        "S",
        "Nouveau",
        "Déploiement staging + démo client",
        "Mise en place d'un environnement staging et d'une démo client.",
    ),
    (
        "V1",
        "Tickets",
        "M",
        "Existe dans Expo",
        "Tickets congé / problème + approve/reject manager",
        "Dates start/end pour time_off.",
    ),
    (
        "V1",
        "Swaps",
        "L",
        "Existe dans Expo",
        "Swaps 3 étapes (employé A → employé B → manager) + transfert du shift",
        "Transfert du shift atomique (équivalent approve_shift_swap).",
    ),
    (
        "V1",
        "Planning",
        "M",
        "Nouveau",
        "Vue manager desktop : table Today's Shifts + badges status",
        "Mockup overview.",
    ),
    (
        "V1",
        "Disponibilités",
        "M",
        "Partiel",
        "UI grille Début/Fin des dispos (TimeRangeSlider web)",
        "Mockup composant-plage-horaire.png. Référence : TimeRangeSlider.tsx.",
    ),
    (
        "V1",
        "Exports",
        "M",
        "Nouveau",
        "Export feuilles de temps (CSV/PDF) : heures prévues vs pointées",
        "Argument de vente n°1 auprès d'un gérant : préparer la paie.",
    ),
    (
        "V1",
        "Planning",
        "M",
        "Nouveau",
        "Édition d'un shift (heures, poste, notes) + copier la semaine précédente",
        "Absent du CDC, demandé par tout gérant dès la 2e semaine.",
    ),
    (
        "V1",
        "Notifications",
        "M",
        "Nouveau",
        "Notifications in-app (ticket, swap, pointage flaggé)",
        "Table prévue au CDC, aucune logique.",
    ),
    (
        "V1",
        "Planning",
        "S",
        "Nouveau",
        "Conflits : shift sur congé approuvé / double shift",
        "Détection et gestion des conflits de planning.",
    ),
    (
        "V2",
        "Branding",
        "M",
        "Partiel",
        "Branding par commerce : logo + palette 12 couleurs",
        "Colonnes en base, UI jamais faite.",
    ),
    (
        "V2",
        "Auth & onboarding",
        "L",
        "Nouveau",
        "Company switcher multi-établissements",
        "Un utilisateur rattaché à plusieurs commerces.",
    ),
    (
        "V2",
        "Équipe",
        "M",
        "Nouveau",
        "Permissions granulaires (toggles)",
        "permissions jsonb par rôle (CDC).",
    ),
    (
        "V2",
        "Dashboard",
        "L",
        "Nouveau",
        "Dashboard tablette : sidebar + carte live + rayon",
        "Mockup overview.",
    ),
    (
        "V2",
        "Notifications",
        "M",
        "Nouveau",
        "Emails transactionnels (invitation, planning publié, rappel shift)",
        "Emails transactionnels pour invitation, publication de planning et rappel de shift.",
    ),
    (
        "V2",
        "Planning",
        "S",
        "Partiel",
        "Horaires d'ouverture par commerce branchés au planning",
        "company_settings opening/closing présents, non branchés.",
    ),
    (
        "V3+",
        "Notifications",
        "L",
        "Nouveau",
        "Push temps réel (pointage flaggé, tickets)",
        "Hors scope assumé CDC §12.",
    ),
    (
        "V3+",
        "Planning",
        "M",
        "Nouveau",
        "Postes structurés (table positions) + presets par industrie",
        "Resto : serveur/cuisinier ; salon : coiffeur.",
    ),
    (
        "V3+",
        "Mobile",
        "L",
        "Partiel",
        "App Expo rebranchée sur l'API/DB du web (monorepo option B)",
        "Rebrancher l'app Expo sur l'API/DB du web manager.",
    ),
    (
        "V3+",
        "Exports",
        "L",
        "Nouveau",
        "Export paie / intégrations (Payfit, Silae…)",
        "Intégrations paie tierces.",
    ),
    (
        "V3+",
        "Planning",
        "L",
        "Nouveau",
        "Auto-planning (proposition de semaine depuis les dispos)",
        "Proposition automatique de semaine à partir des disponibilités.",
    ),
]


def run(cmd: list[str], *, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, check=check, text=True, capture_output=True)


def ensure_labels() -> None:
    existing = {
        x["name"]
        for x in json.loads(
            run(["gh", "label", "list", "--repo", REPO, "--limit", "200", "--json", "name"]).stdout
        )
    }
    for name, color, desc in LABELS:
        if name in existing:
            run(
                [
                    "gh",
                    "label",
                    "edit",
                    name,
                    "--repo",
                    REPO,
                    "--color",
                    color,
                    "--description",
                    desc,
                ],
                check=False,
            )
        else:
            run(
                [
                    "gh",
                    "label",
                    "create",
                    name,
                    "--repo",
                    REPO,
                    "--color",
                    color,
                    "--description",
                    desc,
                ]
            )
            print(f"  label créé: {name}")


def existing_titles() -> dict[str, int]:
    data = json.loads(
        run(
            [
                "gh",
                "issue",
                "list",
                "--repo",
                REPO,
                "--state",
                "all",
                "--limit",
                "200",
                "--json",
                "number,title",
            ]
        ).stdout
    )
    return {i["title"]: i["number"] for i in data}


def body_for(version: str, epic: str, effort: str, etat: str, notes: str) -> str:
    effort_label = {"S": "S (< 1 j)", "M": "M (2–4 j)", "L": "L (1 sem+)"}[effort]
    return (
        f"{notes}\n\n"
        f"**Épic :** {epic}\n"
        f"**Effort :** {effort_label}\n"
        f"**État :** {etat}\n"
        f"**Version :** {version}\n"
    )


def main() -> int:
    print(f"==> Repo: {REPO}")
    print(f"==> Issues à créer: {len(ISSUES)}")
    print("==> Labels")
    ensure_labels()

    known = existing_titles()
    created = skipped = 0

    print("==> Issues")
    for version, epic, effort, etat, title, notes in ISSUES:
        if title in known:
            print(f"  skip #{known[title]} — {title}")
            skipped += 1
            continue

        labels = [version, f"effort:{effort}", f"état:{etat}", f"épic:{epic}"]
        cmd = [
            "gh",
            "issue",
            "create",
            "--repo",
            REPO,
            "--title",
            title,
            "--body",
            body_for(version, epic, effort, etat, notes),
        ]
        for lab in labels:
            cmd.extend(["--label", lab])

        result = run(cmd)
        url = result.stdout.strip()
        print(f"  créé {url} — {title}")
        created += 1

    print(f"\n==> Terminé: {created} créées, {skipped} déjà présentes, total kanban {len(ISSUES)}")
    print(f"    https://github.com/{REPO}/issues")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except subprocess.CalledProcessError as e:
        print(e.stderr or e.stdout or str(e), file=sys.stderr)
        raise SystemExit(1)
