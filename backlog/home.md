# Backlog – Home

## Contexte

Page d'accueil et lancement intelligent des jeux.
Doit centraliser toutes les fonctionnalités préconfigurées par jeu.

Fonctionnement :
- offline-first
- détecte jeu sélectionné
- charge dés, temps, scores, audio
- possibilité de config manuelle

---

## Stories

### Story 1 – Choix du jeu

Tâches :

* [ ] UI liste des jeux disponibles
* [ ] Recherche par nom, style, nombre de joueurs
* [ ] Sélection jeu → charge automatique des paramètres

### Story 2 – Chargement automatique

Tâches :

* [ ] Récupérer dés associés
* [ ] Récupérer timers et sablier
* [ ] Récupérer scores
* [ ] Récupérer playlist audio

Critères :

* tout est chargé correctement pour le jeu
* aucun paramètre manquant
* interface lisible sur mobile

### Story 3 – Mode configuration manuelle

Tâches :

* [ ] Bouton config manuelle
* [ ] Choisir dés, temps, score, audio
* [ ] Sauvegarde pour usage futur

---

## Notes produit

* prioriser simplicité et rapidité
* feedback visuel clair lors du chargement
* support offline complet
