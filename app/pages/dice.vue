<script setup lang="ts">
import { ArrowLeft, Plus, X, Dices, Package, Pencil, Trash2, Play, Lock, Unlock, Download, QrCode } from 'lucide-vue-next'
import { useDrag } from '@vueuse/gesture'
import QRCode from 'qrcode'
import type { IDie, ICustomDie, ICustomDieFace, IDicePreset } from '~/types'

const { t } = useI18n()

const DICE_TYPES = [3, 4, 6, 8, 10, 12, 20, 100]
const FACE_COLORS = ['#818cf8', '#f472b6', '#34d399', '#fbbf24', '#f87171', '#60a5fa', '#a78bfa', '#fb923c']
const FACE_EMOJIS = [
   '1', '2', '3', '4', '5', '6',
   '+', '-', '?', '!', 'X', 'O',
   '*', '@', '#', '%', '&', '$'
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

const showExportModal = ref(false)
const exportingDie = ref<ICustomDie | null>(null)
const qrCodeDataUrl = ref<string | null>(null)

const diceTrayRef = ref<HTMLElement | null>(null)

const SHAKE_THRESHOLD = 15
const SHAKE_TIMEOUT = 1000
let lastShakeTime = 0

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
      isLocked: false,
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
      isLocked: false,
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
         if (!die.isLocked) {
            die.value = Math.floor(Math.random() * die.type) + 1
         }
      }
      for (const customDie of customDiceInTray.value) {
         if (!customDie.isLocked) {
            customDie.currentFaceIndex = Math.floor(Math.random() * customDie.faces.length)
         }
      }
      iterations++

      if (iterations >= maxIterations) {
         clearInterval(interval)
         isRolling.value = false
      }
   }, 80)
}

function toggleDieLock(id: string): void {
   const die = dice.value.find(d => d.id === id)
   if (die) {
      die.isLocked = !die.isLocked
   }
}

function toggleCustomDieLock(id: string): void {
   const die = customDiceInTray.value.find(d => d.id === id)
   if (die) {
      die.isLocked = !die.isLocked
   }
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
   const face = newCustomDie.value.faces[index]
   if (face) {
      face.color = color
   }
}

function setFaceEmoji(index: number, emoji: string): void {
   const face = newCustomDie.value.faces[index]
   if (face) {
      face.value = emoji
   }
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
      isLocked: false,
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

async function exportCustomDie(die: ICustomDie): Promise<void> {
   exportingDie.value = die
   const exportData = {
      name: die.name,
      faces: die.faces,
   }
   try {
      qrCodeDataUrl.value = await QRCode.toDataURL(JSON.stringify(exportData), {
         width: 256,
         margin: 2,
         color: { dark: '#000000', light: '#ffffff' },
      })
      showExportModal.value = true
   } catch (error) {
      console.log('Erreur lors de la generation du QR code')
   }
}

function downloadJson(die: ICustomDie): void {
   const exportData = {
      name: die.name,
      faces: die.faces,
   }
   const json = JSON.stringify(exportData, null, 2)
   const blob = new Blob([json], { type: 'application/json' })
   const url = URL.createObjectURL(blob)
   const a = document.createElement('a')
   a.href = url
   a.download = `${die.name.toLowerCase().replace(/\s+/g, '-')}.json`
   a.click()
   URL.revokeObjectURL(url)
}

function closeExportModal(): void {
   showExportModal.value = false
   exportingDie.value = null
   qrCodeDataUrl.value = null
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
      if (!item) return
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

function handleDeviceMotion(event: DeviceMotionEvent): void {
   const acceleration = event.accelerationIncludingGravity
   if (!acceleration) return

   const x = acceleration.x ?? 0
   const y = acceleration.y ?? 0
   const z = acceleration.z ?? 0

   const totalAcceleration = Math.sqrt(x * x + y * y + z * z)

   if (totalAcceleration > SHAKE_THRESHOLD) {
      const now = Date.now()
      if (now - lastShakeTime > SHAKE_TIMEOUT) {
         lastShakeTime = now
         if (hasDiceInTray.value && !isRolling.value && viewMode.value === 'roll') {
            rollDice()
         }
      }
   }
}

useDrag(
   ({ movement: [_x, y], dragging }) => {
      if (!dragging && y < -50 && hasDiceInTray.value && !isRolling.value) {
         rollDice()
      }
   },
   { domTarget: diceTrayRef }
)

onMounted(() => {
   if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', handleDeviceMotion)
   }
})

onUnmounted(() => {
   if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      window.removeEventListener('devicemotion', handleDeviceMotion)
   }
})
</script>

<template>
   <div class="min-h-dvh bg-background">
      <header class="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border">
         <div class="flex items-center gap-4 px-4 py-4">
            <NuxtLink
               to="/"
               class="dice-page__back flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
               v-motion
               :initial="{ opacity: 0, x: -10 }"
               :enter="{ opacity: 1, x: 0 }"
            >
               <ArrowLeft class="h-5 w-5" />
            </NuxtLink>
            <h1
               class="heading flex-1 font-display text-lg font-bold tracking-tight"
               v-motion
               :initial="{ opacity: 0, y: -10 }"
               :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
            >
               {{ t('dice.title') }}
            </h1>
            <div class="flex gap-2">
               <UiButton
                  v-if="viewMode === 'roll' && hasDiceInTray"
                  variant="ghost"
                  size="sm"
                  class="dice-page__clear text-destructive hover:text-destructive"
                  @click="clearTray"
               >
                  {{ t('common.clear') }}
               </UiButton>
               <UiButton
                  v-if="viewMode !== 'roll'"
                  variant="ghost"
                  size="sm"
                  class="dice-page__cancel"
                  @click="cancelForm"
               >
                  {{ t('common.cancel') }}
               </UiButton>
            </div>
         </div>
      </header>

      <div v-if="viewMode === 'roll'" class="p-4 space-y-6">
         <UiTabs
            :tabs="[
               { value: 'roll', label: t('dice.roll'), icon: Dices },
               { value: 'presets', label: t('dice.presets'), icon: Package },
            ]"
            model-value="roll"
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 150 } }"
            @update:model-value="viewMode = $event as ViewMode"
         />

         <section
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
         >
            <h2 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
               {{ t('dice.standardDice') }}
            </h2>
            <div class="grid grid-cols-4 gap-2">
               <UiCard
                  v-for="type in DICE_TYPES"
                  :key="type"
                  hoverable
                  class="dice-type-card p-3 cursor-pointer text-center"
                  @click="addDie(type)"
               >
                  <span class="font-display text-base font-semibold text-primary">{{ getDieLabel(type) }}</span>
               </UiCard>
            </div>
         </section>

         <section
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 250 } }"
         >
            <div class="flex items-center justify-between mb-3">
               <h2 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {{ t('dice.customDice') }}
               </h2>
               <UiIconButton
                  v-if="customDice.length > 0"
                  size="sm"
                  class="custom-dice-add"
                  @click="startCreateCustomDie"
               >
                  <Plus class="h-4 w-4" />
               </UiIconButton>
            </div>

            <template v-if="customDice.length > 0">
               <div class="grid grid-cols-2 gap-2">
                  <UiCard
                     v-for="die in customDice"
                     :key="die.id"
                     hoverable
                     class="custom-die-card p-3 cursor-pointer"
                  >
                     <div class="flex items-center gap-2">
                        <button class="flex-1 text-left" @click="addCustomDieToTray(die)">
                           <p class="font-medium text-foreground">{{ die.name }}</p>
                           <p class="text-xs text-muted-foreground">{{ die.faces.length }} {{ t('dice.faces') }}</p>
                        </button>
                        <button
                           class="custom-die-card__export p-1 text-muted-foreground hover:text-primary transition-colors"
                           @click.stop="exportCustomDie(die)"
                        >
                           <QrCode class="h-4 w-4" />
                        </button>
                        <button
                           class="custom-die-card__delete p-1 text-muted-foreground hover:text-destructive transition-colors"
                           @click.stop="deleteCustomDie(die.id)"
                        >
                           <X class="h-4 w-4" />
                        </button>
                     </div>
                  </UiCard>
               </div>
            </template>

            <template v-else>
               <button
                  class="create-custom-btn w-full p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg text-muted-foreground text-sm hover:border-primary hover:text-primary transition-colors"
                  @click="startCreateCustomDie"
               >
                  {{ t('dice.createCustomDie') }}
               </button>
            </template>
         </section>

         <section
            v-if="hasDiceInTray"
            ref="diceTrayRef"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
         >
            <div class="flex items-center justify-between mb-3">
               <h2 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {{ t('dice.yourDice') }}
               </h2>
               <span class="text-xs text-muted-foreground">{{ t('dice.swipeToRoll') }}</span>
            </div>

            <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
               <UiCard
                  v-for="die in dice"
                  :key="die.id"
                  class="die-in-tray relative p-3 text-center"
                  :class="{ 'animate-shake': isRolling && !die.isLocked, 'ring-2 ring-primary': die.isLocked }"
               >
                  <span class="text-xs text-muted-foreground uppercase">{{ getDieLabel(die.type) }}</span>
                  <span class="die-value block font-display text-2xl font-bold text-accent mt-1">
                     {{ die.value ?? '?' }}
                  </span>
                  <button
                     class="die-lock absolute top-1 left-1 p-1 transition-colors"
                     :class="die.isLocked ? 'text-primary' : 'text-muted-foreground hover:text-primary'"
                     @click="toggleDieLock(die.id)"
                  >
                     <Lock v-if="die.isLocked" class="h-3 w-3" />
                     <Unlock v-else class="h-3 w-3" />
                  </button>
                  <button
                     class="die-remove absolute top-1 right-1 p-1 text-muted-foreground hover:text-destructive transition-colors"
                     @click="removeDie(die.id)"
                  >
                     <X class="h-3 w-3" />
                  </button>
               </UiCard>

               <UiCard
                  v-for="die in customDiceInTray"
                  :key="die.id"
                  class="die-in-tray die-in-tray--custom relative p-3 text-center"
                  :class="{ 'animate-shake': isRolling && !die.isLocked, 'ring-2 ring-primary': die.isLocked }"
               >
                  <span class="text-xs text-muted-foreground truncate block">{{ die.name }}</span>
                  <span
                     class="custom-face-value block font-display text-lg font-bold mt-1 px-2 py-1 rounded"
                     :style="{
                        backgroundColor: die.currentFaceIndex !== null && die.faces[die.currentFaceIndex]?.color
                           ? die.faces[die.currentFaceIndex]?.color ?? 'hsl(var(--primary))'
                           : 'hsl(var(--primary))',
                        color: '#ffffff'
                     }"
                  >
                     {{ die.currentFaceIndex !== null ? die.faces[die.currentFaceIndex]?.value ?? '?' : '?' }}
                  </span>
                  <button
                     class="die-lock absolute top-1 left-1 p-1 transition-colors"
                     :class="die.isLocked ? 'text-primary' : 'text-muted-foreground hover:text-primary'"
                     @click="toggleCustomDieLock(die.id)"
                  >
                     <Lock v-if="die.isLocked" class="h-3 w-3" />
                     <Unlock v-else class="h-3 w-3" />
                  </button>
                  <button
                     class="die-remove absolute top-1 right-1 p-1 text-muted-foreground hover:text-destructive transition-colors"
                     @click="removeCustomDieFromTray(die.id)"
                  >
                     <X class="h-3 w-3" />
                  </button>
               </UiCard>
            </div>

            <UiCard v-if="dice.length > 0" class="dice-total mt-4 p-4 flex items-center justify-between">
               <span class="text-muted-foreground">{{ t('dice.total') }}</span>
               <span class="font-display text-2xl font-bold text-accent">{{ totalResult }}</span>
            </UiCard>

            <UiButton
               class="roll-btn w-full mt-4"
               size="lg"
               :disabled="isRolling"
               @click="rollDice"
            >
               <Dices class="h-5 w-5 mr-2" />
               {{ isRolling ? t('dice.rolling') : t('dice.roll') }}
            </UiButton>
         </section>

         <p
            v-else
            class="dice-empty text-center text-muted-foreground py-12"
            v-motion
            :initial="{ opacity: 0 }"
            :enter="{ opacity: 1, transition: { delay: 300 } }"
         >
            {{ t('dice.selectDice') }}
         </p>
      </div>

      <div v-else-if="viewMode === 'presets'" class="p-4 space-y-6">
         <UiTabs
            :tabs="[
               { value: 'roll', label: t('dice.roll'), icon: Dices },
               { value: 'presets', label: t('dice.presets'), icon: Package },
            ]"
            model-value="presets"
            v-motion
            :initial="{ opacity: 0, y: 10 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 150 } }"
            @update:model-value="viewMode = $event as ViewMode"
         />

         <section
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
         >
            <div class="flex items-center justify-between mb-3">
               <h2 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {{ t('dice.yourPresets') }}
               </h2>
               <UiIconButton size="sm" class="presets-add" @click="startCreatePreset">
                  <Plus class="h-4 w-4" />
               </UiIconButton>
            </div>

            <div v-if="presets.length > 0" class="space-y-3">
               <UiCard v-for="preset in presets" :key="preset.id" class="preset-card p-4">
                  <div class="mb-3">
                     <p class="font-semibold text-foreground">{{ preset.name }}</p>
                     <div class="flex flex-wrap gap-1 mt-2">
                        <UiBadge v-for="item in preset.standardDice" :key="item.type" variant="secondary">
                           {{ item.count }}x D{{ item.type }}
                        </UiBadge>
                        <UiBadge v-for="die in preset.customDice" :key="die.id" variant="default">
                           {{ die.name }}
                        </UiBadge>
                     </div>
                  </div>
                  <div class="flex gap-2 pt-3 border-t border-border">
                     <UiButton size="sm" class="preset-load flex-1" @click="loadPreset(preset)">
                        <Play class="h-4 w-4 mr-1" />
                        {{ t('dice.load') }}
                     </UiButton>
                     <UiButton variant="outline" size="sm" class="preset-edit" @click="editPreset(preset)">
                        <Pencil class="h-4 w-4" />
                     </UiButton>
                     <UiButton
                        variant="outline"
                        size="sm"
                        class="preset-delete text-destructive hover:text-destructive"
                        @click="deletePreset(preset.id)"
                     >
                        <Trash2 class="h-4 w-4" />
                     </UiButton>
                  </div>
               </UiCard>
            </div>

            <div v-else class="text-center py-12">
               <p class="text-muted-foreground mb-4">{{ t('dice.noPresets') }}</p>
               <UiButton variant="outline" @click="startCreatePreset">
                  {{ t('dice.createPreset') }}
               </UiButton>
            </div>
         </section>
      </div>

      <div v-else-if="viewMode === 'createCustom'" class="p-4 space-y-6">
         <section
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
         >
            <h2 class="text-lg font-semibold text-foreground mb-6">{{ t('dice.createCustomDie') }}</h2>

            <div class="space-y-4">
               <div>
                  <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                     {{ t('dice.dieName') }}
                  </label>
                  <UiInput
                     v-model="newCustomDie.name"
                     :placeholder="t('dice.dieNamePlaceholder')"
                  />
               </div>

               <div>
                  <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                     {{ t('dice.faces') }} ({{ newCustomDie.faces.length }})
                  </label>

                  <div class="space-y-3">
                     <UiCard v-for="(face, index) in newCustomDie.faces" :key="index" class="face-editor p-3">
                        <div class="flex items-center gap-2 mb-3">
                           <UiInput
                              v-model="face.value"
                              class="face-input flex-1 text-center text-lg"
                              :placeholder="t('dice.faceValue')"
                           />
                           <button
                              v-if="newCustomDie.faces.length > 2"
                              class="face-remove p-2 text-muted-foreground hover:text-destructive transition-colors"
                              @click="removeFaceFromCustomDie(index)"
                           >
                              <X class="h-4 w-4" />
                           </button>
                        </div>

                        <div class="flex flex-wrap gap-1 mb-3">
                           <button
                              v-for="emoji in FACE_EMOJIS"
                              :key="emoji"
                              class="emoji-btn w-8 h-8 rounded text-sm flex items-center justify-center transition-all"
                              :class="face.value === emoji ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-primary/20'"
                              @click="setFaceEmoji(index, emoji)"
                           >
                              {{ emoji }}
                           </button>
                        </div>

                        <div class="flex flex-wrap gap-1">
                           <button
                              v-for="color in FACE_COLORS"
                              :key="color"
                              class="color-btn w-6 h-6 rounded-full border-2 transition-transform"
                              :class="face.color === color ? 'border-white scale-110' : 'border-transparent'"
                              :style="{ backgroundColor: color }"
                              @click="setFaceColor(index, face.color === color ? null : color)"
                           ></button>
                        </div>
                     </UiCard>
                  </div>

                  <button
                     class="add-face-btn w-full mt-3 p-3 border-2 border-dashed border-muted-foreground/30 rounded-lg text-muted-foreground text-sm hover:border-primary hover:text-primary transition-colors"
                     @click="addFaceToCustomDie"
                  >
                     {{ t('dice.addFace') }}
                  </button>
               </div>
            </div>

            <UiButton
               class="save-custom-die w-full mt-6"
               :disabled="!newCustomDie.name.trim() || newCustomDie.faces.some(f => !f.value.trim())"
               @click="saveCustomDie"
            >
               {{ t('common.save') }}
            </UiButton>
         </section>
      </div>

      <div v-else-if="viewMode === 'createPreset'" class="p-4 space-y-6">
         <section
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
         >
            <h2 class="text-lg font-semibold text-foreground mb-6">
               {{ editingPresetId ? t('dice.editPreset') : t('dice.createPreset') }}
            </h2>

            <div class="space-y-4">
               <div>
                  <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                     {{ t('dice.presetName') }}
                  </label>
                  <UiInput
                     v-model="newPreset.name"
                     :placeholder="t('dice.presetNamePlaceholder')"
                  />
               </div>

               <div>
                  <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                     {{ t('dice.standardDice') }}
                  </label>
                  <div class="grid grid-cols-4 gap-2">
                     <div v-for="type in DICE_TYPES" :key="type" class="text-center">
                        <UiCard
                           hoverable
                           class="preset-die-btn p-2 cursor-pointer mb-1"
                           @click="toggleStandardDieInPreset(type)"
                        >
                           <span class="font-display text-sm font-semibold text-primary">D{{ type }}</span>
                        </UiCard>
                        <div v-if="getStandardDieCountInPreset(type) > 0" class="flex items-center justify-center gap-1">
                           <span class="text-sm text-foreground">{{ getStandardDieCountInPreset(type) }}</span>
                           <button
                              class="preset-die-remove w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center"
                              @click="removeStandardDieFromPreset(type)"
                           >
                              -
                           </button>
                        </div>
                     </div>
                  </div>
               </div>

               <div v-if="customDice.length > 0">
                  <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                     {{ t('dice.customDice') }}
                  </label>
                  <div class="flex flex-wrap gap-2">
                     <button
                        v-for="die in customDice"
                        :key="die.id"
                        class="preset-custom-btn px-3 py-2 rounded-lg text-sm transition-all"
                        :class="isCustomDieInPreset(die.id) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground border-2 border-transparent hover:border-primary'"
                        @click="toggleCustomDieInPreset(die.id)"
                     >
                        {{ die.name }}
                     </button>
                  </div>
               </div>
            </div>

            <UiButton
               class="save-preset w-full mt-6"
               :disabled="!newPreset.name.trim() || (newPreset.standardDice.length === 0 && newPreset.customDiceIds.length === 0)"
               @click="savePreset"
            >
               {{ t('common.save') }}
            </UiButton>
         </section>
      </div>

      <Teleport to="body">
         <div
            v-if="showExportModal"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            @click.self="closeExportModal"
         >
            <UiCard class="export-modal w-full max-w-sm p-6 space-y-4">
               <div class="flex items-center justify-between">
                  <h3 class="text-lg font-semibold">{{ t('dice.exportDie') }}</h3>
                  <button
                     class="p-1 text-muted-foreground hover:text-foreground transition-colors"
                     @click="closeExportModal"
                  >
                     <X class="h-5 w-5" />
                  </button>
               </div>

               <p class="text-sm text-muted-foreground">{{ exportingDie?.name }}</p>

               <div v-if="qrCodeDataUrl" class="flex justify-center">
                  <img :src="qrCodeDataUrl" alt="QR Code" class="rounded-lg" />
               </div>

               <div class="flex gap-2">
                  <UiButton
                     v-if="exportingDie"
                     variant="outline"
                     class="flex-1"
                     @click="downloadJson(exportingDie)"
                  >
                     <Download class="h-4 w-4 mr-2" />
                     JSON
                  </UiButton>
                  <UiButton class="flex-1" @click="closeExportModal">
                     {{ t('common.close') }}
                  </UiButton>
               </div>
            </UiCard>
         </div>
      </Teleport>
   </div>
</template>

<style>
@keyframes shake {
   0%, 100% { transform: translateX(0); }
   25% { transform: translateX(-2px); }
   75% { transform: translateX(2px); }
}

.animate-shake {
   animation: shake 0.1s infinite;
}
</style>
