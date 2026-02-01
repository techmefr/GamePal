<script setup lang="ts">
import { ArrowLeft, Trophy, Minus, Plus, ChevronRight, Download } from 'lucide-vue-next'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { getSession, updatePlayerScore, addRound, sessions } = useScoreSessions()

const sessionId = computed(() => route.params.id as string)
const session = computed(() => getSession(sessionId.value))

const sortedPlayers = computed(() => {
   if (!session.value) return []
   return [...session.value.players].sort((a, b) => b.total - a.total)
})

const isGameOver = computed(() => {
   if (!session.value) return false

   if (session.value.maxRounds && session.value.currentRound > session.value.maxRounds) {
      return true
   }

   if (session.value.maxScore) {
      return session.value.players.some(p => p.total >= session.value!.maxScore!)
   }

   return false
})

function handleScoreChange(playerId: string, round: number, event: Event): void {
   const input = event.target as HTMLInputElement
   const value = parseInt(input.value) || 0
   updatePlayerScore(sessionId.value, playerId, round, value)
}

function handleAddRound(): void {
   addRound(sessionId.value)
}

function getPlayerScore(playerId: string, round: number): number {
   const player = session.value?.players.find(p => p.id === playerId)
   return player?.scores[round - 1] ?? 0
}

function getRankClass(index: number): string {
   if (index === 0) return 'ring-2 ring-yellow-500/50 bg-gradient-to-br from-card to-yellow-500/10'
   if (index === 1) return 'ring-1 ring-gray-400/30 bg-gradient-to-br from-card to-gray-400/5'
   if (index === 2) return 'ring-1 ring-orange-600/30 bg-gradient-to-br from-card to-orange-600/5'
   return ''
}

function exportSession(): void {
   if (!session.value) return

   const exportData = {
      name: session.value.name,
      date: session.value.createdAt,
      players: session.value.players.map(p => ({
         name: p.name,
         scores: p.scores,
         total: p.total,
      })),
      rounds: session.value.currentRound,
      winner: sortedPlayers.value[0]?.name ?? null,
   }

   const json = JSON.stringify(exportData, null, 2)
   const blob = new Blob([json], { type: 'application/json' })
   const url = URL.createObjectURL(blob)
   const a = document.createElement('a')
   a.href = url
   a.download = `${session.value.name.toLowerCase().replace(/\s+/g, '-')}-scores.json`
   a.click()
   URL.revokeObjectURL(url)
}

watch(sessions, () => {}, { deep: true })

onMounted(() => {
   if (!session.value) {
      router.push('/scores')
   }
})
</script>

<template>
   <div class="min-h-dvh bg-background">
      <header class="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border">
         <div class="flex items-center gap-4 px-4 py-4">
            <NuxtLink
               to="/scores"
               class="session-page__back flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
               v-motion
               :initial="{ opacity: 0, x: -10 }"
               :enter="{ opacity: 1, x: 0 }"
            >
               <ArrowLeft class="h-5 w-5" />
            </NuxtLink>
            <h1
               class="heading flex-1 font-display text-lg font-bold tracking-tight truncate"
               v-motion
               :initial="{ opacity: 0, y: -10 }"
               :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
            >
               {{ session?.name ?? '' }}
            </h1>
            <button
               v-if="session"
               class="export-btn flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
               @click="exportSession"
            >
               <Download class="h-5 w-5" />
            </button>
         </div>
      </header>

      <div v-if="session" class="p-4 space-y-6">
         <UiCard
            v-if="isGameOver"
            class="game-over-banner p-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-center"
            v-motion
            :initial="{ opacity: 0, scale: 0.9 }"
            :enter="{ opacity: 1, scale: 1, transition: { delay: 150 } }"
         >
            <Trophy class="h-10 w-10 mx-auto mb-3" />
            <h2 class="font-display text-xl font-bold mb-1">{{ t('scores.session.gameOver') }}</h2>
            <p class="text-primary-foreground/80 mb-4">
               {{ t('scores.session.winner', { name: sortedPlayers[0]?.name }) }}
            </p>
            <UiButton
               variant="secondary"
               class="export-results-btn"
               @click="exportSession"
            >
               <Download class="h-4 w-4 mr-2" />
               {{ t('scores.session.export') }}
            </UiButton>
         </UiCard>

         <section
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
         >
            <h2 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
               {{ t('scores.session.leaderboard') }}
            </h2>
            <ul class="space-y-2">
               <li
                  v-for="(player, index) in sortedPlayers"
                  :key="player.id"
                  v-motion
                  :initial="{ opacity: 0, x: -20 }"
                  :enter="{ opacity: 1, x: 0, transition: { delay: 250 + index * 50 } }"
               >
                  <UiCard
                     class="leaderboard-item flex items-center gap-3 p-3"
                     :class="getRankClass(index)"
                  >
                     <span class="rank font-display text-lg font-bold text-muted-foreground w-8 text-center">
                        {{ index + 1 }}
                     </span>
                     <span class="name flex-1 font-medium text-foreground">{{ player.name }}</span>
                     <span class="score font-display text-xl font-bold text-accent">{{ player.total }}</span>
                  </UiCard>
               </li>
            </ul>
         </section>

         <section
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 350 } }"
         >
            <h2 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
               {{ t('scores.round') }} {{ session.currentRound }}
            </h2>
            <div class="space-y-2">
               <UiCard
                  v-for="player in session.players"
                  :key="player.id"
                  class="score-row flex items-center gap-3 p-3"
               >
                  <span class="player-name flex-1 font-medium text-foreground">{{ player.name }}</span>
                  <div class="score-controls flex items-center gap-1">
                     <button
                        class="score-btn w-9 h-9 rounded-lg bg-muted text-foreground flex items-center justify-center hover:bg-muted/80 active:bg-primary active:text-primary-foreground transition-colors"
                        @click="updatePlayerScore(sessionId, player.id, session.currentRound, getPlayerScore(player.id, session.currentRound) - 1)"
                     >
                        <Minus class="h-4 w-4" />
                     </button>
                     <input
                        type="number"
                        class="score-input w-14 h-9 text-center rounded-lg border border-border bg-background text-foreground font-display font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                        :value="getPlayerScore(player.id, session.currentRound)"
                        @change="handleScoreChange(player.id, session.currentRound, $event)"
                     />
                     <button
                        class="score-btn w-9 h-9 rounded-lg bg-muted text-foreground flex items-center justify-center hover:bg-muted/80 active:bg-primary active:text-primary-foreground transition-colors"
                        @click="updatePlayerScore(sessionId, player.id, session.currentRound, getPlayerScore(player.id, session.currentRound) + 1)"
                     >
                        <Plus class="h-4 w-4" />
                     </button>
                  </div>
                  <span class="player-total font-display text-base font-semibold text-primary min-w-12 text-right">
                     {{ player.total }}
                  </span>
               </UiCard>
            </div>
         </section>

         <UiButton
            v-if="!isGameOver"
            class="next-round-btn w-full"
            size="lg"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }"
            @click="handleAddRound"
         >
            {{ t('scores.session.nextRound') }}
            <ChevronRight class="h-5 w-5 ml-1" />
         </UiButton>
      </div>

      <div v-else class="flex items-center justify-center min-h-[50vh]">
         <p class="text-muted-foreground">{{ t('common.loading') }}</p>
      </div>
   </div>
</template>
