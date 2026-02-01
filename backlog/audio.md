# Backlog – Audio

## Contexte

Ce domaine gère la musique et les sons pour tous les jeux.
Il inclut playlists, soundboard et partage communautaire.

Fonctionnement :
- offline-first
- support mobile et tablette
- playlists par jeu
- sons rapides via soundboard

---

## Modèles

### AudioTrack

```ts
type AudioTrack = {
  id: string
  title: string
  source: "local" | "youtube" | "opensource"
  url?: string
  game?: string
  duration?: number
}
```

### Playlist

```ts
type Playlist = {
  id: string
  name: string
  tracks: string[] // ids de AudioTrack
  game?: string
}
```

---

## Stores

### Store audio – `stores/audio.ts`

Responsabilités :

* gérer les playlists
* gérer les tracks
* persistance locale
* partage JSON / QR code

API :

* getPlaylists()
* addPlaylist(playlist)
* removePlaylist(id)
* addTrack(track)
* removeTrack(id)
* loadPlaylist(id)

---

## Stories

### Story 1 – Playlists

Tâches :

* [ ] Page liste playlists
* [ ] Ajouter / supprimer playlist
* [ ] Ajouter / supprimer tracks
* [ ] Lecture audio

Critères :

* lecture fonctionnelle offline
* tracks visibles et identifiables
* support YouTube embed optionnel

### Story 2 – Soundboard

Tâches :

* [ ] Page soundboard
* [ ] Boutons pour chaque son
* [ ] Volume indépendant
* [ ] Ajouter / supprimer sons

Critères :

* son déclenché instantanément
* feedback visuel (animation bouton)
* support multi-touch

---

## Notes produit

* prioriser rapidité de lecture
* interface claire pour accès rapide pendant jeu
* export/import playlists JSON pour partage
