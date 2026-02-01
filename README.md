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

## Roadmap complète

Cette roadmap sert de backlog produit et technique.
Chaque story peut être développée indépendamment.
Les cases peuvent être cochées par un développeur humain ou un agent IA.

### Players & Sessions

#### Story : Gestion des joueurs
Créer, modifier, supprimer les joueurs.

- [ ] PlayerCard (nom, couleur, avatar)
- [ ] PlayerForm (ajout / édition)
- [ ] Store players
- [ ] Validation
- [ ] Suppression
- [ ] Responsive

#### Story : Sessions
Créer et gérer des sessions.

- [ ] Store sessions
- [ ] Création / renommage
- [ ] Ajout / retrait joueurs
- [ ] Sauvegarde / chargement
- [ ] Historique

#### Story : Équipes

- [ ] Création équipes
- [ ] Assignation joueurs
- [ ] Sauvegarde
- [ ] Réutilisation

### Dice

#### Story : Table de dés

- [ ] DiceCard
- [ ] Animation MVP
- [ ] Bouton lancer
- [ ] Blocage
- [ ] Swipe / shake

#### Story : Catalogue

- [ ] Liste dés
- [ ] Panier
- [ ] Ajout à table

#### Story : Créateur

- [ ] Éditeur faces
- [ ] Nom / jeu
- [ ] Export JSON
- [ ] QR code

### Time

#### Story : Timer simple

- [ ] Démarrer / stop / reset
- [ ] Par joueur
- [ ] Offline

#### Story : Chrono face à face

- [ ] Écran divisé
- [ ] Tap switch

#### Story : 4 joueurs

- [ ] Écran en 4
- [ ] Tap individuel

#### Story : Sablier

- [ ] Animation
- [ ] Retour téléphone

#### Story : Marketplace timers

- [ ] Presets par jeu
- [ ] Import / export

### Score

#### Story : Scores

- [ ] Par manche
- [ ] Total

#### Story : Clôture

- [ ] Bouton clôture
- [ ] Export

### Home par jeu

#### Story : Lancement intelligent

- [ ] Choisir jeu
- [ ] Charger dés / temps / score / audio
- [ ] Option config manuelle

### Audio

#### Story : Playlists

- [ ] Musiques libres
- [ ] YouTube embed
- [ ] Partage

#### Story : Soundboard

- [ ] Sons rapides
- [ ] Volume individuel

### Rules

#### Story : Règles

- [ ] Texte mobile
- [ ] Recherche
- [ ] Version 2 minutes
- [ ] Marque‑pages

#### Story : TTS

- [ ] Lecture
- [ ] Vitesse / voix

#### Story : IA règles

- [ ] Reformulation
- [ ] Questions / réponses

### Narrator

#### Story : Pré‑scripter

- [ ] Scénarios
- [ ] Notes

#### Story : IA narrateur

- [ ] Prompts
- [ ] Marketplace

### Library

#### Story : Ludothèque

- [ ] Liste jeux
- [ ] Filtres
- [ ] Prêt / revente
- [ ] Stats

### Settings

#### Story : Personnalisation

- [ ] Thème
- [ ] Police
- [ ] Tailles
- [ ] Offline

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
