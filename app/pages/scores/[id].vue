<script setup lang="ts">
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
   if (index === 0) return 'rank--first'
   if (index === 1) return 'rank--second'
   if (index === 2) return 'rank--third'
   return ''
}

watch(sessions, () => {}, { deep: true })

onMounted(() => {
   if (!session.value) {
      router.push('/scores')
   }
})
</script>

<template>
   <div class="session-page">
      <header class="session-page__header">
         <NuxtLink to="/scores" class="session-page__back">
            <span>←</span>
         </NuxtLink>
         <h1 class="heading">{{ session?.name ?? '' }}</h1>
      </header>

      <div v-if="session" class="session-page__content">
         <div v-if="isGameOver" class="game-over-banner card-game">
            <h2 class="heading">{{ t('scores.session.gameOver') }}</h2>
            <p class="game-over-banner__winner">
               {{ t('scores.session.winner', { name: sortedPlayers[0]?.name }) }}
            </p>
         </div>

         <div class="leaderboard">
            <h2 class="section-title">{{ t('scores.session.leaderboard') }}</h2>
            <ul class="leaderboard__list">
               <li
                  v-for="(player, index) in sortedPlayers"
                  :key="player.id"
                  class="leaderboard__item card-game"
                  :class="getRankClass(index)"
               >
                  <span class="leaderboard__rank">{{ index + 1 }}</span>
                  <span class="leaderboard__name">{{ player.name }}</span>
                  <span class="leaderboard__score score">{{ player.total }}</span>
               </li>
            </ul>
         </div>

         <div class="score-table">
            <h2 class="section-title">{{ t('scores.round') }} {{ session.currentRound }}</h2>
            <div class="score-table__grid">
               <div v-for="player in session.players" :key="player.id" class="score-row card-game">
                  <span class="score-row__name">{{ player.name }}</span>
                  <div class="score-row__input-wrapper">
                     <button
                        class="score-row__btn"
                        @click="updatePlayerScore(sessionId, player.id, session.currentRound, getPlayerScore(player.id, session.currentRound) - 1)"
                     >
                        −
                     </button>
                     <input
                        type="number"
                        class="score-row__input"
                        :value="getPlayerScore(player.id, session.currentRound)"
                        @change="handleScoreChange(player.id, session.currentRound, $event)"
                     />
                     <button
                        class="score-row__btn"
                        @click="updatePlayerScore(sessionId, player.id, session.currentRound, getPlayerScore(player.id, session.currentRound) + 1)"
                     >
                        +
                     </button>
                  </div>
                  <span class="score-row__total">{{ player.total }}</span>
               </div>
            </div>
         </div>

         <button v-if="!isGameOver" class="btn-primary session-page__next-round" @click="handleAddRound">
            {{ t('scores.session.nextRound') }}
         </button>
      </div>

      <div v-else class="session-page__loading">
         <p>{{ t('common.loading') }}</p>
      </div>
   </div>
</template>

<style scoped>
.session-page {
   min-height: 100dvh;
   display: flex;
   flex-direction: column;
}

.session-page__header {
   display: flex;
   align-items: center;
   gap: var(--gap-md);
   padding: var(--gap-md);
   background: var(--bg-secondary);
}

.session-page__back {
   font-size: var(--text-lg);
   color: var(--text-primary);
   padding: var(--gap-xs);
}

.session-page__header .heading {
   flex: 1;
   font-size: var(--text-lg);
}

.session-page__content {
   flex: 1;
   padding: var(--gap-md);
   display: flex;
   flex-direction: column;
   gap: var(--gap-lg);
}

.game-over-banner {
   text-align: center;
   background: var(--accent-primary);
   padding: var(--gap-lg);
}

.game-over-banner .heading {
   font-size: var(--text-xl);
   margin-bottom: var(--gap-sm);
}

.game-over-banner__winner {
   font-size: var(--text-lg);
}

.section-title {
   font-size: var(--text-sm);
   color: var(--text-secondary);
   text-transform: uppercase;
   letter-spacing: 0.05em;
   margin-bottom: var(--gap-sm);
}

.leaderboard__list {
   display: flex;
   flex-direction: column;
   gap: var(--gap-xs);
}

.leaderboard__item {
   display: flex;
   align-items: center;
   gap: var(--gap-md);
   padding: var(--gap-sm) var(--gap-md);
}

.leaderboard__item.rank--first {
   background: linear-gradient(135deg, var(--surface) 0%, rgba(255, 215, 0, 0.2) 100%);
   border-color: rgba(255, 215, 0, 0.3);
}

.leaderboard__item.rank--second {
   background: linear-gradient(135deg, var(--surface) 0%, rgba(192, 192, 192, 0.15) 100%);
}

.leaderboard__item.rank--third {
   background: linear-gradient(135deg, var(--surface) 0%, rgba(205, 127, 50, 0.15) 100%);
}

.leaderboard__rank {
   font-family: var(--font-display);
   font-size: var(--text-lg);
   font-weight: 700;
   color: var(--text-secondary);
   width: 30px;
   text-align: center;
}

.leaderboard__name {
   flex: 1;
   font-size: var(--text-base);
}

.leaderboard__score {
   font-size: var(--text-lg);
}

.score-table__grid {
   display: flex;
   flex-direction: column;
   gap: var(--gap-sm);
}

.score-row {
   display: flex;
   align-items: center;
   gap: var(--gap-md);
   padding: var(--gap-sm) var(--gap-md);
}

.score-row__name {
   flex: 1;
   font-size: var(--text-base);
}

.score-row__input-wrapper {
   display: flex;
   align-items: center;
   gap: var(--gap-xs);
}

.score-row__btn {
   width: 36px;
   height: 36px;
   border-radius: var(--radius-sm);
   background: var(--surface-hover);
   color: var(--text-primary);
   font-size: var(--text-lg);
   font-weight: 600;
   display: flex;
   align-items: center;
   justify-content: center;
}

.score-row__btn:active {
   background: var(--accent-primary);
}

.score-row__input {
   width: 60px;
   text-align: center;
   padding: var(--gap-xs);
   border-radius: var(--radius-sm);
   border: var(--border);
   background: var(--surface);
   color: var(--text-primary);
   font-family: var(--font-display);
   font-size: var(--text-base);
}

.score-row__input:focus {
   outline: 2px solid var(--accent-primary);
   outline-offset: 2px;
}

.score-row__total {
   font-family: var(--font-display);
   font-size: var(--text-base);
   color: var(--accent-primary);
   min-width: 50px;
   text-align: right;
}

.session-page__next-round {
   margin-top: auto;
   width: 100%;
   justify-content: center;
}

.session-page__loading {
   flex: 1;
   display: flex;
   align-items: center;
   justify-content: center;
   color: var(--text-secondary);
}
</style>
