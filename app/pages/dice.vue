<script setup lang="ts">
import type { IDie } from '~/types'

const { t } = useI18n()

const DICE_TYPES = [3, 4, 6, 8, 10, 12, 20, 100]

const dice = ref<IDie[]>([])
const isRolling = ref(false)
const totalResult = computed(() => dice.value.reduce((sum, die) => sum + (die.value ?? 0), 0))

function addDie(type: number): void {
   const die: IDie = {
      id: generateId(),
      type,
      value: null,
   }
   dice.value.push(die)
}

function removeDie(id: string): void {
   const index = dice.value.findIndex(d => d.id === id)
   if (index !== -1) {
      dice.value.splice(index, 1)
   }
}

function clearDice(): void {
   dice.value = []
}

function rollDice(): void {
   if (dice.value.length === 0) return

   isRolling.value = true

   let iterations = 0
   const maxIterations = 10
   const interval = setInterval(() => {
      for (const die of dice.value) {
         die.value = Math.floor(Math.random() * die.type) + 1
      }
      iterations++

      if (iterations >= maxIterations) {
         clearInterval(interval)
         isRolling.value = false
      }
   }, 80)
}

function getDieLabel(type: number): string {
   return `D${type}`
}
</script>

<template>
   <div class="dice-page">
      <header class="dice-page__header">
         <NuxtLink to="/" class="dice-page__back">
            <span>←</span>
         </NuxtLink>
         <h1 class="heading">{{ t('dice.title') }}</h1>
         <button v-if="dice.length > 0" class="dice-page__clear" @click="clearDice">
            {{ t('common.clear') }}
         </button>
      </header>

      <div class="dice-page__content">
         <section class="dice-catalog">
            <h2 class="dice-catalog__title">{{ t('dice.addDice') }}</h2>
            <div class="dice-catalog__grid">
               <button
                  v-for="type in DICE_TYPES"
                  :key="type"
                  class="dice-catalog__btn card-game"
                  @click="addDie(type)"
               >
                  {{ getDieLabel(type) }}
               </button>
            </div>
         </section>

         <section v-if="dice.length > 0" class="dice-tray">
            <h2 class="dice-tray__title">{{ t('dice.yourDice') }}</h2>
            <div class="dice-tray__grid">
               <div
                  v-for="die in dice"
                  :key="die.id"
                  class="die-card card-game"
                  :class="{ 'die-card--rolling': isRolling }"
               >
                  <span class="die-card__type">{{ getDieLabel(die.type) }}</span>
                  <span class="die-card__value score">{{ die.value ?? '?' }}</span>
                  <button class="die-card__remove" @click="removeDie(die.id)">×</button>
               </div>
            </div>

            <div class="dice-tray__total">
               <span class="dice-tray__total-label">{{ t('dice.total') }}</span>
               <span class="dice-tray__total-value score">{{ totalResult }}</span>
            </div>

            <button class="btn-primary dice-tray__roll-btn" :disabled="isRolling" @click="rollDice">
               {{ isRolling ? t('dice.rolling') : t('dice.roll') }}
            </button>
         </section>

         <p v-else class="dice-page__empty">{{ t('dice.selectDice') }}</p>
      </div>
   </div>
</template>

<style scoped>
.dice-page {
   min-height: 100dvh;
   display: flex;
   flex-direction: column;
}

.dice-page__header {
   display: flex;
   align-items: center;
   gap: var(--gap-md);
   padding: var(--gap-md);
   background: var(--bg-secondary);
}

.dice-page__back {
   font-size: var(--text-lg);
   color: var(--text-primary);
   padding: var(--gap-xs);
}

.dice-page__header .heading {
   flex: 1;
   font-size: var(--text-lg);
}

.dice-page__clear {
   font-size: var(--text-sm);
   color: var(--error);
   padding: var(--gap-xs) var(--gap-md);
}

.dice-page__content {
   flex: 1;
   padding: var(--gap-md);
   display: flex;
   flex-direction: column;
   gap: var(--gap-lg);
}

.dice-catalog__title,
.dice-tray__title {
   font-size: var(--text-sm);
   color: var(--text-secondary);
   text-transform: uppercase;
   letter-spacing: 0.05em;
   margin-bottom: var(--gap-sm);
}

.dice-catalog__grid {
   display: grid;
   grid-template-columns: repeat(4, 1fr);
   gap: var(--gap-sm);
}

.dice-catalog__btn {
   display: flex;
   align-items: center;
   justify-content: center;
   font-family: var(--font-display);
   font-size: var(--text-base);
   font-weight: 600;
   color: var(--accent-primary);
   padding: var(--gap-md);
}

.dice-tray__grid {
   display: grid;
   grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
   gap: var(--gap-sm);
}

.die-card {
   display: flex;
   flex-direction: column;
   align-items: center;
   gap: var(--gap-xs);
   position: relative;
}

.die-card--rolling .die-card__value {
   animation: shake 0.1s infinite;
}

.die-card__type {
   font-size: var(--text-xs);
   color: var(--text-secondary);
   text-transform: uppercase;
}

.die-card__value {
   font-size: var(--text-xl);
}

.die-card__remove {
   position: absolute;
   top: var(--gap-xs);
   right: var(--gap-xs);
   font-size: var(--text-sm);
   color: var(--text-secondary);
   padding: 2px 6px;
}

.die-card__remove:hover {
   color: var(--error);
}

.dice-tray__total {
   display: flex;
   align-items: center;
   justify-content: space-between;
   padding: var(--gap-md);
   background: var(--surface);
   border-radius: var(--radius-md);
   margin-top: var(--gap-md);
}

.dice-tray__total-label {
   font-size: var(--text-base);
   color: var(--text-secondary);
}

.dice-tray__total-value {
   font-size: var(--text-xl);
}

.dice-tray__roll-btn {
   width: 100%;
   justify-content: center;
   margin-top: var(--gap-md);
}

.dice-page__empty {
   flex: 1;
   display: flex;
   align-items: center;
   justify-content: center;
   color: var(--text-secondary);
   font-size: var(--text-lg);
}

@keyframes shake {
   0%,
   100% {
      transform: translateX(0);
   }
   25% {
      transform: translateX(-2px);
   }
   75% {
      transform: translateX(2px);
   }
}
</style>
