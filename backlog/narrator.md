# Backlog – Narrator

## Contexte

Ce domaine gère le rôle de narrateur ou Game Master.
Il inclut pré-scripts, IA de narration et TTS pour animer des jeux comme Loups-garous.

Fonctionnement :
- offline-first
- interface mobile/tablette
- scripts paramétrables par jeu
- utilisation de prompts IA préconfigurés ou marketplace

---

## Modèles

### Script

```ts
type Script = {
  id: string
  title: string
  content: string
  game?: string
  createdAt: number
}
```

### Prompt

```ts
type Prompt = {
  id: string
  name: string
  text: string
  game?: string
  category?: string
}
```

---

## Stores

### Store narrator – `stores/narrator.ts`

Responsabilités :

* stocker scripts et prompts
* persistance locale
* playback TTS

API :

* getScripts(game?)
* addScript(script)
* updateScript(script)
* deleteScript(id)
* getPrompts(game?)
* addPrompt(prompt)

---

## Stories

### Story 1 – Pré-scripter

Tâches :

* [ ] UI liste scripts
* [ ] Créer / modifier / supprimer script
* [ ] Notes associées
* [ ] Sélection script par jeu

Critères :

* scripts sauvegardés offline
* affichage mobile-friendly

### Story 2 – IA narrateur

Tâches :

* [ ] Sélection prompt
* [ ] Execution TTS
* [ ] Marketplace de prompts
* [ ] Feedback utilisateur

Critères :

* lecture TTS claire
* prompts utilisables sans connexion
* partage JSON possible

---

## Notes produit

* prioriser simplicité et rapidité
* support multi-jeux
* feedback visuel pour chaque action
