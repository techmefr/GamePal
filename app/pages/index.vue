<script setup lang="ts">
import { Settings } from 'lucide-vue-next'

const { t } = useI18n()

interface IGameMode {
   id: string
   titleKey: string
   descriptionKey: string
   route: string
   enabled: boolean
   icon: string
}

const modes: IGameMode[] = [
   {
      id: 'random-picker',
      titleKey: 'home.modes.randomPicker.title',
      descriptionKey: 'home.modes.randomPicker.description',
      route: '/random-picker',
      enabled: true,
      icon: '🎲',
   },
   {
      id: 'dice',
      titleKey: 'home.modes.dice.title',
      descriptionKey: 'home.modes.dice.description',
      route: '/dice',
      enabled: true,
      icon: '🎯',
   },
   {
      id: 'scores',
      titleKey: 'home.modes.scores.title',
      descriptionKey: 'home.modes.scores.description',
      route: '/scores',
      enabled: true,
      icon: '📊',
   },
   {
      id: 'music',
      titleKey: 'home.modes.music.title',
      descriptionKey: 'home.modes.music.description',
      route: '/music',
      enabled: false,
      icon: '🎵',
   },
   {
      id: 'rules',
      titleKey: 'home.modes.rules.title',
      descriptionKey: 'home.modes.rules.description',
      route: '/rules',
      enabled: false,
      icon: '📖',
   },
   {
      id: 'narrator',
      titleKey: 'home.modes.narrator.title',
      descriptionKey: 'home.modes.narrator.description',
      route: '/narrator',
      enabled: false,
      icon: '🎭',
   },
]
</script>

<template>
   <div class="min-h-dvh bg-background pb-8">
      <header class="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
         <div class="flex items-center justify-between px-4 py-4">
            <div
               v-motion
               :initial="{ opacity: 0, x: -20 }"
               :enter="{ opacity: 1, x: 0, transition: { delay: 100 } }"
            >
               <h1 class="font-display text-2xl font-bold tracking-tight">
                  {{ t('app.name') }}
               </h1>
               <p class="text-sm text-muted-foreground">{{ t('app.tagline') }}</p>
            </div>
            <NuxtLink
               to="/settings"
               class="home__settings flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
               v-motion
               :initial="{ opacity: 0, scale: 0.8 }"
               :enter="{ opacity: 1, scale: 1, transition: { delay: 200 } }"
            >
               <Settings class="h-5 w-5" />
            </NuxtLink>
         </div>
      </header>

      <main class="px-4 pt-6">
         <div class="grid grid-cols-2 gap-4">
            <component
               :is="mode.enabled ? 'NuxtLink' : 'div'"
               v-for="(mode, index) in modes"
               :key="mode.id"
               :to="mode.enabled ? mode.route : undefined"
               class="mode-card"
               :class="{ 'mode-card--disabled': !mode.enabled }"
               v-motion
               :initial="{ opacity: 0, y: 20 }"
               :enter="{ opacity: 1, y: 0, transition: { delay: 150 + index * 50 } }"
            >
               <UiCard
                  :hoverable="mode.enabled"
                  class="relative h-full p-4"
                  :class="{ 'opacity-50': !mode.enabled }"
               >
                  <UiBadge
                     v-if="!mode.enabled"
                     variant="secondary"
                     class="mode-card__badge absolute -top-2 -right-2"
                  >
                     {{ t('common.comingSoon') }}
                  </UiBadge>
                  <div class="text-3xl mb-3">{{ mode.icon }}</div>
                  <h2 class="font-display font-semibold text-foreground mb-1">
                     {{ t(mode.titleKey) }}
                  </h2>
                  <p class="text-xs text-muted-foreground leading-relaxed">
                     {{ t(mode.descriptionKey) }}
                  </p>
               </UiCard>
            </component>
         </div>
      </main>
   </div>
</template>
