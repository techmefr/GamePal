<script setup lang="ts">
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
   <div class="new-session">
      <header class="new-session__header">
         <NuxtLink to="/scores" class="new-session__back">
            <span>←</span>
         </NuxtLink>
         <h1 class="heading">{{ t('scores.newSession.title') }}</h1>
      </header>

      <div class="new-session__content">
         <div v-if="showSavedPlayers" class="saved-players-banner card-game">
            <p>{{ t('scores.newSession.useSavedPlayers') }}</p>
            <div class="saved-players-banner__actions">
               <button class="btn-primary" @click="useSavedPlayers">{{ t('scores.newSession.yes') }}</button>
               <button class="saved-players-banner__dismiss" @click="showSavedPlayers = false">
                  {{ t('scores.newSession.no') }}
               </button>
            </div>
         </div>

         <div class="form-group">
            <label class="form-label">{{ t('scores.newSession.sessionName') }}</label>
            <input
               v-model="sessionName"
               type="text"
               class="form-input"
               :placeholder="t('scores.newSession.sessionNamePlaceholder')"
            />
         </div>

         <div class="form-group">
            <label class="form-label">{{ t('scores.newSession.players') }}</label>
            <div class="player-fields">
               <div v-for="(_, index) in playerNames" :key="index" class="player-field">
                  <input
                     v-model="playerNames[index]"
                     type="text"
                     class="form-input"
                     :placeholder="t('scores.newSession.playerPlaceholder', { n: index + 1 })"
                  />
                  <button
                     v-if="playerNames.length > 2"
                     class="player-field__remove"
                     @click="removePlayerField(index)"
                  >
                     ×
                  </button>
               </div>
            </div>
            <button class="add-player-btn" @click="addPlayerField">{{ t('scores.newSession.addPlayer') }}</button>
         </div>

         <div class="form-group">
            <label class="form-label">{{ t('scores.newSession.gameMode') }}</label>
            <div class="toggle-group">
               <button
                  class="toggle-btn"
                  :class="{ 'toggle-btn--active': !isTeamMode }"
                  @click="isTeamMode = false"
               >
                  {{ t('scores.newSession.individual') }}
               </button>
               <button
                  class="toggle-btn"
                  :class="{ 'toggle-btn--active': isTeamMode }"
                  @click="isTeamMode = true"
               >
                  {{ t('scores.newSession.teams') }}
               </button>
            </div>
         </div>

         <div class="form-group">
            <label class="form-label">{{ t('scores.newSession.endCondition') }}</label>
            <div class="end-condition">
               <div class="end-condition__field">
                  <span>{{ t('scores.newSession.maxRounds') }}</span>
                  <input
                     v-model.number="maxRounds"
                     type="number"
                     class="form-input form-input--small"
                     min="1"
                     placeholder="∞"
                  />
               </div>
               <div class="end-condition__field">
                  <span>{{ t('scores.newSession.targetScore') }}</span>
                  <input
                     v-model.number="maxScore"
                     type="number"
                     class="form-input form-input--small"
                     min="1"
                     placeholder="∞"
                  />
               </div>
            </div>
         </div>

         <button class="btn-primary new-session__create" :disabled="!canCreate" @click="handleCreate">
            {{ t('scores.newSession.create') }}
         </button>
      </div>
   </div>
</template>

<style scoped>
.new-session {
   min-height: 100dvh;
   display: flex;
   flex-direction: column;
}

.new-session__header {
   display: flex;
   align-items: center;
   gap: var(--gap-md);
   padding: var(--gap-md);
   background: var(--bg-secondary);
}

.new-session__back {
   font-size: var(--text-lg);
   color: var(--text-primary);
   padding: var(--gap-xs);
}

.new-session__header .heading {
   flex: 1;
   font-size: var(--text-lg);
}

.new-session__content {
   flex: 1;
   padding: var(--gap-md);
   display: flex;
   flex-direction: column;
   gap: var(--gap-lg);
}

.saved-players-banner {
   display: flex;
   flex-direction: column;
   gap: var(--gap-sm);
   text-align: center;
}

.saved-players-banner__actions {
   display: flex;
   gap: var(--gap-sm);
   justify-content: center;
}

.saved-players-banner__dismiss {
   padding: var(--gap-xs) var(--gap-md);
   color: var(--text-secondary);
}

.form-group {
   display: flex;
   flex-direction: column;
   gap: var(--gap-sm);
}

.form-label {
   font-size: var(--text-sm);
   color: var(--text-secondary);
   text-transform: uppercase;
   letter-spacing: 0.05em;
}

.form-input {
   padding: var(--gap-sm) var(--gap-md);
   border-radius: var(--radius-sm);
   border: var(--border);
   background: var(--surface);
   color: var(--text-primary);
   font-size: var(--text-base);
}

.form-input:focus {
   outline: 2px solid var(--accent-primary);
   outline-offset: 2px;
}

.form-input--small {
   width: 80px;
   text-align: center;
}

.player-fields {
   display: flex;
   flex-direction: column;
   gap: var(--gap-sm);
}

.player-field {
   display: flex;
   gap: var(--gap-sm);
}

.player-field .form-input {
   flex: 1;
}

.player-field__remove {
   font-size: var(--text-lg);
   color: var(--text-secondary);
   padding: 0 var(--gap-sm);
}

.player-field__remove:hover {
   color: var(--error);
}

.add-player-btn {
   color: var(--accent-primary);
   font-size: var(--text-sm);
   padding: var(--gap-sm);
   text-align: left;
}

.toggle-group {
   display: flex;
   gap: var(--gap-xs);
}

.toggle-btn {
   flex: 1;
   padding: var(--gap-sm) var(--gap-md);
   border-radius: var(--radius-sm);
   font-size: var(--text-sm);
   color: var(--text-secondary);
   background: var(--surface);
   border: var(--border);
   transition: all var(--transition-fast);
}

.toggle-btn--active {
   background: var(--accent-primary);
   color: #ffffff;
   border-color: var(--accent-primary);
}

.end-condition {
   display: flex;
   gap: var(--gap-md);
}

.end-condition__field {
   flex: 1;
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: var(--gap-sm);
   padding: var(--gap-sm);
   background: var(--surface);
   border-radius: var(--radius-sm);
   border: var(--border);
   font-size: var(--text-sm);
   color: var(--text-secondary);
}

.new-session__create {
   margin-top: auto;
   width: 100%;
   justify-content: center;
}

.new-session__create:disabled {
   opacity: 0.5;
   cursor: not-allowed;
}
</style>
