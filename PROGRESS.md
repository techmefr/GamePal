# Progression GamePal

Dernière mise à jour : 4 février 2026

---

## Modules terminés (100%)

### Time
- Timer simple (start, stop, reset)
- Chrono face-à-face (2 joueurs, écran divisé)
- Mode 4 joueurs (écran en 4 zones)
- Sablier avec animation SVG et flip
- Marketplace presets (builtin + custom + import/export JSON)

### Library
- Liste et filtres des jeux (style, ambiance, nombre joueurs)
- Gestion prêt/revente avec historique
- Statistiques (total, prêtés, à vendre)

### Settings
- Thème dark/light
- Taille de texte (S/M/L)
- Mode dyslexie
- Fonctionnement offline via localStorage

### Score
- Notation par manche (saisie, total, affichage)
- Clôture de partie (bouton clôturer, blocage scores)
- Export JSON des résultats

---

## Modules partiels

### Dice (~70%)
**Fait :**
- Table de dés avec lancer
- Blocage des dés
- Presets de dés

**Reste :**
- Catalogue de dés (liste, panier, ajout multiples)
- Créateur de dés personnalisés (faces, couleurs, icônes)
- Export JSON/QR

### Players (~60%)
**Fait :**
- CRUD joueurs et équipes (via randomPicker et usePlayers/useTeams)

**Reste :**
- Gestion des sessions (création, chargement, historique)
- Page dédiée players

---

## Modules non commencés (0%)

### Home
- Choix du jeu (recherche, filtre, sélection)
- Chargement automatique (dés, temps, score, audio)
- Configuration manuelle (modification, sauvegarde)

### Audio
- Playlists (musiques libres, YouTube embed, partage)
- Soundboard (sons rapides, volume individuel, multi-touch)

### Rules
- Gestion des règles (ajout/modif/suppression, mode 2 minutes)
- TTS (lecture audio, vitesse/voix)
- IA d'aide (reformulation, questions/réponses)

### Narrator
- Pré-scripter (création et édition de scripts, notes)
- IA narrateur (prompts, TTS, marketplace)

---

## Prochaines étapes suggérées

1. **Dice** - Catalogue et créateur custom
2. **Players** - Sessions et historique
3. **Home** - Config auto par jeu (dépend des autres modules)

---

## Notes techniques

- Stack : Nuxt 4 + Vue 3 + TypeScript strict
- UI : shadcn-vue + Tailwind CSS
- Tests : Vitest avec data-test-id selectors
- 103 tests passent
- Conventions dans `~/.claude/CLAUDE.md`
