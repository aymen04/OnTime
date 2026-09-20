#!/usr/bin/env bash
# Crée le GitHub Project + toutes les issues du kanban OnTime (38 cartes).
#
# Prérequis : gh CLI + jq, compte owner (aymen04) ou droits Project.
#
#   brew install gh jq
#   gh auth login -h github.com -s repo,project,read:project
#   cd /path/to/OnTime && chmod +x scripts/create-kanban-issues.sh
#   ./scripts/create-kanban-issues.sh
#
# Idempotent : skip les issues déjà existantes (même titre).
set -euo pipefail

export PATH="/opt/homebrew/bin:$PATH"

command -v gh >/dev/null || { echo "Installe gh : brew install gh"; exit 1; }
command -v jq >/dev/null || { echo "Installe jq : brew install jq"; exit 1; }

if ! gh auth status -h github.com >/dev/null 2>&1; then
  echo "Pas connecté. Lance : gh auth login -h github.com -s repo,project,read:project"
  exit 1
fi

REPO="${REPO:-aymen04/OnTime}"
OWNER="${OWNER:-aymen04}"
PROJECT_TITLE="${PROJECT_TITLE:-OnTime — Kanban features}"

echo "==> Repo: $REPO | Owner: $OWNER"

# --- Labels ---
ensure_label() {
  local name="$1" color="$2" desc="$3"
  if gh label list --repo "$REPO" --limit 200 --json name --jq '.[].name' | grep -Fxq "$name"; then
    gh label edit "$name" --repo "$REPO" --color "$color" --description "$desc" >/dev/null || true
  else
    gh label create "$name" --repo "$REPO" --color "$color" --description "$desc" >/dev/null
  fi
}

echo "==> Labels"
ensure_label "MVP" "0E8A16" "Version MVP"
ensure_label "V1" "1D76DB" "Version V1 — rétention"
ensure_label "V2" "5319E7" "Version V2 — différenciation"
ensure_label "V3+" "B60205" "Version V3+ — plus tard"
ensure_label "effort:S" "C2E0C6" "Effort S (< 1 j)"
ensure_label "effort:M" "FEF2C0" "Effort M (2–4 j)"
ensure_label "effort:L" "F9D0C4" "Effort L (1 sem+)"
ensure_label "état:Nouveau" "D4C5F9" "Nouveau"
ensure_label "état:Partiel" "FBCA04" "Partiel"
ensure_label "état:Existe dans Expo" "0052CC" "Logique déjà écrite dans Expo"
ensure_label "épic:Fondation" "BFDADC" "Fondation"
ensure_label "épic:Auth & onboarding" "D93F0B" "Auth & onboarding"
ensure_label "épic:Dashboard" "006B75" "Dashboard"
ensure_label "épic:Disponibilités" "F9D0C4" "Disponibilités"
ensure_label "épic:Planning" "C5DEF5" "Planning"
ensure_label "épic:Équipe" "BFD4F2" "Équipe"
ensure_label "épic:Pointage" "E99695" "Pointage"
ensure_label "épic:Billing" "F9D0C4" "Billing"
ensure_label "épic:Tickets" "D4C5F9" "Tickets"
ensure_label "épic:Swaps" "FEF2C0" "Swaps"
ensure_label "épic:Exports" "C2E0C6" "Exports"
ensure_label "épic:Notifications" "7057FF" "Notifications"
ensure_label "épic:Branding" "E4E669" "Branding"
ensure_label "épic:Mobile" "5319E7" "Mobile"

# --- Project ---
echo "==> Project"
EXISTING_NUMBER=$(gh project list --owner "$OWNER" --limit 100 --format json \
  | jq -r --arg t "$PROJECT_TITLE" '.projects[] | select(.title==$t) | .number' | head -1 || true)

if [[ -n "${EXISTING_NUMBER:-}" ]]; then
  PROJECT_NUMBER="$EXISTING_NUMBER"
  echo "    Project existant #$PROJECT_NUMBER"
else
  PROJECT_NUMBER=$(gh project create --owner "$OWNER" --title "$PROJECT_TITLE" --format json | jq -r '.number')
  echo "    Project créé #$PROJECT_NUMBER"
fi

PROJECT_ID=$(gh project list --owner "$OWNER" --limit 100 --format json \
  | jq -r --argjson n "$PROJECT_NUMBER" '.projects[] | select(.number==$n) | .id')
PROJECT_URL=$(gh project list --owner "$OWNER" --limit 100 --format json \
  | jq -r --argjson n "$PROJECT_NUMBER" '.projects[] | select(.number==$n) | .url')

echo "    ID=$PROJECT_ID"
echo "    URL=$PROJECT_URL"

# Custom fields: Version, Effort, État, Épic (si absents)
ensure_single_select() {
  local field_name="$1"
  shift
  local options=("$@")
  local field_id
  field_id=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json \
    | jq -r --arg n "$field_name" '.fields[]? | select(.name==$n) | .id' | head -1 || true)
  if [[ -n "${field_id:-}" && "$field_id" != "null" ]]; then
    echo "    Champ '$field_name' déjà présent"
    return 0
  fi
  # gh project field-create for SINGLE_SELECT
  local opts_json
  opts_json=$(printf '%s\n' "${options[@]}" | jq -R . | jq -s -c .)
  gh project field-create "$PROJECT_NUMBER" --owner "$OWNER" \
    --name "$field_name" \
    --data-type "SINGLE_SELECT" \
    --single-select-options "$(IFS=,; echo "${options[*]}")" >/dev/null \
    && echo "    Champ '$field_name' créé" \
    || echo "    (champ '$field_name' non créé — continuer sans)"
}

ensure_single_select "Version" "MVP" "V1" "V2" "V3+"
ensure_single_select "Effort" "S" "M" "L"
ensure_single_select "État" "Nouveau" "Partiel" "Existe dans Expo"
ensure_single_select "Épic" \
  "Fondation" "Auth & onboarding" "Dashboard" "Disponibilités" "Planning" \
  "Équipe" "Pointage" "Billing" "Tickets" "Swaps" "Exports" "Notifications" \
  "Branding" "Mobile"

# --- Issues ---
# Format TSV: version|epic|effort|etat|title|body
ISSUES_TSV=$(cat <<'EOF'
MVP|Fondation|M|Partiel|Schéma de données aligné CDC §3 (+ fuseau horaire par commerce) + thème Blue/Inter|Source de vérité : CDC §3, pas 001_init.sql. À adapter au bon template.

**Épic :** Fondation
**Effort :** M (2–4 j)
**État :** Partiel
**Version :** MVP
MVP|Fondation|S|Nouveau|Migration initiale + seed commerce démo|Seed : 1 commerce, 1 manager, 4 employés, dispos, 1 semaine de shifts.

**Épic :** Fondation
**Effort :** S (< 1 j)
**État :** Nouveau
**Version :** MVP
MVP|Fondation|S|Nouveau|Trancher le backend unique (Supabase existant vs base du template)|Tant que l'Expo et le web ne pointent pas sur la même base, les données ne se parlent pas.

**Épic :** Fondation
**Effort :** S (< 1 j)
**État :** Nouveau
**Version :** MVP
MVP|Fondation|M|Existe dans Expo|Isolation multi-tenant + garde par rôle sur chaque requête|RLS si Supabase, sinon filtre par commerce côté serveur. Faille entre commerces sinon.

**Épic :** Fondation
**Effort :** M (2–4 j)
**État :** Existe dans Expo
**Version :** MVP
MVP|Auth & onboarding|M|Existe dans Expo|Créer un commerce (slug d'invitation, rôles, settings par défaut)|Équivalent du RPC create_company, atomique.

**Épic :** Auth & onboarding
**Effort :** M (2–4 j)
**État :** Existe dans Expo
**Version :** MVP
MVP|Auth & onboarding|S|Existe dans Expo|Rejoindre un commerce via code (à l'inscription ou après)|Équivalent du RPC join_company. Slug insensible à la casse.

**Épic :** Auth & onboarding
**Effort :** S (< 1 j)
**État :** Existe dans Expo
**Version :** MVP
MVP|Dashboard|S|Existe dans Expo|Navigation conditionnée par rôle (manager / employé)|Accueil, Horaires, Équipe, Profil.

**Épic :** Dashboard
**Effort :** S (< 1 j)
**État :** Existe dans Expo
**Version :** MVP
MVP|Disponibilités|M|Existe dans Expo|Disponibilités récurrentes CRUD (overnight jusqu'à 6h j+1)|Minutes 360→1800. Logique de référence : lib/time.ts (Expo).

**Épic :** Disponibilités
**Effort :** M (2–4 j)
**État :** Existe dans Expo
**Version :** MVP
MVP|Planning|L|Existe dans Expo|Planning manager : pool du jour + créneaux 6-14/14-22/22-6 + bestOverlap|Cœur du produit. Mockup workflow-assignation-planning.png.

**Épic :** Planning
**Effort :** L (1 sem+)
**État :** Existe dans Expo
**Version :** MVP
MVP|Planning|S|Existe dans Expo|Planning : vue d'ensemble semaine (lecture seule) + suppression shift|Vue d'ensemble semaine en lecture seule + suppression de shift.

**Épic :** Planning
**Effort :** S (< 1 j)
**État :** Existe dans Expo
**Version :** MVP
MVP|Planning|S|Existe dans Expo|Planning employé : liste + semaine|Vue employé du planning : liste + semaine.

**Épic :** Planning
**Effort :** S (< 1 j)
**État :** Existe dans Expo
**Version :** MVP
MVP|Équipe|S|Existe dans Expo|Équipe : liste, actif/inactif, résumé des dispos|Liste des membres, statut actif/inactif, résumé des disponibilités.

**Épic :** Équipe
**Effort :** S (< 1 j)
**État :** Existe dans Expo
**Version :** MVP
MVP|Pointage|S|Existe dans Expo|Adresse du commerce + géocodage Nominatim|Debounce 600 ms, sans clé API.

**Épic :** Pointage
**Effort :** S (< 1 j)
**État :** Existe dans Expo
**Version :** MVP
MVP|Pointage|M|Existe dans Expo|Pointage clock in/out web (géoloc navigateur, 150 m, flagged, fenêtre -15 min)|Jamais bloquant : hors zone = flagged. Référence : locationService.ts (Expo).

**Épic :** Pointage
**Effort :** M (2–4 j)
**État :** Existe dans Expo
**Version :** MVP
MVP|Pointage|S|Existe dans Expo|Pointages récents par employé + badge flagged (manager)|5 derniers sur 14 jours, en dépli dans la carte.

**Épic :** Pointage
**Effort :** S (< 1 j)
**État :** Existe dans Expo
**Version :** MVP
MVP|Dashboard|M|Existe dans Expo|Dashboard manager (stats) + accueil employé (prochain shift, heures, clock)|Dashboard différencié manager / employé.

**Épic :** Dashboard
**Effort :** M (2–4 j)
**État :** Existe dans Expo
**Version :** MVP
MVP|Billing|M|Nouveau|Stripe : produit/prix OnTime + essai gratuit + blocage si impayé|Sans ça, 0 € encaissé. Définir le prix par commerce.

**Épic :** Billing
**Effort :** M (2–4 j)
**État :** Nouveau
**Version :** MVP
MVP|Auth & onboarding|M|Nouveau|Reset mot de passe + confirmation email (prod)|Bloquant dès le premier vrai client.

**Épic :** Auth & onboarding
**Effort :** M (2–4 j)
**État :** Nouveau
**Version :** MVP
MVP|Fondation|S|Nouveau|Déploiement staging + démo client|Mise en place d'un environnement staging et d'une démo client.

**Épic :** Fondation
**Effort :** S (< 1 j)
**État :** Nouveau
**Version :** MVP
V1|Tickets|M|Existe dans Expo|Tickets congé / problème + approve/reject manager|Dates start/end pour time_off.

**Épic :** Tickets
**Effort :** M (2–4 j)
**État :** Existe dans Expo
**Version :** V1
V1|Swaps|L|Existe dans Expo|Swaps 3 étapes (employé A → employé B → manager) + transfert du shift|Transfert du shift atomique (équivalent approve_shift_swap).

**Épic :** Swaps
**Effort :** L (1 sem+)
**État :** Existe dans Expo
**Version :** V1
V1|Planning|M|Nouveau|Vue manager desktop : table Today's Shifts + badges status|Mockup overview.

**Épic :** Planning
**Effort :** M (2–4 j)
**État :** Nouveau
**Version :** V1
V1|Disponibilités|M|Partiel|UI grille Début/Fin des dispos (TimeRangeSlider web)|Mockup composant-plage-horaire.png. Référence : TimeRangeSlider.tsx.

**Épic :** Disponibilités
**Effort :** M (2–4 j)
**État :** Partiel
**Version :** V1
V1|Exports|M|Nouveau|Export feuilles de temps (CSV/PDF) : heures prévues vs pointées|Argument de vente n°1 auprès d'un gérant : préparer la paie.

**Épic :** Exports
**Effort :** M (2–4 j)
**État :** Nouveau
**Version :** V1
V1|Planning|M|Nouveau|Édition d'un shift (heures, poste, notes) + copier la semaine précédente|Absent du CDC, demandé par tout gérant dès la 2e semaine.

**Épic :** Planning
**Effort :** M (2–4 j)
**État :** Nouveau
**Version :** V1
V1|Notifications|M|Nouveau|Notifications in-app (ticket, swap, pointage flaggé)|Table prévue au CDC, aucune logique.

**Épic :** Notifications
**Effort :** M (2–4 j)
**État :** Nouveau
**Version :** V1
V1|Planning|S|Nouveau|Conflits : shift sur congé approuvé / double shift|Détection et gestion des conflits de planning.

**Épic :** Planning
**Effort :** S (< 1 j)
**État :** Nouveau
**Version :** V1
V2|Branding|M|Partiel|Branding par commerce : logo + palette 12 couleurs|Colonnes en base, UI jamais faite.

**Épic :** Branding
**Effort :** M (2–4 j)
**État :** Partiel
**Version :** V2
V2|Auth & onboarding|L|Nouveau|Company switcher multi-établissements|Un utilisateur rattaché à plusieurs commerces.

**Épic :** Auth & onboarding
**Effort :** L (1 sem+)
**État :** Nouveau
**Version :** V2
V2|Équipe|M|Nouveau|Permissions granulaires (toggles)|permissions jsonb par rôle (CDC).

**Épic :** Équipe
**Effort :** M (2–4 j)
**État :** Nouveau
**Version :** V2
V2|Dashboard|L|Nouveau|Dashboard tablette : sidebar + carte live + rayon|Mockup overview.

**Épic :** Dashboard
**Effort :** L (1 sem+)
**État :** Nouveau
**Version :** V2
V2|Notifications|M|Nouveau|Emails transactionnels (invitation, planning publié, rappel shift)|Emails transactionnels pour invitation, publication de planning et rappel de shift.

**Épic :** Notifications
**Effort :** M (2–4 j)
**État :** Nouveau
**Version :** V2
V2|Planning|S|Partiel|Horaires d'ouverture par commerce branchés au planning|company_settings opening/closing présents, non branchés.

**Épic :** Planning
**Effort :** S (< 1 j)
**État :** Partiel
**Version :** V2
V3+|Notifications|L|Nouveau|Push temps réel (pointage flaggé, tickets)|Hors scope assumé CDC §12.

**Épic :** Notifications
**Effort :** L (1 sem+)
**État :** Nouveau
**Version :** V3+
V3+|Planning|M|Nouveau|Postes structurés (table positions) + presets par industrie|Resto : serveur/cuisinier ; salon : coiffeur.

**Épic :** Planning
**Effort :** M (2–4 j)
**État :** Nouveau
**Version :** V3+
V3+|Mobile|L|Partiel|App Expo rebranchée sur l'API/DB du web (monorepo option B)|Rebrancher l'app Expo sur l'API/DB du web manager.

**Épic :** Mobile
**Effort :** L (1 sem+)
**État :** Partiel
**Version :** V3+
V3+|Exports|L|Nouveau|Export paie / intégrations (Payfit, Silae…)|Intégrations paie tierces.

**Épic :** Exports
**Effort :** L (1 sem+)
**État :** Nouveau
**Version :** V3+
V3+|Planning|L|Nouveau|Auto-planning (proposition de semaine depuis les dispos)|Proposition automatique de semaine à partir des disponibilités.

**Épic :** Planning
**Effort :** L (1 sem+)
**État :** Nouveau
**Version :** V3+
EOF
)

# Build option maps for project fields
FIELD_JSON=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json)

field_id() {
  jq -r --arg n "$1" '.fields[] | select(.name==$n) | .id' <<<"$FIELD_JSON" | head -1
}

option_id() {
  local fname="$1" oname="$2"
  jq -r --arg n "$fname" --arg o "$oname" '
    .fields[] | select(.name==$n) | .options[]? | select(.name==$o) | .id
  ' <<<"$FIELD_JSON" | head -1
}

VERSION_FIELD=$(field_id "Version")
EFFORT_FIELD=$(field_id "Effort")
ETAT_FIELD=$(field_id "État")
EPIC_FIELD=$(field_id "Épic")

echo "==> Création des issues"
COUNT=0
while IFS='|' read -r version epic effort etat title body; do
  [[ -z "${title:-}" ]] && continue

  # Skip if an open issue with the exact same title already exists
  existing=$(gh issue list --repo "$REPO" --state all --search "in:title \"$title\"" --json title,number \
    | jq -r --arg t "$title" '.[] | select(.title==$t) | .number' | head -1 || true)
  if [[ -n "${existing:-}" ]]; then
    echo "    skip #$existing — $title"
    ISSUE_URL=$(gh issue view "$existing" --repo "$REPO" --json url -q .url)
  else
    labels="$version,effort:$effort,état:$etat,épic:$epic"
    ISSUE_URL=$(gh issue create --repo "$REPO" \
      --title "$title" \
      --body "$body" \
      --label "$labels")
    echo "    créé $ISSUE_URL — $title"
  fi

  # Add to project
  ITEM_ID=$(gh project item-add "$PROJECT_NUMBER" --owner "$OWNER" --url "$ISSUE_URL" --format json | jq -r '.id')

  set_field() {
    local fid="$1" oid="$2"
    [[ -z "$fid" || "$fid" == "null" || -z "$oid" || "$oid" == "null" ]] && return 0
    gh project item-edit --project-id "$PROJECT_ID" --id "$ITEM_ID" \
      --field-id "$fid" --single-select-option-id "$oid" >/dev/null || true
  }

  set_field "$VERSION_FIELD" "$(option_id Version "$version")"
  set_field "$EFFORT_FIELD" "$(option_id Effort "$effort")"
  set_field "$ETAT_FIELD" "$(option_id État "$etat")"
  set_field "$EPIC_FIELD" "$(option_id Épic "$epic")"

  COUNT=$((COUNT + 1))
done <<<"$ISSUES_TSV"

echo ""
echo "==> Terminé : $COUNT issues liées au projet"
echo "    $PROJECT_URL"
