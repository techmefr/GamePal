# Backlog – Players & Sessions

## Contexte

Ce domaine est le socle de toute l'application Gamepal.
Il gère les joueurs, les sessions et les équipes.
Tous les autres domaines (Dice, Time, Score, Audio, etc.) dépendent de lui.

Fonctionnement :
- offline uniquement
- aucune authentification
- persistance locale
- données réutilisables dans tous les modes

---

## Modèles de données

### Player

```ts
type Player = {
  id: string
  name: string
  color: string
  avatar?: string
}
```

### Team

```ts
type Team = {
  id: string
  name: string
  players: string[]
}
```

### Session

```ts
type Session = {
  id: string
  name: string
  players: string[]
  teams?: string[]
  createdAt: number
}
```

---

## Stores attendus

### Store players – `stores/players.ts`

* CRUD complet
* persistance locale
* génération id uuid

### Store sessions – `stores/sessions.ts`

* création / chargement sessions
* historique
* session active

### Store teams – `stores/teams.ts`

* création équipes
* assignation joueurs

---

## Stories

### Story – Gestion des joueurs

Tâches :

* [ ] Store players
* [ ] PlayerCard.vue
* [ ] PlayerForm.vue
* [ ] Page players

Critères :

* persistance ok
* CRUD complet
* mobile-first

Edge cases :

* doublons autorisés
* warning suppression

---

### Story – Sessions

Tâches :

* [ ] Store sessions
* [ ] Page sessions
* [ ] Sélection joueurs
* [ ] Sauvegarde / chargement

---

### Story – Équipes

Tâches :

* [ ] Store teams
* [ ] UI création
* [ ] Assignation
* [ ] Réutilisation
