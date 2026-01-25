<script setup lang="ts">
import type { IPlayer, ITouchPoint } from '~/types'

type PickerMode = 'touch' | 'list'

const mode = ref<PickerMode>('touch')
const touchPoints = ref<ITouchPoint[]>([])
const selectedPoint = ref<ITouchPoint | null>(null)
const isSelecting = ref(false)
const selectionTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

const { data: players } = useLocalStorage<IPlayer[]>('gamepal-players', [])
const newPlayerName = ref('')
const selectedPlayer = ref<IPlayer | null>(null)
const isListSelecting = ref(false)

const SELECTION_DELAY = 3000
const MIN_POINTS_FOR_SELECTION = 2

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

   const player: IPlayer = {
      id: generateId(),
      name,
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

function pickRandomPlayer(): void {
   if (players.value.length === 0) return

   isListSelecting.value = true
   selectedPlayer.value = null

   let iterations = 0
   const maxIterations = 15
   const interval = setInterval(() => {
      selectedPlayer.value = pickRandom(players.value)
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
   selectedPlayer.value = null
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
         <h1 class="heading">Random Picker</h1>
         <div class="picker__mode-switch">
            <button
               class="picker__mode-btn"
               :class="{ 'picker__mode-btn--active': mode === 'touch' }"
               @click="switchMode('touch')"
            >
               Touch
            </button>
            <button
               class="picker__mode-btn"
               :class="{ 'picker__mode-btn--active': mode === 'list' }"
               @click="switchMode('list')"
            >
               List
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
               Place your fingers on the screen
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
            Hold still...
         </p>
      </div>

      <div v-else class="list-zone">
         <div class="list-zone__input-row">
            <input
               v-model="newPlayerName"
               type="text"
               class="list-zone__input"
               placeholder="Player name"
               @keyup.enter="addPlayer"
            />
            <button class="btn-primary" @click="addPlayer">Add</button>
         </div>

         <ul v-if="players.length > 0" class="player-list">
            <li
               v-for="player in players"
               :key="player.id"
               class="player-list__item card-game"
               :class="{ 'player-list__item--selected': selectedPlayer?.id === player.id }"
            >
               <span>{{ player.name }}</span>
               <button class="player-list__remove" @click="removePlayer(player.id)">×</button>
            </li>
         </ul>

         <p v-else class="list-zone__empty">No players yet</p>

         <button
            v-if="players.length >= 2"
            class="btn-primary list-zone__pick-btn"
            :disabled="isListSelecting"
            @click="pickRandomPlayer"
         >
            {{ isListSelecting ? 'Picking...' : 'Pick random player' }}
         </button>

         <div v-if="selectedPlayer && !isListSelecting" class="list-zone__result">
            <p class="list-zone__winner">{{ selectedPlayer.name }}</p>
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

.player-list {
   display: flex;
   flex-direction: column;
   gap: var(--gap-sm);
}

.player-list__item {
   display: flex;
   align-items: center;
   justify-content: space-between;
   transition: all var(--transition-fast);
}

.player-list__item--selected {
   background: var(--accent-primary);
   transform: scale(1.02);
}

.player-list__remove {
   font-size: var(--text-lg);
   color: var(--text-secondary);
   padding: var(--gap-xs);
}

.player-list__remove:hover {
   color: var(--error);
}

.list-zone__empty {
   color: var(--text-secondary);
   text-align: center;
   padding: var(--gap-lg);
}

.list-zone__pick-btn {
   margin-top: auto;
   width: 100%;
   justify-content: center;
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
