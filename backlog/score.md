# Backlog – Score

## Contexte

Ce domaine gère la notation et le suivi des scores pour tous les jeux.
Il doit reprendre les joueurs et équipes de la session active.

Fonctionnement :
- offline uniquement
- affichage mobile et tablette
- scores cumulés par manche
- possibilité de clôturer la partie

---

## Modèles

### ScoreEntry

```ts
type ScoreEntry = {
  playerId: string
  value: number
}
```

### ScoreRound

```ts
type ScoreRound = {
  id: string
  roundNumber: number
  entries: ScoreEntry[]
}
```

### ScoreBoard

```ts
type ScoreBoard = {
  sessionId: string
  rounds: ScoreRound[]
  totalByPlayer: Record<string, number>
}
```

---

## Stores

### Store score – `stores/score.ts`

Responsabilités :

* suivre scores par manche
* totaliser
* persistance locale

API :

* addRound(round: ScoreRound)
* getTotal(playerId: string)
* resetScores()
* closeSession()

---

## Stories

### Story 1 – Notation par manche

Tâches :

* [x] UI tableau des manches
* [x] Entrée score par joueur
* [x] Calcul total
* [x] Affichage mobile-friendly

Critères :

* scores sauvegardés après reload
* totals exacts
* mise à jour en temps réel

### Story 2 – Clôture de partie

Tâches :

* [x] Bouton "Clôturer"
* [x] Blocage ajout de scores
* [x] Export JSON optionnel

Edge cases :

* manche vide → ne pas clôturer
* scores négatifs autorisés

---

## Notes produit

* interface simple et lisible
* support multi-écran
* priorité à la rapidité de saisie
