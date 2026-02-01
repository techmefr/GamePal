# Backlog – Dice

## Contexte

Ce domaine gère tous les systèmes de dés virtuels.

---

## Modèles

```ts
type Dice = {
  id: string
  faces: DiceFace[]
  name: string
  game?: string
}

type DiceFace = {
  value: string
  bgColor: string
  textColor: string
  icon?: string
}
```

---

## Stories

### Story – Table de dés

Tâches :

* [ ] DiceCard.vue
* [ ] Bouton lancer
* [ ] Animation simple
* [ ] Blocage dés
* [ ] Swipe / shake

### Story – Catalogue

Tâches :

* [ ] Liste dés
* [ ] Panier
* [ ] Ajout table

### Story – Créateur

Tâches :

* [ ] Éditeur faces
* [ ] Nom / jeu
* [ ] Export JSON
* [ ] QR code
