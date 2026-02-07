# Backlog – Home

## Contexte

Page d'accueil et lancement intelligent des jeux.
Doit centraliser toutes les fonctionnalites preconfigurees par jeu.

Fonctionnement :
- offline-first
- detecte jeu selectionne
- charge des, temps, scores, audio
- possibilite de config manuelle

---

## Stories

### Story 1 – Choix du jeu

Taches :

* [x] UI liste des jeux disponibles
* [x] Recherche par nom, style, nombre de joueurs
* [x] Selection jeu → charge automatique des parametres

### Story 2 – Chargement automatique

Taches :

* [x] Recuperer des associes (dice presets)
* [x] Recuperer timers (timer presets)
* [ ] Recuperer scores (a faire)
* [ ] Recuperer playlist audio (a faire)

Criteres :

* tout est charge correctement pour le jeu
* aucun parametre manquant
* interface lisible sur mobile

### Story 3 – Mode configuration manuelle

Taches :

* [x] Bouton config manuelle
* [x] Choisir des, temps
* [x] Sauvegarde pour usage futur
* [x] Jeux recents affichables

---

## Notes produit

* prioriser simplicite et rapidite
* feedback visuel clair lors du chargement
* support offline complet
