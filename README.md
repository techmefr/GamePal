# Gamepal

Board game companion app – offline-first.

Gamepal est une application compagnon pour jeux de société qui permet de configurer automatiquement tous les outils nécessaires pour jouer : joueurs, dés, temps, scores, musique, règles, narration, etc.

L'objectif est de transformer un téléphone ou une tablette en assistant universel de table de jeu.

---

## Vision

> Une application modulaire et offline qui enrichit l'expérience des jeux de société sans remplacer les jeux physiques.

Gamepal n'est pas une simple collection d'outils, mais un OS compagnon pour jeux de société :
- configuration automatique par jeu
- partage communautaire
- fonctionnement sans compte
- utilisable sans connexion

---

## Fonctionnalités principales

- Gestion des joueurs, sessions et équipes
- Dés virtuels (standards et personnalisés)
- Gestion du temps (timer, sablier, chrono multi‑joueurs)
- Gestion des scores
- Playlists audio & soundboard
- Règles de jeux + TTS + IA d'aide
- Narrateur / Game Master
- Ludothèque personnelle
- Configuration automatique par jeu

---

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production

```bash
npm run build
npm run preview
```

---

## Roadmap

Chaque story correspond à un fichier détaillé dans `/backlog`.

### Players & Sessions (`/backlog/players.md`)

- [ ] Gestion des joueurs (CRUD, UI, persistance)
- [ ] Gestion des sessions (création, chargement, historique)
- [ ] Gestion des équipes (création, assignation, réutilisation)

### Dice (`/backlog/dice.md`)

- [ ] Table de dés (DiceCard, lancer, animation, blocage)
- [ ] Catalogue de dés (liste, panier, ajout multiples)
- [ ] Créateur de dés personnalisés (faces, couleurs, icônes, export JSON/QR)

### Time (`/backlog/time.md`)

- [ ] Timer simple (start, stop, reset)
- [ ] Chrono face à face (écran divisé, tap switch)
- [ ] Mode 4 joueurs (écran en 4, tap individuel)
- [ ] Sablier (animation, rotation téléphone)
- [ ] Marketplace timers (presets par jeu, import/export)

### Score (`/backlog/score.md`)

- [ ] Notation par manche (saisie, total, affichage)
- [ ] Clôture de partie (bouton clôture, export JSON)

### Home (`/backlog/home.md`)

- [ ] Choix du jeu (recherche, filtre, sélection)
- [ ] Chargement automatique (dés, temps, score, audio)
- [ ] Configuration manuelle (modification, sauvegarde)

### Audio (`/backlog/audio.md`)

- [ ] Playlists (musiques libres, YouTube embed, partage)
- [ ] Soundboard (sons rapides, volume individuel, multi-touch)

### Rules (`/backlog/rules.md`)

- [ ] Gestion des règles (ajout/modif/suppression, mode 2 minutes)
- [ ] TTS (lecture audio, vitesse/voix)
- [ ] IA d'aide (reformulation, questions/réponses)

### Narrator (`/backlog/narrator.md`)

- [ ] Pré-scripter (création et édition de scripts, notes)
- [ ] IA narrateur (prompts, TTS, marketplace)

### Library (`/backlog/library.md`)

- [ ] Liste et filtres des jeux (style, ambiance, nombre joueurs)
- [ ] Gestion prêt / revente (historique, export JSON)
- [ ] Statistiques (nombre de jeux, joueurs, filtres)

### Settings (`/backlog/settings.md`)

- [ ] Personnalisation thème / police / taille
- [ ] Gestion offline (activation/désactivation, sauvegarde)

---

## Tech / UI / Animations

### Stack

- Shadcn/UI
- Lucide Icons
- VueBits
- Design tokens

### Stratégie

- MVP fonctionnel sans animations lourdes
- Ajout progressif de VueBits
- Transitions entre pages ensuite
- 3D et effets avancés plus tard

### Principe clé

Le produit doit rester utilisable même sans animations.

> Note : les animations seront implémentées à la toute fin du projet. Pour l'instant nous gardons le prototype minimaliste afin de tester l'approche et d'attendre les retours de la communauté.
