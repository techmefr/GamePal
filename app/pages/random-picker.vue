<script setup lang="ts">
import type { IPickerPlayer, ITeam, ITouchPoint } from '~/types'

const { t } = useI18n()

type PickerMode = 'touch' | 'list'
type DrawMode = 'player' | 'team' | 'firstPlayer' | 'turnOrder'

const mode = ref<PickerMode>('touch')
const drawMode = ref<DrawMode>('player')
const touchPoints = ref<ITouchPoint[]>([])
const selectedPoint = ref<ITouchPoint | null>(null)
const isSelecting = ref(false)
const selectionTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

const { data: players } = useLocalStorage<IPickerPlayer[]>('gamepal-picker-players', [])
const { data: teams } = useLocalStorage<ITeam[]>('gamepal-picker-teams', [])
const newPlayerName = ref('')
const newTeamName = ref('')
const selectedResult = ref<string | null>(null)
const turnOrderResult = ref<string[]>([])
const isListSelecting = ref(false)
const showTeamManager = ref(false)
const editingPlayerId = ref<string | null>(null)

const SELECTION_DELAY = 3000
const MIN_POINTS_FOR_SELECTION = 2

const activePlayers = computed((): IPickerPlayer[] => {
   return players.value.filter(p => p.isActive)
})

const activeTeams = computed((): ITeam[] => {
   return teams.value.filter(team => {
      const teamPlayers = players.value.filter(p => p.teamId === team.id && p.isActive)
      return teamPlayers.length > 0
   })
})

const unassignedPlayers = computed((): IPickerPlayer[] => {
   return players.value.filter(p => p.teamId === null)
})

const canDraw = computed((): boolean => {
   if (drawMode.value === 'team') {
      return activeTeams.value.length >= 2
   }
   return activePlayers.value.length >= 2
})

const canGenerateTurnOrder = computed((): boolean => {
   if (drawMode.value === 'team') {
      return activeTeams.value.length >= 2
   }
   return activePlayers.value.length >= 2
})

function handleTouchStart(event: TouchEvent): void {
   event.preventDefault()
   clearSelection()

   for (const touch of Array.from(event.changedTouches)) {
      const point: ITouchPoint = {
         id: touch.identifier,
         x: touch.clientX,
         y: touch.clientY,
         color: getRandomColor(),
      }
      touchPoints.value.push(point)
   }

   startSelectionTimer()
}

function handleTouchMove(event: TouchEvent): void {
   event.preventDefault()

   for (const touch of Array.from(event.changedTouches)) {
      const point = touchPoints.value.find(p => p.id === touch.identifier)
      if (point) {
         point.x = touch.clientX
         point.y = touch.clientY
      }
   }
}

function handleTouchEnd(event: TouchEvent): void {
   event.preventDefault()

   for (const touch of Array.from(event.changedTouches)) {
      const index = touchPoints.value.findIndex(p => p.id === touch.identifier)
      if (index !== -1) {
         touchPoints.value.splice(index, 1)
      }
   }

   if (touchPoints.value.length < MIN_POINTS_FOR_SELECTION) {
      cancelSelectionTimer()
   }
}

function startSelectionTimer(): void {
   cancelSelectionTimer()

   if (touchPoints.value.length >= MIN_POINTS_FOR_SELECTION) {
      selectionTimeout.value = setTimeout(() => {
         selectRandomPoint()
      }, SELECTION_DELAY)
   }
}

function cancelSelectionTimer(): void {
   if (selectionTimeout.value) {
      clearTimeout(selectionTimeout.value)
      selectionTimeout.value = null
   }
}

function selectRandomPoint(): void {
   if (touchPoints.value.length === 0) return

   isSelecting.value = true
   const winner = pickRandom(touchPoints.value)
   selectedPoint.value = winner

   setTimeout(() => {
      touchPoints.value = []
      isSelecting.value = false
   }, 2000)
}

function clearSelection(): void {
   selectedPoint.value = null
   isSelecting.value = false
}

function addPlayer(): void {
   const name = newPlayerName.value.trim()
   if (name === '') return

   const player: IPickerPlayer = {
      id: generateId(),
      name,
      isActive: true,
      teamId: null,
   }
   players.value.push(player)
   newPlayerName.value = ''
}

function removePlayer(id: string): void {
   const index = players.value.findIndex(p => p.id === id)
   if (index !== -1) {
      players.value.splice(index, 1)
   }
}

function togglePlayerActive(id: string): void {
   const player = players.value.find(p => p.id === id)
   if (player) {
      player.isActive = !player.isActive
   }
}

function toggleAllPlayers(active: boolean): void {
   players.value.forEach(p => {
      p.isActive = active
   })
}

function addTeam(): void {
   const name = newTeamName.value.trim()
   if (name === '') return

   const team: ITeam = {
      id: generateId(),
      name,
      color: getColorByIndex(teams.value.length),
   }
   teams.value.push(team)
   newTeamName.value = ''
}

function removeTeam(id: string): void {
   players.value.forEach(p => {
      if (p.teamId === id) {
         p.teamId = null
      }
   })
   const index = teams.value.findIndex(t => t.id === id)
   if (index !== -1) {
      teams.value.splice(index, 1)
   }
}

function assignPlayerToTeam(playerId: string, teamId: string | null): void {
   const player = players.value.find(p => p.id === playerId)
   if (player) {
      player.teamId = teamId
   }
   editingPlayerId.value = null
}

function getTeamPlayers(teamId: string): IPickerPlayer[] {
   return players.value.filter(p => p.teamId === teamId)
}

function getTeamById(teamId: string): ITeam | null {
   return teams.value.find(t => t.id === teamId) || null
}

function pickRandomFromList(): void {
   if (!canDraw.value) return

   isListSelecting.value = true
   selectedResult.value = null
   turnOrderResult.value = []

   const items = drawMode.value === 'team'
      ? activeTeams.value.map(t => t.name)
      : activePlayers.value.map(p => p.name)

   let iterations = 0
   const maxIterations = 15
   const interval = setInterval(() => {
      selectedResult.value = pickRandom(items)
      iterations++

      if (iterations >= maxIterations) {
         clearInterval(interval)
         isListSelecting.value = false
      }
   }, 100)
}

function generateTurnOrder(): void {
   if (!canGenerateTurnOrder.value) return

   isListSelecting.value = true
   selectedResult.value = null
   turnOrderResult.value = []

   const items = drawMode.value === 'team'
      ? activeTeams.value.map(t => t.name)
      : activePlayers.value.map(p => p.name)

   setTimeout(() => {
      turnOrderResult.value = shuffleArray([...items])
      isListSelecting.value = false
   }, 500)
}

function pickFirstPlayer(): void {
   if (!canDraw.value) return

   isListSelecting.value = true
   selectedResult.value = null
   turnOrderResult.value = []

   const items = drawMode.value === 'team'
      ? activeTeams.value.map(t => t.name)
      : activePlayers.value.map(p => p.name)

   let iterations = 0
   const maxIterations = 15
   const interval = setInterval(() => {
      selectedResult.value = pickRandom(items)
      iterations++

      if (iterations >= maxIterations) {
         clearInterval(interval)
         isListSelecting.value = false
      }
   }, 100)
}

function switchMode(newMode: PickerMode): void {
   mode.value = newMode
   clearSelection()
   selectedResult.value = null
   turnOrderResult.value = []
}

function clearResults(): void {
   selectedResult.value = null
   turnOrderResult.value = []
}

onUnmounted(() => {
   cancelSelectionTimer()
})
</script>

<template>
   <div class="picker">
      <header class="picker__header">
         <NuxtLink to="/" class="picker__back">
            <span>←</span>
         </NuxtLink>
         <h1 class="heading">{{ t('randomPicker.title') }}</h1>
         <div class="picker__mode-switch">
            <button
               class="picker__mode-btn"
               :class="{ 'picker__mode-btn--active': mode === 'touch' }"
               @click="switchMode('touch')"
            >
               {{ t('randomPicker.touch') }}
            </button>
            <button
               class="picker__mode-btn"
               :class="{ 'picker__mode-btn--active': mode === 'list' }"
               @click="switchMode('list')"
            >
               {{ t('randomPicker.list') }}
            </button>
         </div>
      </header>

      <div v-if="mode === 'touch'" class="touch-zone">
         <div
            class="touch-area"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
            @touchcancel="handleTouchEnd"
         >
            <p v-if="touchPoints.length === 0" class="touch-area__hint">
               {{ t('randomPicker.touchHint') }}
            </p>

            <div
               v-for="point in touchPoints"
               :key="point.id"
               class="touch-point"
               :class="{
                  'touch-point--winner': selectedPoint?.id === point.id,
                  'touch-point--loser': selectedPoint && selectedPoint.id !== point.id,
               }"
               :style="{
                  left: `${point.x}px`,
                  top: `${point.y}px`,
                  backgroundColor: point.color,
               }"
            ></div>
         </div>

         <p v-if="touchPoints.length >= MIN_POINTS_FOR_SELECTION && !isSelecting" class="touch-zone__status">
            {{ t('randomPicker.holdStill') }}
         </p>
      </div>

      <div v-else class="list-zone">
         <div class="list-zone__draw-modes">
            <button
               class="draw-mode-btn"
               :class="{ 'draw-mode-btn--active': drawMode === 'player' }"
               @click="drawMode = 'player'; clearResults()"
            >
               {{ t('randomPicker.drawPlayer') }}
            </button>
            <button
               class="draw-mode-btn"
               :class="{ 'draw-mode-btn--active': drawMode === 'team' }"
               @click="drawMode = 'team'; clearResults()"
            >
               {{ t('randomPicker.drawTeam') }}
            </button>
         </div>

         <div class="list-zone__input-row">
            <input
               v-model="newPlayerName"
               type="text"
               class="list-zone__input"
               :placeholder="t('randomPicker.playerName')"
               @keyup.enter="addPlayer"
            />
            <button class="btn-primary" @click="addPlayer">{{ t('common.add') }}</button>
         </div>

         <div v-if="players.length > 0" class="list-zone__toolbar">
            <button class="toolbar-btn" @click="toggleAllPlayers(true)">
               {{ t('randomPicker.selectAll') }}
            </button>
            <button class="toolbar-btn" @click="toggleAllPlayers(false)">
               {{ t('randomPicker.deselectAll') }}
            </button>
            <button class="toolbar-btn toolbar-btn--teams" @click="showTeamManager = !showTeamManager">
               {{ t('randomPicker.manageTeams') }}
            </button>
         </div>

         <div v-if="showTeamManager" class="team-manager">
            <div class="team-manager__header">
               <h3 class="team-manager__title">{{ t('randomPicker.teams') }}</h3>
            </div>

            <div class="team-manager__input-row">
               <input
                  v-model="newTeamName"
                  type="text"
                  class="list-zone__input"
                  :placeholder="t('randomPicker.teamName')"
                  @keyup.enter="addTeam"
               />
               <button class="btn-primary" @click="addTeam">{{ t('common.add') }}</button>
            </div>

            <div v-if="teams.length > 0" class="team-list">
               <div v-for="team in teams" :key="team.id" class="team-item">
                  <div class="team-item__header">
                     <span class="team-item__color" :style="{ backgroundColor: team.color }"></span>
                     <span class="team-item__name">{{ team.name }}</span>
                     <span class="team-item__count">{{ getTeamPlayers(team.id).length }}</span>
                     <button class="team-item__remove" @click="removeTeam(team.id)">×</button>
                  </div>
                  <div v-if="getTeamPlayers(team.id).length > 0" class="team-item__players">
                     <span
                        v-for="player in getTeamPlayers(team.id)"
                        :key="player.id"
                        class="team-item__player"
                        :class="{ 'team-item__player--inactive': !player.isActive }"
                     >
                        {{ player.name }}
                     </span>
                  </div>
               </div>
            </div>

            <div v-if="unassignedPlayers.length > 0" class="unassigned-section">
               <p class="unassigned-section__label">{{ t('randomPicker.unassigned') }}</p>
               <div class="unassigned-section__players">
                  <span
                     v-for="player in unassignedPlayers"
                     :key="player.id"
                     class="team-item__player"
                     :class="{ 'team-item__player--inactive': !player.isActive }"
                  >
                     {{ player.name }}
                  </span>
               </div>
            </div>
         </div>

         <ul v-if="players.length > 0" class="player-list">
            <li
               v-for="player in players"
               :key="player.id"
               class="player-list__item card-game"
               :class="{
                  'player-list__item--selected': selectedResult === player.name,
                  'player-list__item--inactive': !player.isActive,
               }"
            >
               <button
                  class="player-list__toggle"
                  :class="{ 'player-list__toggle--active': player.isActive }"
                  @click="togglePlayerActive(player.id)"
               >
                  <span v-if="player.isActive">✓</span>
               </button>
               <span class="player-list__name">{{ player.name }}</span>
               <span
                  v-if="player.teamId"
                  class="player-list__team-badge"
                  :style="{ backgroundColor: getTeamById(player.teamId)?.color }"
               >
                  {{ getTeamById(player.teamId)?.name }}
               </span>
               <div class="player-list__actions">
                  <button
                     v-if="teams.length > 0"
                     class="player-list__assign"
                     @click="editingPlayerId = editingPlayerId === player.id ? null : player.id"
                  >
                     {{ player.teamId ? t('randomPicker.reassign') : t('randomPicker.assign') }}
                  </button>
                  <button class="player-list__remove" @click="removePlayer(player.id)">×</button>
               </div>
               <div v-if="editingPlayerId === player.id" class="player-list__team-select">
                  <button
                     v-for="team in teams"
                     :key="team.id"
                     class="team-select-btn"
                     :style="{ borderColor: team.color }"
                     @click="assignPlayerToTeam(player.id, team.id)"
                  >
                     {{ team.name }}
                  </button>
                  <button
                     v-if="player.teamId"
                     class="team-select-btn team-select-btn--none"
                     @click="assignPlayerToTeam(player.id, null)"
                  >
                     {{ t('randomPicker.noTeam') }}
                  </button>
               </div>
            </li>
         </ul>

         <p v-else class="list-zone__empty">{{ t('randomPicker.noPlayers') }}</p>

         <div v-if="players.length >= 2" class="list-zone__actions">
            <button
               class="btn-primary list-zone__pick-btn"
               :disabled="isListSelecting || !canDraw"
               @click="pickRandomFromList"
            >
               {{ isListSelecting ? t('randomPicker.picking') : t('randomPicker.pickRandom') }}
            </button>
            <button
               class="btn-secondary list-zone__order-btn"
               :disabled="isListSelecting || !canGenerateTurnOrder"
               @click="generateTurnOrder"
            >
               {{ t('randomPicker.turnOrder') }}
            </button>
            <button
               class="btn-secondary list-zone__first-btn"
               :disabled="isListSelecting || !canDraw"
               @click="pickFirstPlayer"
            >
               {{ t('randomPicker.firstPlayer') }}
            </button>
         </div>

         <div v-if="selectedResult && !isListSelecting && turnOrderResult.length === 0" class="list-zone__result">
            <p class="list-zone__winner">{{ selectedResult }}</p>
         </div>

         <div v-if="turnOrderResult.length > 0 && !isListSelecting" class="list-zone__turn-order">
            <h3 class="turn-order__title">{{ t('randomPicker.turnOrderResult') }}</h3>
            <ol class="turn-order__list">
               <li v-for="(name, index) in turnOrderResult" :key="index" class="turn-order__item">
                  <span class="turn-order__position">{{ index + 1 }}</span>
                  <span class="turn-order__name">{{ name }}</span>
               </li>
            </ol>
         </div>
      </div>
   </div>
</template>

<style scoped>
.picker {
   min-height: 100dvh;
   display: flex;
   flex-direction: column;
}

.picker__header {
   display: flex;
   align-items: center;
   gap: var(--gap-md);
   padding: var(--gap-md);
   background: var(--bg-secondary);
}

.picker__back {
   font-size: var(--text-lg);
   color: var(--text-primary);
   padding: var(--gap-xs);
}

.picker__header .heading {
   flex: 1;
   font-size: var(--text-lg);
}

.picker__mode-switch {
   display: flex;
   gap: var(--gap-xs);
}

.picker__mode-btn {
   padding: var(--gap-xs) var(--gap-md);
   border-radius: var(--radius-sm);
   font-size: var(--text-sm);
   color: var(--text-secondary);
   transition: all var(--transition-fast);
}

.picker__mode-btn--active {
   background: var(--accent-primary);
   color: #ffffff;
}

.touch-zone {
   flex: 1;
   display: flex;
   flex-direction: column;
   position: relative;
}

.touch-area {
   flex: 1;
   position: relative;
   touch-action: none;
   user-select: none;
}

.touch-area__hint {
   position: absolute;
   top: 50%;
   left: 50%;
   transform: translate(-50%, -50%);
   color: var(--text-secondary);
   font-size: var(--text-lg);
   text-align: center;
   pointer-events: none;
}

.touch-point {
   position: absolute;
   width: 80px;
   height: 80px;
   border-radius: 50%;
   transform: translate(-50%, -50%);
   transition: transform var(--transition-bounce), opacity var(--transition-fast);
   pointer-events: none;
}

.touch-point--winner {
   transform: translate(-50%, -50%) scale(1.5);
   box-shadow: 0 0 40px currentColor;
   z-index: 10;
}

.touch-point--loser {
   opacity: 0.3;
   transform: translate(-50%, -50%) scale(0.8);
}

.touch-zone__status {
   position: absolute;
   bottom: var(--gap-lg);
   left: 50%;
   transform: translateX(-50%);
   color: var(--text-secondary);
   font-size: var(--text-base);
}

.list-zone {
   flex: 1;
   padding: var(--gap-md);
   display: flex;
   flex-direction: column;
   gap: var(--gap-md);
   overflow-y: auto;
}

.list-zone__draw-modes {
   display: flex;
   gap: var(--gap-xs);
   background: var(--surface);
   padding: var(--gap-xs);
   border-radius: var(--radius-sm);
}

.draw-mode-btn {
   flex: 1;
   padding: var(--gap-sm);
   border-radius: var(--radius-xs);
   font-size: var(--text-sm);
   color: var(--text-secondary);
   transition: all var(--transition-fast);
}

.draw-mode-btn--active {
   background: var(--accent-primary);
   color: #ffffff;
}

.list-zone__input-row {
   display: flex;
   gap: var(--gap-sm);
}

.list-zone__input {
   flex: 1;
   padding: var(--gap-sm) var(--gap-md);
   border-radius: var(--radius-sm);
   border: var(--border);
   background: var(--surface);
   color: var(--text-primary);
}

.list-zone__input:focus {
   outline: 2px solid var(--accent-primary);
   outline-offset: 2px;
}

.list-zone__toolbar {
   display: flex;
   gap: var(--gap-xs);
   flex-wrap: wrap;
}

.toolbar-btn {
   padding: var(--gap-xs) var(--gap-sm);
   font-size: var(--text-xs);
   color: var(--text-secondary);
   border: var(--border);
   border-radius: var(--radius-xs);
   transition: all var(--transition-fast);
}

.toolbar-btn:hover {
   color: var(--text-primary);
   border-color: var(--text-secondary);
}

.toolbar-btn--teams {
   margin-left: auto;
   color: var(--accent-primary);
   border-color: var(--accent-primary);
}

.team-manager {
   background: var(--surface);
   border-radius: var(--radius-md);
   padding: var(--gap-md);
   display: flex;
   flex-direction: column;
   gap: var(--gap-md);
}

.team-manager__header {
   display: flex;
   align-items: center;
   justify-content: space-between;
}

.team-manager__title {
   font-size: var(--text-base);
   color: var(--text-primary);
}

.team-manager__input-row {
   display: flex;
   gap: var(--gap-sm);
}

.team-list {
   display: flex;
   flex-direction: column;
   gap: var(--gap-sm);
}

.team-item {
   background: var(--bg-secondary);
   border-radius: var(--radius-sm);
   padding: var(--gap-sm);
}

.team-item__header {
   display: flex;
   align-items: center;
   gap: var(--gap-sm);
}

.team-item__color {
   width: 12px;
   height: 12px;
   border-radius: 50%;
}

.team-item__name {
   flex: 1;
   font-weight: 500;
}

.team-item__count {
   font-size: var(--text-xs);
   color: var(--text-secondary);
   background: var(--surface);
   padding: 2px 6px;
   border-radius: var(--radius-xs);
}

.team-item__remove {
   font-size: var(--text-lg);
   color: var(--text-secondary);
   padding: var(--gap-xs);
}

.team-item__remove:hover {
   color: var(--error);
}

.team-item__players {
   display: flex;
   flex-wrap: wrap;
   gap: var(--gap-xs);
   margin-top: var(--gap-xs);
}

.team-item__player {
   font-size: var(--text-xs);
   color: var(--text-secondary);
   background: var(--surface);
   padding: 2px 8px;
   border-radius: var(--radius-xs);
}

.team-item__player--inactive {
   opacity: 0.5;
   text-decoration: line-through;
}

.unassigned-section {
   padding-top: var(--gap-sm);
   border-top: var(--border);
}

.unassigned-section__label {
   font-size: var(--text-xs);
   color: var(--text-secondary);
   margin-bottom: var(--gap-xs);
}

.unassigned-section__players {
   display: flex;
   flex-wrap: wrap;
   gap: var(--gap-xs);
}

.player-list {
   display: flex;
   flex-direction: column;
   gap: var(--gap-sm);
}

.player-list__item {
   display: flex;
   align-items: center;
   gap: var(--gap-sm);
   flex-wrap: wrap;
   transition: all var(--transition-fast);
}

.player-list__item--selected {
   background: var(--accent-primary);
   transform: scale(1.02);
}

.player-list__item--inactive {
   opacity: 0.5;
}

.player-list__toggle {
   width: 24px;
   height: 24px;
   border: 2px solid var(--text-secondary);
   border-radius: var(--radius-xs);
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: var(--text-sm);
   color: transparent;
   transition: all var(--transition-fast);
}

.player-list__toggle--active {
   background: var(--accent-primary);
   border-color: var(--accent-primary);
   color: #ffffff;
}

.player-list__name {
   flex: 1;
}

.player-list__team-badge {
   font-size: var(--text-xs);
   padding: 2px 8px;
   border-radius: var(--radius-xs);
   color: #ffffff;
}

.player-list__actions {
   display: flex;
   gap: var(--gap-xs);
}

.player-list__assign {
   font-size: var(--text-xs);
   color: var(--accent-primary);
   padding: var(--gap-xs);
}

.player-list__remove {
   font-size: var(--text-lg);
   color: var(--text-secondary);
   padding: var(--gap-xs);
}

.player-list__remove:hover {
   color: var(--error);
}

.player-list__team-select {
   width: 100%;
   display: flex;
   flex-wrap: wrap;
   gap: var(--gap-xs);
   padding-top: var(--gap-xs);
   border-top: var(--border);
   margin-top: var(--gap-xs);
}

.team-select-btn {
   font-size: var(--text-xs);
   padding: var(--gap-xs) var(--gap-sm);
   border: 2px solid var(--accent-primary);
   border-radius: var(--radius-xs);
   color: var(--text-primary);
   transition: all var(--transition-fast);
}

.team-select-btn:hover {
   background: var(--surface);
}

.team-select-btn--none {
   border-color: var(--text-secondary);
   color: var(--text-secondary);
}

.list-zone__empty {
   color: var(--text-secondary);
   text-align: center;
   padding: var(--gap-lg);
}

.list-zone__actions {
   display: flex;
   flex-direction: column;
   gap: var(--gap-sm);
   margin-top: auto;
}

.list-zone__pick-btn,
.list-zone__order-btn,
.list-zone__first-btn {
   width: 100%;
   justify-content: center;
}

.btn-secondary {
   padding: var(--gap-sm) var(--gap-md);
   border-radius: var(--radius-md);
   font-size: var(--text-base);
   font-weight: 500;
   border: 2px solid var(--accent-primary);
   color: var(--accent-primary);
   background: transparent;
   cursor: pointer;
   display: flex;
   align-items: center;
   justify-content: center;
   transition: all var(--transition-fast);
}

.btn-secondary:hover:not(:disabled) {
   background: var(--accent-primary);
   color: #ffffff;
}

.btn-secondary:disabled {
   opacity: 0.5;
   cursor: not-allowed;
}

.list-zone__result {
   text-align: center;
   padding: var(--gap-lg);
}

.list-zone__winner {
   font-family: var(--font-display);
   font-size: var(--text-xl);
   color: var(--accent-primary);
   animation: pulse 0.5s ease-in-out;
}

.list-zone__turn-order {
   background: var(--surface);
   border-radius: var(--radius-md);
   padding: var(--gap-md);
}

.turn-order__title {
   font-size: var(--text-base);
   color: var(--text-primary);
   margin-bottom: var(--gap-md);
   text-align: center;
}

.turn-order__list {
   display: flex;
   flex-direction: column;
   gap: var(--gap-sm);
   list-style: none;
}

.turn-order__item {
   display: flex;
   align-items: center;
   gap: var(--gap-md);
   padding: var(--gap-sm);
   background: var(--bg-secondary);
   border-radius: var(--radius-sm);
}

.turn-order__position {
   width: 28px;
   height: 28px;
   background: var(--accent-primary);
   color: #ffffff;
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;
   font-weight: 600;
   font-size: var(--text-sm);
}

.turn-order__name {
   flex: 1;
   font-weight: 500;
}

@keyframes pulse {
   0%,
   100% {
      transform: scale(1);
   }
   50% {
      transform: scale(1.1);
   }
}
</style>
