# Backlog – Time

## Contexte

Ce domaine gère tous les outils de temps :
timer, chronomètres, sablier et variantes multi-joueurs.

Utilisation typique :
- jeux de réflexion
- jeux compétitifs
- gestion de tours

---

## Modèles

### Timer

```ts
type Timer = {
  id: string
  label: string
  duration: number
  remaining: number
  running: boolean
}
```

---

## Stores

### Store time – `stores/time.ts`

Responsabilités :

* gérer un ou plusieurs timers
* persistance locale
* reprise après reload

API :

* start(id)
* stop(id)
* reset(id)
* switch(id1, id2)

---

## Stories

### Story 1 – Timer simple

Objectif :
Un timer basique par joueur.

Tâches :

* [x] UI timer
* [x] Start / stop / reset
* [x] Choix durée
* [x] Affichage restant

---

### Story 2 – Chrono face à face

Objectif :
Mode échecs.

Tâches :

* [x] Écran divisé
* [x] Tap → switch joueur
* [x] Indication joueur actif

---

### Story 3 – Mode 4 joueurs

Objectif :
Chrono en simultané.

Tâches :

* [x] Écran en 4 zones
* [x] Tap individuel
* [x] Couleur par joueur

---

### Story 4 – Sablier

Objectif :
Simuler un sablier réel.

Tâches :

* [ ] Animation sable
* [ ] Inversion au retournement téléphone

---

### Story 5 – Marketplace timers

Objectif :
Presets communautaires.

Tâches :

* [ ] Liste presets
* [ ] Import / export JSON
* [ ] Sélection rapide par jeu

---

## Notes produit

* pas de précision milliseconde requise
* UX doit être lisible à distance
* orientation paysage importante
