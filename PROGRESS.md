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

### Dice
- Table de dés avec lancer, blocage, swipe et shake
- Catalogue avec panier pour ajout multiple
- Créateur de dés personnalisés (faces, couleurs, tag jeu)
- Presets de dés
- Export JSON et QR code

### Players
- CRUD joueurs et équipes
- Page dédiée avec onglets Joueurs/Équipes/Sessions
- Sessions de jeu (création, chargement, historique)
- Assignation joueurs aux équipes
- Session active réutilisable

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

1. **Home** - Config auto par jeu (dépend des autres modules)
2. **Audio** - Playlists et soundboard

---

## Notes techniques

- Stack : Nuxt 4 + Vue 3 + TypeScript strict
- UI : shadcn-vue + Tailwind CSS
- Tests : Vitest avec data-test-id selectors
- 103 tests passent
- Conventions dans `~/.claude/CLAUDE.md`
