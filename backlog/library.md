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

* [ ] Page liste jeux
* [ ] Filtrage par style, ambiance, nombre de joueurs
* [ ] Recherche texte
* [ ] Indicateurs possédé / prêté

### Story 2 – Gestion prêt / revente

Tâches :

* [ ] Boutons prêt / revendre
* [ ] Historique action
* [ ] Export JSON

### Story 3 – Statistiques

Tâches :

* [ ] Nombre de jeux
* [ ] Nombre de joueurs max/min
* [ ] Filtres statistiques

---

## Notes produit

* interface rapide et claire
* offline-first
* intégration facile avec autres domaines (dés, audio, scores)
