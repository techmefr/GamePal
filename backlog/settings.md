# Backlog – Settings

## Contexte

Permet à l'utilisateur de personnaliser l'expérience Gamepal.
Paramètres globaux de thème, police, taille et préférences offline.

---

## Modèles

### Settings

```ts
type Settings = {
  theme: "light" | "dark" | "auto"
  font: string
  fontSize: number
  offlineMode: boolean
  otherPreferences?: Record<string, any>
}
```

---

## Stores

### Store settings – `stores/settings.ts`

Responsabilités :

* stocker et appliquer préférences
* persistance locale

API :

* getSettings()
* updateSettings(settings)

---

## Stories

### Story 1 – Personnalisation thème et police

Tâches :

* [ ] Choisir thème clair / sombre / auto
* [ ] Choisir police
* [ ] Choisir taille texte
* [ ] Sauvegarde offline

### Story 2 – Gestion offline

Tâches :

* [ ] Activer / désactiver mode offline
* [ ] Sauvegarder préférences
* [ ] Assurer fonctionnement complet sans réseau

---

## Notes produit

* priorité lisibilité et accessibilité
* sauvegarde immédiate après modification
* interface simple et intuitive
