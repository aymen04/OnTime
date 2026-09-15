### 01:53 — Règle DEVLOG facturation

- **Prompt :** Ajoute une règle Cursor always-on pour le chiffrage/facturation : à chaque tour utile, journaliser mon prompt + un résumé ultra-bref dans DEVLOG.md à la racine. Créer .cursor/rules/devlog.mdc (alwaysApply) et un DEVLOG.md vide. L’agent ne doit pas chiffrer lui-même (pas de €), ni inventer tokens/durée. Format : ### HH:MM — titre puis - **Prompt :** et - **Fait :**. Ne pas committer le DEVLOG sauf demande.
- **Fait :** Créé `.cursor/rules/devlog.mdc` (alwaysApply) + `DEVLOG.md` avec entrée initiale.
