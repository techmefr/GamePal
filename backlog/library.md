# Backlog – Library

## Contexte

La ludothèque centralise tous les jeux de l'utilisateur.
Elle permet tri, recherche, gestion prêt/revente et consultation rapide.

Fonctionnement :
- offline-first
- mobile et tablette
- filtrage par style, ambiance, nombre de joueurs
- intégration avec dés, audio, temps préconfigurés

---

## Modèles

### Game

```ts
type Game = {
  id: string
  name: string
  minPlayers: number
  maxPlayers: number
  style?: string
  mood?: string
  owned: boolean
  borrowed?: boolean
  borrowedTo?: string
}
```

---

## Stores

### Store library – `stores/library.ts`

Responsabilités :

* gérer la liste des jeux
* filtres et recherche
* suivi prêt / revente
* persistance locale

API :

* getGames()
* addGame(game)
* updateGame(game)
* removeGame(id)
* filterGames(criteria)
* markAsBorrowed(id, borrower?)

---

## Stories

### Story 1 – Liste et filtres

Tâches :

* [x] Page liste jeux
* [x] Filtrage par style, ambiance, nombre de joueurs
* [x] Recherche texte
* [x] Indicateurs possédé / prêté

### Story 2 – Gestion prêt / revente

Tâches :

* [x] Boutons prêt / revendre
* [x] Historique action
* [x] Export JSON

### Story 3 – Statistiques

Tâches :

* [x] Nombre de jeux
* [x] Nombre de joueurs max/min
* [x] Filtres statistiques

---

## Notes produit

* interface rapide et claire
* offline-first
* intégration facile avec autres domaines (dés, audio, scores)
