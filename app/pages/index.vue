<script setup lang="ts">
const { t } = useI18n()

interface IMode {
   id: string
   titleKey: string
   descriptionKey: string
   icon: string
   route: string
   isAvailable: boolean
}

const modes: IMode[] = [
   {
      id: 'random-picker',
      titleKey: 'home.modes.randomPicker.title',
      descriptionKey: 'home.modes.randomPicker.description',
      icon: 'hand',
      route: '/random-picker',
      isAvailable: true,
   },
   {
      id: 'dice',
      titleKey: 'home.modes.dice.title',
      descriptionKey: 'home.modes.dice.description',
      icon: 'dice',
      route: '/dice',
      isAvailable: true,
   },
   {
      id: 'scores',
      titleKey: 'home.modes.scores.title',
      descriptionKey: 'home.modes.scores.description',
      icon: 'trophy',
      route: '/scores',
      isAvailable: true,
   },
   {
      id: 'music',
      titleKey: 'home.modes.music.title',
      descriptionKey: 'home.modes.music.description',
      icon: 'music',
      route: '/music',
      isAvailable: false,
   },
   {
      id: 'rules',
      titleKey: 'home.modes.rules.title',
      descriptionKey: 'home.modes.rules.description',
      icon: 'book',
      route: '/rules',
      isAvailable: false,
   },
   {
      id: 'narrator',
      titleKey: 'home.modes.narrator.title',
      descriptionKey: 'home.modes.narrator.description',
      icon: 'mic',
      route: '/narrator',
      isAvailable: false,
   },
]
</script>

<template>
   <div class="home">
      <header class="home__header">
         <NuxtLink to="/settings" class="home__settings">
            <span>⚙</span>
         </NuxtLink>
         <h1 class="heading">{{ t('app.name') }}</h1>
         <p class="home__subtitle">{{ t('app.tagline') }}</p>
      </header>

      <nav class="home__grid">
         <NuxtLink
            v-for="mode in modes"
            :key="mode.id"
            :to="mode.isAvailable ? mode.route : undefined"
            class="card-game mode-card"
            :class="{ 'mode-card--disabled': !mode.isAvailable }"
         >
            <div class="mode-card__icon">
               <span>{{ mode.icon }}</span>
            </div>
            <h2 class="mode-card__title">{{ t(mode.titleKey) }}</h2>
            <p class="mode-card__description">{{ t(mode.descriptionKey) }}</p>
            <span v-if="!mode.isAvailable" class="mode-card__badge">{{ t('common.comingSoon') }}</span>
         </NuxtLink>
      </nav>
   </div>
</template>

<style scoped>
.home {
   min-height: 100dvh;
   padding: var(--gap-md);
   display: flex;
   flex-direction: column;
   gap: var(--gap-lg);
}

.home__header {
   text-align: center;
   padding: var(--gap-lg) 0;
   position: relative;
}

.home__settings {
   position: absolute;
   top: var(--gap-md);
   right: 0;
   font-size: var(--text-lg);
   color: var(--text-secondary);
   padding: var(--gap-xs);
}

.home__header .heading {
   font-size: var(--text-xl);
   color: var(--text-primary);
   margin-bottom: var(--gap-xs);
}

.home__subtitle {
   font-size: var(--text-base);
   color: var(--text-secondary);
}

.home__grid {
   display: grid;
   grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
   gap: var(--gap-md);
   max-width: 500px;
   margin: 0 auto;
   width: 100%;
}

.mode-card {
   display: flex;
   flex-direction: column;
   align-items: center;
   text-align: center;
   gap: var(--gap-xs);
   position: relative;
   cursor: pointer;
}

.mode-card--disabled {
   opacity: 0.5;
   cursor: not-allowed;
}

.mode-card--disabled:active {
   transform: none;
}

.mode-card__icon {
   width: 48px;
   height: 48px;
   background-color: var(--accent-primary);
   border-radius: var(--radius-sm);
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: var(--text-lg);
   color: var(--text-primary);
}

.mode-card__title {
   font-family: var(--font-display);
   font-size: var(--text-base);
   font-weight: 600;
   color: var(--text-primary);
}

.mode-card__description {
   font-size: var(--text-sm);
   color: var(--text-secondary);
}

.mode-card__badge {
   position: absolute;
   top: var(--gap-xs);
   right: var(--gap-xs);
   background-color: var(--accent-secondary);
   color: #ffffff;
   font-size: var(--text-xs);
   padding: 0.2rem 0.5rem;
   border-radius: var(--radius-lg);
}
</style>
