# Backlog – Rules

## Contexte

Ce domaine centralise les règles de tous les jeux.
Il permet lecture rapide, TTS, reformulation et aide via IA.

Fonctionnement :
- offline-first
- interface mobile-friendly
- possibilité de stocker plusieurs versions
- lecture audio via TTS

---

## Modèles

### Rule

```ts
type Rule = {
  id: string
  game: string
  title: string
  content: string
  createdAt: number
}
```

---

## Stores

### Store rules – `stores/rules.ts`

Responsabilités :

* stocker toutes les règles
* rechercher par jeu ou mot-clé
* persistance locale

API :

* getRulesByGame(game)
* addRule(rule)
* updateRule(rule)
* deleteRule(id)

---

## Stories

### Story 1 – Gestion des règles

Tâches :

* [ ] Page liste règles
* [ ] Ajouter / modifier / supprimer règle
* [ ] Formatage mobile-friendly
* [ ] Mode "2 minutes" pour lecture rapide

### Story 2 – TTS

Tâches :

* [ ] Lecture audio des règles
* [ ] Choix vitesse / voix
* [ ] Pause / stop

### Story 3 – IA d'aide

Tâches :

* [ ] Reformulation du texte
* [ ] Q/R interactif sur les règles
* [ ] Aide contextuelle

Critères :

* lecture lisible sur mobile
* reformulation claire
* réponse aux questions pertinente

---

## Notes produit

* priorité à la lisibilité et accessibilité
* tout doit fonctionner offline
* stockage multi-jeux
