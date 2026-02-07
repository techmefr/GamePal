# Progression GamePal

Derniere mise a jour : 7 fevrier 2026

---

## Modules termines (100%)

### Time
- Timer simple (start, stop, reset)
- Chrono face-a-face (2 joueurs, ecran divise)
- Mode 4 joueurs (ecran en 4 zones)
- Sablier avec animation SVG et flip
- Marketplace presets (builtin + custom + import/export JSON)

### Library
- Liste et filtres des jeux (style, ambiance, nombre joueurs)
- Gestion pret/revente avec historique
- Statistiques (total, pretes, a vendre)

### Settings
- Theme dark/light
- Taille de texte (S/M/L)
- Mode dyslexie
- Fonctionnement offline via localStorage

### Score
- Notation par manche (saisie, total, affichage)
- Cloture de partie (bouton cloturer, blocage scores)
- Export JSON des resultats

### Dice
- Table de des avec lancer, blocage, swipe et shake
- Catalogue avec panier pour ajout multiple
- Createur de des personnalises (faces, couleurs, tag jeu)
- Presets de des
- Export JSON et QR code

### Players
- CRUD joueurs et equipes
- Page dediee avec onglets Joueurs/Equipes/Sessions
- Sessions de jeu (creation, chargement, historique)
- Assignation joueurs aux equipes
- Session active reutilisable

### Home
- Selection de jeu depuis la bibliotheque
- Recherche par nom, style, ambiance
- Configuration manuelle (nom, preset des, preset timer)
- Activation/desactivation de configuration
- Jeux recents accessibles

---

## Modules non commences (0%)

### Audio
- Playlists (musiques libres, YouTube embed, partage)
- Soundboard (sons rapides, volume individuel, multi-touch)

### Rules
- Gestion des regles (ajout/modif/suppression, mode 2 minutes)
- TTS (lecture audio, vitesse/voix)
- IA d'aide (reformulation, questions/reponses)

### Narrator
- Pre-scripter (creation et edition de scripts, notes)
- IA narrateur (prompts, TTS, marketplace)

---

## Prochaines etapes suggerees

1. **Audio** - Playlists et soundboard
2. **Rules** - Gestion des regles de jeu

---

## Notes techniques

- Stack : Nuxt 4 + Vue 3 + TypeScript strict
- UI : shadcn-vue + Tailwind CSS
- Tests : Vitest avec data-test-id selectors
- 103 tests passent
- Conventions dans `~/.claude/CLAUDE.md`
