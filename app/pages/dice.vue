<script setup lang="ts">
import type { IDie, ICustomDie, ICustomDieFace, IDicePreset } from '~/types'

const { t } = useI18n()

const DICE_TYPES = [3, 4, 6, 8, 10, 12, 20, 100]
const FACE_COLORS = ['#818cf8', '#f472b6', '#34d399', '#fbbf24', '#f87171', '#60a5fa', '#a78bfa', '#fb923c']
const FACE_EMOJIS = [
   '1', '2', '3', '4', '5', '6',
   '+', '-', '?', '!', 'X', 'O',
   '★', '●', '◆', '▲', '■', '♠', '♥', '♦', '♣'
]

type ViewMode = 'roll' | 'presets' | 'createCustom' | 'createPreset'

const viewMode = ref<ViewMode>('roll')

const dice = ref<IDie[]>([])
const customDiceInTray = ref<ICustomDie[]>([])
const isRolling = ref(false)

const { data: customDice } = useLocalStorage<ICustomDie[]>('gamepal-custom-dice', [])
const { data: presets } = useLocalStorage<IDicePreset[]>('gamepal-dice-presets', [])

const newCustomDie = ref<{ name: string; faces: ICustomDieFace[] }>({
   name: '',
   faces: [
      { value: '', color: null },
      { value: '', color: null },
   ],
})

const newPreset = ref<{ name: string; standardDice: { type: number; count: number }[]; customDiceIds: string[] }>({
   name: '',
   standardDice: [],
   customDiceIds: [],
})

const editingPresetId = ref<string | null>(null)

const totalResult = computed((): number => {
   const standardTotal = dice.value.reduce((sum, die) => sum + (die.value ?? 0), 0)
   return standardTotal
})

const hasDiceInTray = computed((): boolean => {
   return dice.value.length > 0 || customDiceInTray.value.length > 0
})

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

function addCustomDieToTray(customDie: ICustomDie): void {
   const dieCopy: ICustomDie = {
      id: generateId(),
      name: customDie.name,
      faces: [...customDie.faces],
      currentFaceIndex: null,
   }
   customDiceInTray.value.push(dieCopy)
}

function removeCustomDieFromTray(id: string): void {
   const index = customDiceInTray.value.findIndex(d => d.id === id)
   if (index !== -1) {
      customDiceInTray.value.splice(index, 1)
   }
}

function clearTray(): void {
   dice.value = []
   customDiceInTray.value = []
}

function rollDice(): void {
   if (!hasDiceInTray.value) return

   isRolling.value = true

   let iterations = 0
   const maxIterations = 10
   const interval = setInterval(() => {
      for (const die of dice.value) {
         die.value = Math.floor(Math.random() * die.type) + 1
      }
      for (const customDie of customDiceInTray.value) {
         customDie.currentFaceIndex = Math.floor(Math.random() * customDie.faces.length)
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

function addFaceToCustomDie(): void {
   newCustomDie.value.faces.push({ value: '', color: null })
}

function removeFaceFromCustomDie(index: number): void {
   if (newCustomDie.value.faces.length > 2) {
      newCustomDie.value.faces.splice(index, 1)
   }
}

function setFaceColor(index: number, color: string | null): void {
   newCustomDie.value.faces[index].color = color
}

function setFaceEmoji(index: number, emoji: string): void {
   newCustomDie.value.faces[index].value = emoji
}

function saveCustomDie(): void {
   const name = newCustomDie.value.name.trim()
   if (name === '') return
   if (newCustomDie.value.faces.some(f => f.value.trim() === '')) return

   const die: ICustomDie = {
      id: generateId(),
      name,
      faces: newCustomDie.value.faces.map(f => ({ value: f.value.trim(), color: f.color })),
      currentFaceIndex: null,
   }
   customDice.value.push(die)
   resetCustomDieForm()
   viewMode.value = 'roll'
}

function deleteCustomDie(id: string): void {
   const index = customDice.value.findIndex(d => d.id === id)
   if (index !== -1) {
      customDice.value.splice(index, 1)
   }
}

function resetCustomDieForm(): void {
   newCustomDie.value = {
      name: '',
      faces: [
         { value: '', color: null },
         { value: '', color: null },
      ],
   }
}

function toggleStandardDieInPreset(type: number): void {
   const existing = newPreset.value.standardDice.find(d => d.type === type)
   if (existing) {
      existing.count++
   } else {
      newPreset.value.standardDice.push({ type, count: 1 })
   }
}

function removeStandardDieFromPreset(type: number): void {
   const index = newPreset.value.standardDice.findIndex(d => d.type === type)
   if (index !== -1) {
      const item = newPreset.value.standardDice[index]
      if (item.count > 1) {
         item.count--
      } else {
         newPreset.value.standardDice.splice(index, 1)
      }
   }
}

function toggleCustomDieInPreset(id: string): void {
   const index = newPreset.value.customDiceIds.indexOf(id)
   if (index !== -1) {
      newPreset.value.customDiceIds.splice(index, 1)
   } else {
      newPreset.value.customDiceIds.push(id)
   }
}

function getStandardDieCountInPreset(type: number): number {
   const item = newPreset.value.standardDice.find(d => d.type === type)
   return item?.count ?? 0
}

function isCustomDieInPreset(id: string): boolean {
   return newPreset.value.customDiceIds.includes(id)
}

function savePreset(): void {
   const name = newPreset.value.name.trim()
   if (name === '') return
   if (newPreset.value.standardDice.length === 0 && newPreset.value.customDiceIds.length === 0) return

   if (editingPresetId.value) {
      const preset = presets.value.find(p => p.id === editingPresetId.value)
      if (preset) {
         preset.name = name
         preset.standardDice = [...newPreset.value.standardDice]
         preset.customDice = newPreset.value.customDiceIds
            .map(id => customDice.value.find(d => d.id === id))
            .filter((d): d is ICustomDie => d !== undefined)
      }
   } else {
      const preset: IDicePreset = {
         id: generateId(),
         name,
         standardDice: [...newPreset.value.standardDice],
         customDice: newPreset.value.customDiceIds
            .map(id => customDice.value.find(d => d.id === id))
            .filter((d): d is ICustomDie => d !== undefined),
      }
      presets.value.push(preset)
   }

   resetPresetForm()
   viewMode.value = 'presets'
}

function editPreset(preset: IDicePreset): void {
   editingPresetId.value = preset.id
   newPreset.value = {
      name: preset.name,
      standardDice: [...preset.standardDice],
      customDiceIds: preset.customDice.map(d => d.id),
   }
   viewMode.value = 'createPreset'
}

function deletePreset(id: string): void {
   const index = presets.value.findIndex(p => p.id === id)
   if (index !== -1) {
      presets.value.splice(index, 1)
   }
}

function loadPreset(preset: IDicePreset): void {
   clearTray()

   for (const item of preset.standardDice) {
      for (let i = 0; i < item.count; i++) {
         addDie(item.type)
      }
   }

   for (const customDie of preset.customDice) {
      addCustomDieToTray(customDie)
   }

   viewMode.value = 'roll'
}

function resetPresetForm(): void {
   editingPresetId.value = null
   newPreset.value = {
      name: '',
      standardDice: [],
      customDiceIds: [],
   }
}

function startCreateCustomDie(): void {
   resetCustomDieForm()
   viewMode.value = 'createCustom'
}

function startCreatePreset(): void {
   resetPresetForm()
   viewMode.value = 'createPreset'
}

function cancelForm(): void {
   viewMode.value = 'roll'
   resetCustomDieForm()
   resetPresetForm()
}
</script>

<template>
   <div class="dice-page">
      <header class="dice-page__header">
         <NuxtLink to="/" class="dice-page__back">
            <span>←</span>
         </NuxtLink>
         <h1 class="heading">{{ t('dice.title') }}</h1>
         <div class="dice-page__actions">
            <button
               v-if="viewMode === 'roll' && hasDiceInTray"
               class="dice-page__clear"
               @click="clearTray"
            >
               {{ t('common.clear') }}
            </button>
            <button
               v-if="viewMode !== 'roll'"
               class="dice-page__cancel"
               @click="cancelForm"
            >
               {{ t('common.cancel') }}
            </button>
         </div>
      </header>

      <div v-if="viewMode === 'roll'" class="dice-page__content">
         <div class="dice-page__tabs">
            <button
               class="tab-btn tab-btn--active"
               @click="viewMode = 'roll'"
            >
               {{ t('dice.roll') }}
            </button>
            <button
               class="tab-btn"
               @click="viewMode = 'presets'"
            >
               {{ t('dice.presets') }}
            </button>
         </div>

         <section class="dice-catalog">
            <h2 class="dice-catalog__title">{{ t('dice.standardDice') }}</h2>
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

         <section v-if="customDice.length > 0" class="dice-catalog">
            <div class="dice-catalog__header">
               <h2 class="dice-catalog__title">{{ t('dice.customDice') }}</h2>
               <button class="dice-catalog__add" @click="startCreateCustomDie">+</button>
            </div>
            <div class="dice-catalog__grid">
               <div
                  v-for="die in customDice"
                  :key="die.id"
                  class="custom-die-card card-game"
               >
                  <button class="custom-die-card__add" @click="addCustomDieToTray(die)">
                     <span class="custom-die-card__name">{{ die.name }}</span>
                     <span class="custom-die-card__faces">{{ die.faces.length }} {{ t('dice.faces') }}</span>
                  </button>
                  <button class="custom-die-card__delete" @click="deleteCustomDie(die.id)">×</button>
               </div>
            </div>
         </section>

         <section v-else class="dice-catalog">
            <div class="dice-catalog__header">
               <h2 class="dice-catalog__title">{{ t('dice.customDice') }}</h2>
            </div>
            <button class="create-btn" @click="startCreateCustomDie">
               {{ t('dice.createCustomDie') }}
            </button>
         </section>

         <section v-if="hasDiceInTray" class="dice-tray">
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

               <div
                  v-for="die in customDiceInTray"
                  :key="die.id"
                  class="die-card die-card--custom card-game"
                  :class="{ 'die-card--rolling': isRolling }"
               >
                  <span class="die-card__type">{{ die.name }}</span>
                  <span
                     class="die-card__value die-card__value--custom"
                     :style="{
                        backgroundColor: die.currentFaceIndex !== null
                           ? die.faces[die.currentFaceIndex].color || 'var(--accent-primary)'
                           : 'transparent'
                     }"
                  >
                     {{ die.currentFaceIndex !== null ? die.faces[die.currentFaceIndex].value : '?' }}
                  </span>
                  <button class="die-card__remove" @click="removeCustomDieFromTray(die.id)">×</button>
               </div>
            </div>

            <div v-if="dice.length > 0" class="dice-tray__total">
               <span class="dice-tray__total-label">{{ t('dice.total') }}</span>
               <span class="dice-tray__total-value score">{{ totalResult }}</span>
            </div>

            <button class="btn-primary dice-tray__roll-btn" :disabled="isRolling" @click="rollDice">
               {{ isRolling ? t('dice.rolling') : t('dice.roll') }}
            </button>
         </section>

         <p v-else class="dice-page__empty">{{ t('dice.selectDice') }}</p>
      </div>

      <div v-else-if="viewMode === 'presets'" class="dice-page__content">
         <div class="dice-page__tabs">
            <button
               class="tab-btn"
               @click="viewMode = 'roll'"
            >
               {{ t('dice.roll') }}
            </button>
            <button
               class="tab-btn tab-btn--active"
               @click="viewMode = 'presets'"
            >
               {{ t('dice.presets') }}
            </button>
         </div>

         <section class="presets-section">
            <div class="presets-section__header">
               <h2 class="presets-section__title">{{ t('dice.yourPresets') }}</h2>
               <button class="presets-section__add" @click="startCreatePreset">+</button>
            </div>

            <div v-if="presets.length > 0" class="presets-list">
               <div v-for="preset in presets" :key="preset.id" class="preset-card card-game">
                  <div class="preset-card__info">
                     <span class="preset-card__name">{{ preset.name }}</span>
                     <span class="preset-card__content">
                        <span v-for="item in preset.standardDice" :key="item.type" class="preset-card__die">
                           {{ item.count }}x D{{ item.type }}
                        </span>
                        <span v-for="die in preset.customDice" :key="die.id" class="preset-card__die preset-card__die--custom">
                           {{ die.name }}
                        </span>
                     </span>
                  </div>
                  <div class="preset-card__actions">
                     <button class="preset-card__load" @click="loadPreset(preset)">
                        {{ t('dice.load') }}
                     </button>
                     <button class="preset-card__edit" @click="editPreset(preset)">
                        {{ t('dice.edit') }}
                     </button>
                     <button class="preset-card__delete" @click="deletePreset(preset.id)">×</button>
                  </div>
               </div>
            </div>

            <div v-else class="presets-section__empty">
               <p>{{ t('dice.noPresets') }}</p>
               <button class="create-btn" @click="startCreatePreset">
                  {{ t('dice.createPreset') }}
               </button>
            </div>
         </section>
      </div>

      <div v-else-if="viewMode === 'createCustom'" class="dice-page__content">
         <section class="create-form">
            <h2 class="create-form__title">{{ t('dice.createCustomDie') }}</h2>

            <div class="form-group">
               <label class="form-label">{{ t('dice.dieName') }}</label>
               <input
                  v-model="newCustomDie.name"
                  type="text"
                  class="form-input"
                  :placeholder="t('dice.dieNamePlaceholder')"
               />
            </div>

            <div class="form-group">
               <label class="form-label">{{ t('dice.faces') }} ({{ newCustomDie.faces.length }})</label>
               <div class="faces-list">
                  <div v-for="(face, index) in newCustomDie.faces" :key="index" class="face-item">
                     <div class="face-item__main">
                        <input
                           v-model="face.value"
                           type="text"
                           class="form-input face-item__input"
                           :placeholder="t('dice.faceValue')"
                        />
                        <button
                           v-if="newCustomDie.faces.length > 2"
                           class="face-item__remove"
                           @click="removeFaceFromCustomDie(index)"
                        >
                           ×
                        </button>
                     </div>
                     <div class="face-item__emojis">
                        <button
                           v-for="emoji in FACE_EMOJIS"
                           :key="emoji"
                           class="face-item__emoji"
                           :class="{ 'face-item__emoji--active': face.value === emoji }"
                           @click="setFaceEmoji(index, emoji)"
                        >
                           {{ emoji }}
                        </button>
                     </div>
                     <div class="face-item__colors">
                        <button
                           v-for="color in FACE_COLORS"
                           :key="color"
                           class="face-item__color"
                           :class="{ 'face-item__color--active': face.color === color }"
                           :style="{ backgroundColor: color }"
                           @click="setFaceColor(index, face.color === color ? null : color)"
                        ></button>
                     </div>
                  </div>
               </div>
               <button class="add-face-btn" @click="addFaceToCustomDie">
                  {{ t('dice.addFace') }}
               </button>
            </div>

            <button
               class="btn-primary create-form__save"
               :disabled="!newCustomDie.name.trim() || newCustomDie.faces.some(f => !f.value.trim())"
               @click="saveCustomDie"
            >
               {{ t('common.save') }}
            </button>
         </section>
      </div>

      <div v-else-if="viewMode === 'createPreset'" class="dice-page__content">
         <section class="create-form">
            <h2 class="create-form__title">
               {{ editingPresetId ? t('dice.editPreset') : t('dice.createPreset') }}
            </h2>

            <div class="form-group">
               <label class="form-label">{{ t('dice.presetName') }}</label>
               <input
                  v-model="newPreset.name"
                  type="text"
                  class="form-input"
                  :placeholder="t('dice.presetNamePlaceholder')"
               />
            </div>

            <div class="form-group">
               <label class="form-label">{{ t('dice.standardDice') }}</label>
               <div class="preset-dice-grid">
                  <div v-for="type in DICE_TYPES" :key="type" class="preset-die-item">
                     <button class="preset-die-item__btn" @click="toggleStandardDieInPreset(type)">
                        D{{ type }}
                     </button>
                     <div v-if="getStandardDieCountInPreset(type) > 0" class="preset-die-item__count">
                        <span>{{ getStandardDieCountInPreset(type) }}</span>
                        <button class="preset-die-item__remove" @click="removeStandardDieFromPreset(type)">-</button>
                     </div>
                  </div>
               </div>
            </div>

            <div v-if="customDice.length > 0" class="form-group">
               <label class="form-label">{{ t('dice.customDice') }}</label>
               <div class="preset-custom-grid">
                  <button
                     v-for="die in customDice"
                     :key="die.id"
                     class="preset-custom-item"
                     :class="{ 'preset-custom-item--active': isCustomDieInPreset(die.id) }"
                     @click="toggleCustomDieInPreset(die.id)"
                  >
                     {{ die.name }}
                  </button>
               </div>
            </div>

            <button
               class="btn-primary create-form__save"
               :disabled="!newPreset.name.trim() || (newPreset.standardDice.length === 0 && newPreset.customDiceIds.length === 0)"
               @click="savePreset"
            >
               {{ t('common.save') }}
            </button>
         </section>
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

.dice-page__actions {
   display: flex;
   gap: var(--gap-sm);
}

.dice-page__clear,
.dice-page__cancel {
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
   overflow-y: auto;
}

.dice-page__tabs {
   display: flex;
   gap: var(--gap-xs);
   background: var(--surface);
   padding: var(--gap-xs);
   border-radius: var(--radius-sm);
}

.tab-btn {
   flex: 1;
   padding: var(--gap-sm);
   border-radius: var(--radius-xs);
   font-size: var(--text-sm);
   color: var(--text-secondary);
   transition: all var(--transition-fast);
}

.tab-btn--active {
   background: var(--accent-primary);
   color: #ffffff;
}

.dice-catalog__header,
.presets-section__header {
   display: flex;
   align-items: center;
   justify-content: space-between;
   margin-bottom: var(--gap-sm);
}

.dice-catalog__title,
.dice-tray__title,
.presets-section__title {
   font-size: var(--text-sm);
   color: var(--text-secondary);
   text-transform: uppercase;
   letter-spacing: 0.05em;
}

.dice-catalog__add,
.presets-section__add {
   width: 28px;
   height: 28px;
   border-radius: 50%;
   background: var(--accent-primary);
   color: #ffffff;
   font-size: var(--text-lg);
   display: flex;
   align-items: center;
   justify-content: center;
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

.custom-die-card {
   display: flex;
   align-items: center;
   position: relative;
   padding: var(--gap-sm);
}

.custom-die-card__add {
   flex: 1;
   display: flex;
   flex-direction: column;
   align-items: flex-start;
   gap: 2px;
}

.custom-die-card__name {
   font-weight: 500;
   color: var(--text-primary);
}

.custom-die-card__faces {
   font-size: var(--text-xs);
   color: var(--text-secondary);
}

.custom-die-card__delete {
   font-size: var(--text-lg);
   color: var(--text-secondary);
   padding: var(--gap-xs);
}

.custom-die-card__delete:hover {
   color: var(--error);
}

.create-btn {
   width: 100%;
   padding: var(--gap-md);
   border: 2px dashed var(--text-secondary);
   border-radius: var(--radius-md);
   color: var(--text-secondary);
   font-size: var(--text-sm);
   transition: all var(--transition-fast);
}

.create-btn:hover {
   border-color: var(--accent-primary);
   color: var(--accent-primary);
}

.dice-tray__title {
   margin-bottom: var(--gap-sm);
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

.die-card__value--custom {
   font-size: var(--text-base);
   padding: var(--gap-xs) var(--gap-sm);
   border-radius: var(--radius-sm);
   color: #ffffff;
   min-width: 40px;
   text-align: center;
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

.presets-list {
   display: flex;
   flex-direction: column;
   gap: var(--gap-sm);
}

.preset-card {
   display: flex;
   flex-direction: column;
   gap: var(--gap-sm);
}

.preset-card__info {
   display: flex;
   flex-direction: column;
   gap: 4px;
}

.preset-card__name {
   font-weight: 600;
   color: var(--text-primary);
}

.preset-card__content {
   display: flex;
   flex-wrap: wrap;
   gap: var(--gap-xs);
}

.preset-card__die {
   font-size: var(--text-xs);
   padding: 2px 8px;
   background: var(--surface);
   border-radius: var(--radius-xs);
   color: var(--text-secondary);
}

.preset-card__die--custom {
   background: var(--accent-primary);
   color: #ffffff;
}

.preset-card__actions {
   display: flex;
   gap: var(--gap-sm);
   padding-top: var(--gap-sm);
   border-top: var(--border);
}

.preset-card__load {
   flex: 1;
   padding: var(--gap-xs) var(--gap-sm);
   background: var(--accent-primary);
   color: #ffffff;
   border-radius: var(--radius-sm);
   font-size: var(--text-sm);
}

.preset-card__edit {
   padding: var(--gap-xs) var(--gap-sm);
   border: var(--border);
   border-radius: var(--radius-sm);
   font-size: var(--text-sm);
   color: var(--text-secondary);
}

.preset-card__delete {
   padding: var(--gap-xs) var(--gap-sm);
   font-size: var(--text-lg);
   color: var(--text-secondary);
}

.preset-card__delete:hover {
   color: var(--error);
}

.presets-section__empty {
   text-align: center;
   padding: var(--gap-lg);
   color: var(--text-secondary);
}

.presets-section__empty p {
   margin-bottom: var(--gap-md);
}

.create-form {
   display: flex;
   flex-direction: column;
   gap: var(--gap-lg);
}

.create-form__title {
   font-size: var(--text-lg);
   color: var(--text-primary);
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
}

.form-input:focus {
   outline: 2px solid var(--accent-primary);
   outline-offset: 2px;
}

.faces-list {
   display: flex;
   flex-direction: column;
   gap: var(--gap-sm);
}

.face-item {
   display: flex;
   flex-direction: column;
   gap: var(--gap-sm);
   padding: var(--gap-sm);
   background: var(--surface);
   border-radius: var(--radius-sm);
}

.face-item__main {
   display: flex;
   align-items: center;
   gap: var(--gap-sm);
}

.face-item__input {
   flex: 1;
   min-width: 0;
   font-size: var(--text-lg);
   text-align: center;
}

.face-item__emojis {
   display: flex;
   flex-wrap: wrap;
   gap: 4px;
}

.face-item__emoji {
   width: 32px;
   height: 32px;
   border-radius: var(--radius-xs);
   background: var(--bg-secondary);
   font-size: var(--text-base);
   display: flex;
   align-items: center;
   justify-content: center;
   transition: all var(--transition-fast);
}

.face-item__emoji:hover {
   background: var(--accent-primary);
   color: #ffffff;
}

.face-item__emoji--active {
   background: var(--accent-primary);
   color: #ffffff;
}

.face-item__colors {
   display: flex;
   flex-wrap: wrap;
   gap: 4px;
}

.face-item__color {
   width: 24px;
   height: 24px;
   border-radius: 50%;
   border: 2px solid transparent;
   transition: all var(--transition-fast);
}

.face-item__color--active {
   border-color: #ffffff;
   transform: scale(1.1);
}

.face-item__remove {
   font-size: var(--text-lg);
   color: var(--text-secondary);
   padding: var(--gap-xs);
}

.face-item__remove:hover {
   color: var(--error);
}

.add-face-btn {
   padding: var(--gap-sm);
   border: 2px dashed var(--text-secondary);
   border-radius: var(--radius-sm);
   color: var(--text-secondary);
   font-size: var(--text-sm);
   transition: all var(--transition-fast);
}

.add-face-btn:hover {
   border-color: var(--accent-primary);
   color: var(--accent-primary);
}

.create-form__save {
   margin-top: auto;
}

.preset-dice-grid {
   display: grid;
   grid-template-columns: repeat(4, 1fr);
   gap: var(--gap-sm);
}

.preset-die-item {
   display: flex;
   flex-direction: column;
   align-items: center;
   gap: var(--gap-xs);
}

.preset-die-item__btn {
   width: 100%;
   padding: var(--gap-sm);
   background: var(--surface);
   border-radius: var(--radius-sm);
   font-family: var(--font-display);
   font-weight: 600;
   color: var(--accent-primary);
   transition: all var(--transition-fast);
}

.preset-die-item__btn:hover {
   background: var(--accent-primary);
   color: #ffffff;
}

.preset-die-item__count {
   display: flex;
   align-items: center;
   gap: var(--gap-xs);
   font-size: var(--text-sm);
   color: var(--text-primary);
}

.preset-die-item__remove {
   width: 20px;
   height: 20px;
   border-radius: 50%;
   background: var(--error);
   color: #ffffff;
   font-size: var(--text-sm);
   display: flex;
   align-items: center;
   justify-content: center;
}

.preset-custom-grid {
   display: flex;
   flex-wrap: wrap;
   gap: var(--gap-sm);
}

.preset-custom-item {
   padding: var(--gap-sm) var(--gap-md);
   background: var(--surface);
   border-radius: var(--radius-sm);
   font-size: var(--text-sm);
   color: var(--text-secondary);
   border: 2px solid transparent;
   transition: all var(--transition-fast);
}

.preset-custom-item--active {
   background: var(--accent-primary);
   color: #ffffff;
   border-color: var(--accent-primary);
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
