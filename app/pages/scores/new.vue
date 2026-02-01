<script setup lang="ts">
import { ArrowLeft, Plus, X, Users, UsersRound } from 'lucide-vue-next'
import type { IPlayer } from '~/types'

const { t } = useI18n()
const router = useRouter()
const { data: savedPlayers } = useLocalStorage<IPlayer[]>('gamepal-players', [])
const { createSession } = useScoreSessions()

const sessionName = ref('')
const playerNames = ref<string[]>(['', ''])
const maxRounds = ref<number | null>(null)
const maxScore = ref<number | null>(null)
const isTeamMode = ref(false)
const showSavedPlayers = ref(false)

const canCreate = computed(() => {
   const hasName = sessionName.value.trim() !== ''
   const validPlayers = playerNames.value.filter(n => n.trim() !== '')
   return hasName && validPlayers.length >= 2
})

function addPlayerField(): void {
   playerNames.value.push('')
}

function removePlayerField(index: number): void {
   if (playerNames.value.length > 2) {
      playerNames.value.splice(index, 1)
   }
}

function useSavedPlayers(): void {
   if (savedPlayers.value.length > 0) {
      playerNames.value = savedPlayers.value.map(p => p.name)
      showSavedPlayers.value = false
   }
}

function handleCreate(): void {
   const validNames = playerNames.value
      .map(n => n.trim())
      .filter(n => n !== '')

   if (validNames.length < 2) return

   const session = createSession(sessionName.value.trim(), validNames, {
      maxRounds: maxRounds.value,
      maxScore: maxScore.value,
      isTeamMode: isTeamMode.value,
   })

   router.push(`/scores/${session.id}`)
}

onMounted(() => {
   if (savedPlayers.value.length > 0) {
      showSavedPlayers.value = true
   }
})
</script>

<template>
   <div class="min-h-dvh bg-background">
      <header class="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border">
         <div class="flex items-center gap-4 px-4 py-4">
            <NuxtLink
               to="/scores"
               class="new-session__back flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
               v-motion
               :initial="{ opacity: 0, x: -10 }"
               :enter="{ opacity: 1, x: 0 }"
            >
               <ArrowLeft class="h-5 w-5" />
            </NuxtLink>
            <h1
               class="heading font-display text-lg font-bold tracking-tight"
               v-motion
               :initial="{ opacity: 0, y: -10 }"
               :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
            >
               {{ t('scores.newSession.title') }}
            </h1>
         </div>
      </header>

      <div class="p-4 space-y-6">
         <UiCard
            v-if="showSavedPlayers"
            class="saved-players-banner p-4"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 150 } }"
         >
            <p class="text-center text-foreground mb-3">{{ t('scores.newSession.useSavedPlayers') }}</p>
            <div class="flex gap-2 justify-center">
               <UiButton size="sm" @click="useSavedPlayers">{{ t('scores.newSession.yes') }}</UiButton>
               <UiButton variant="ghost" size="sm" @click="showSavedPlayers = false">
                  {{ t('scores.newSession.no') }}
               </UiButton>
            </div>
         </UiCard>

         <section
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
         >
            <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
               {{ t('scores.newSession.sessionName') }}
            </label>
            <UiInput
               v-model="sessionName"
               :placeholder="t('scores.newSession.sessionNamePlaceholder')"
            />
         </section>

         <section
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 250 } }"
         >
            <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
               {{ t('scores.newSession.players') }}
            </label>
            <div class="space-y-2">
               <div v-for="(_, index) in playerNames" :key="index" class="flex gap-2">
                  <UiInput
                     v-model="playerNames[index]"
                     class="flex-1"
                     :placeholder="t('scores.newSession.playerPlaceholder', { n: index + 1 })"
                  />
                  <button
                     v-if="playerNames.length > 2"
                     class="player-remove p-2 text-muted-foreground hover:text-destructive transition-colors"
                     @click="removePlayerField(index)"
                  >
                     <X class="h-5 w-5" />
                  </button>
               </div>
            </div>
            <button
               class="add-player-btn mt-3 text-primary text-sm font-medium flex items-center gap-1 hover:text-primary/80 transition-colors"
               @click="addPlayerField"
            >
               <Plus class="h-4 w-4" />
               {{ t('scores.newSession.addPlayer') }}
            </button>
         </section>

         <section
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
         >
            <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
               {{ t('scores.newSession.gameMode') }}
            </label>
            <UiTabs
               :tabs="[
                  { value: 'individual', label: t('scores.newSession.individual'), icon: Users },
                  { value: 'teams', label: t('scores.newSession.teams'), icon: UsersRound },
               ]"
               :model-value="isTeamMode ? 'teams' : 'individual'"
               @update:model-value="isTeamMode = $event === 'teams'"
            />
         </section>

         <section
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 350 } }"
         >
            <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
               {{ t('scores.newSession.endCondition') }}
            </label>
            <div class="grid grid-cols-2 gap-3">
               <UiCard class="end-condition p-3">
                  <span class="text-sm text-muted-foreground block mb-2">
                     {{ t('scores.newSession.maxRounds') }}
                  </span>
                  <UiInput
                     v-model.number="maxRounds"
                     type="number"
                     class="text-center"
                     min="1"
                     placeholder="--"
                  />
               </UiCard>
               <UiCard class="end-condition p-3">
                  <span class="text-sm text-muted-foreground block mb-2">
                     {{ t('scores.newSession.targetScore') }}
                  </span>
                  <UiInput
                     v-model.number="maxScore"
                     type="number"
                     class="text-center"
                     min="1"
                     placeholder="--"
                  />
               </UiCard>
            </div>
         </section>

         <UiButton
            class="create-btn w-full mt-6"
            size="lg"
            :disabled="!canCreate"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }"
            @click="handleCreate"
         >
            {{ t('scores.newSession.create') }}
         </UiButton>
      </div>
   </div>
</template>
