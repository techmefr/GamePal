# Backlog – Dice

## Contexte

Ce domaine gère tous les systèmes de dés virtuels de Gamepal.
Il doit permettre de remplacer n'importe quel type de dé physique.

Fonctionnement :
- offline uniquement
- utilisable en mobile et tablette
- interaction tactile prioritaire
- aucune dépendance réseau

---

## Modèles de données

### DiceFace

```ts
type DiceFace = {
  value: string
  bgColor: string
  textColor: string
  icon?: string
}
```

### Dice

```ts
type Dice = {
  id: string
  name: string
  faces: DiceFace[]
  game?: string
  createdAt: number
}
```

---

## Stores attendus

### Store dice – `stores/dice.ts`

Responsabilités :

* stocker tous les dés disponibles
* gérer la table active
* persistance locale

API minimale :

* getAllDice()
* addDice(dice)
* deleteDice(id)
* addToTable(id)
* removeFromTable(id)
* rollAll()

---

## Stories

### Story 1 – Table de dés

Objectif :
Afficher les dés actifs et permettre de les lancer.

Tâches :

* [ ] Composant `DiceCard.vue`
* [ ] Bouton "Lancer"
* [ ] Animation simple (valeurs qui changent)
* [ ] Blocage d'un dé
* [ ] Swipe vers le haut pour lancer
* [ ] Shake téléphone pour lancer

Critères :

* tous les dés changent de valeur
* les dés bloqués ne changent pas
* utilisable à une main

Edge cases :

* aucun dé sur la table → message
* trop de dés → scroll horizontal

---

### Story 2 – Catalogue de dés

Objectif :
Ajouter rapidement plusieurs dés standards.

Tâches :

* [ ] Page catalogue
* [ ] Liste des dés (d4, d6, d8, d10, d12, d20…)
* [ ] Panier
* [ ] Ajout multiple à la table

---

### Story 3 – Créateur de dés

Objectif :
Créer des dés personnalisés.

Tâches :

* [ ] Éditeur visuel d'une face
* [ ] Paramétrage couleurs / icône
* [ ] Nom du dé
* [ ] Tag du jeu
* [ ] Sauvegarde locale
* [ ] Export JSON
* [ ] Génération QR code

Critères :

* un dé créé apparaît dans le catalogue
* peut être partagé sans compte

---

## Notes produit

* priorité à la lisibilité plutôt qu'au réalisme 3D
* animations simples au départ
* 3D + son plus tard
