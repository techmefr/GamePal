<script setup lang="ts">
import { ArrowLeft, RotateCcw, Settings, Plus, Trash2, Download, Upload, Hourglass, X } from 'lucide-vue-next'

type TimerMode = 'simple' | 'face-to-face' | 'four-players' | 'hourglass'

const { t } = useI18n()
const {
    timers,
    activeTimerId,
    allPresets,
    presets,
    setupSimpleTimer,
    setupFaceToFaceTimers,
    setupFourPlayerTimers,
    setupHourglass,
    toggleTimer,
    resetAll,
    switchToNext,
    setAllDurations,
    addPreset,
    deletePreset,
    exportPresets,
    importPresets,
    formatTime,
    getProgress,
} = useTimer()

const mode = ref<TimerMode>('simple')
const showSettings = ref(false)
const showPresets = ref(false)
const showAddPreset = ref(false)
const selectedMinutes = ref(5)
const newPresetName = ref('')
const newPresetMinutes = ref(5)
const isFlipped = ref(false)
const hourglassProgress = ref(100)

const DURATION_OPTIONS = [1, 2, 3, 5, 10, 15, 20, 30]

function initMode(newMode: TimerMode): void {
    mode.value = newMode
    const duration = selectedMinutes.value * 60
    isFlipped.value = false

    switch (newMode) {
        case 'simple':
            setupSimpleTimer(duration)
            break
        case 'face-to-face':
            setupFaceToFaceTimers(duration)
            break
        case 'four-players':
            setupFourPlayerTimers(duration)
            break
        case 'hourglass':
            setupHourglass(duration)
            hourglassProgress.value = 100
            break
    }
}

function handleTimerTap(timerId: string): void {
    if (mode.value === 'simple' || mode.value === 'hourglass') {
        toggleTimer(timerId)
    } else {
        if (activeTimerId.value === timerId) {
            switchToNext()
        } else {
            toggleTimer(timerId)
        }
    }
}

function handleDurationChange(minutes: number): void {
    selectedMinutes.value = minutes
    setAllDurations(minutes * 60)
    if (mode.value === 'hourglass') {
        hourglassProgress.value = 100
    }
}

function handlePresetSelect(duration: number): void {
    const minutes = Math.ceil(duration / 60)
    selectedMinutes.value = minutes
    setAllDurations(duration)
    if (mode.value === 'hourglass') {
        hourglassProgress.value = 100
    }
    showPresets.value = false
}

function handleAddPreset(): void {
    if (newPresetName.value.trim() === '') return
    addPreset(newPresetName.value.trim(), newPresetMinutes.value * 60)
    newPresetName.value = ''
    newPresetMinutes.value = 5
    showAddPreset.value = false
}

function handleExportPresets(): void {
    const json = exportPresets()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'gamepal-timer-presets.json'
    a.click()
    URL.revokeObjectURL(url)
}

function handleImportPresets(): void {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
            const json = reader.result as string
            importPresets(json)
        }
        reader.readAsText(file)
    }
    input.click()
}

function flipHourglass(): void {
    if (mode.value !== 'hourglass') return
    isFlipped.value = !isFlipped.value
    const timer = timers.value[0]
    if (timer) {
        const elapsed = timer.duration - timer.remaining
        timer.remaining = elapsed
        timer.duration = elapsed
        hourglassProgress.value = 100
    }
}

function getTimerClasses(timerId: string, isRunning: boolean, remaining: number): string {
    const classes = ['timer-zone', 'transition-all', 'duration-300']

    if (remaining <= 0) {
        classes.push('timer-zone--finished')
    } else if (isRunning) {
        classes.push('timer-zone--active')
    } else if (activeTimerId.value && activeTimerId.value !== timerId) {
        classes.push('timer-zone--inactive')
    }

    return classes.join(' ')
}

watch(() => timers.value[0]?.remaining, (remaining) => {
    if (mode.value === 'hourglass' && timers.value[0]) {
        const timer = timers.value[0]
        hourglassProgress.value = timer.duration > 0 ? (remaining ?? 0) / timer.duration * 100 : 0
    }
})

onMounted(() => {
    initMode('simple')
})
</script>

<template>
    <div class="min-h-dvh bg-background flex flex-col">
        <header class="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border">
            <div class="flex items-center gap-4 px-4 py-3">
                <NuxtLink
                    to="/"
                    data-test-id="back-btn"
                    class="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                    <ArrowLeft class="h-5 w-5" />
                </NuxtLink>
                <h1 class="heading flex-1 font-display text-lg font-bold">{{ t('time.title') }}</h1>
                <UiTabs
                    :tabs="[
                        { value: 'simple', label: t('time.modes.simple') },
                        { value: 'face-to-face', label: t('time.modes.faceToFace') },
                        { value: 'four-players', label: t('time.modes.fourPlayers') },
                        { value: 'hourglass', label: t('time.modes.hourglass') },
                    ]"
                    :model-value="mode"
                    test-id="mode"
                    @update:model-value="initMode($event as TimerMode)"
                />
            </div>
        </header>

        <div class="flex-1 flex flex-col">
            <div
                v-if="mode === 'simple'"
                data-test-id="simple-mode"
                class="flex-1 flex flex-col"
            >
                <div
                    v-for="timer in timers"
                    :key="timer.id"
                    data-test-id="timer-zone"
                    :class="getTimerClasses(timer.id, timer.isRunning, timer.remaining)"
                    class="flex-1 flex flex-col items-center justify-center cursor-pointer select-none"
                    :style="{ backgroundColor: timer.isRunning ? timer.color + '20' : undefined }"
                    @click="handleTimerTap(timer.id)"
                >
                    <div
                        class="timer-display font-mono text-8xl font-bold tracking-tight"
                        :class="{ 'text-destructive animate-pulse': timer.remaining <= 0 }"
                        :style="{ color: timer.remaining > 0 ? timer.color : undefined }"
                    >
                        {{ formatTime(timer.remaining) }}
                    </div>
                    <div class="mt-4 text-muted-foreground">
                        {{ timer.isRunning ? t('time.tapToPause') : t('time.tapToStart') }}
                    </div>
                    <div class="w-full max-w-md mt-8 px-8">
                        <div class="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                class="h-full transition-all duration-1000"
                                :style="{
                                    width: `${getProgress(timer)}%`,
                                    backgroundColor: timer.color,
                                }"
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                v-else-if="mode === 'face-to-face'"
                data-test-id="face-to-face-mode"
                class="flex-1 flex flex-col"
            >
                <div
                    v-for="(timer, index) in timers"
                    :key="timer.id"
                    data-test-class="timer-zone"
                    :class="getTimerClasses(timer.id, timer.isRunning, timer.remaining)"
                    class="flex-1 flex flex-col items-center justify-center cursor-pointer select-none border-b border-border last:border-b-0"
                    :style="{ backgroundColor: timer.isRunning ? timer.color + '20' : undefined }"
                    :data-rotation="index === 0 ? '180' : '0'"
                    @click="handleTimerTap(timer.id)"
                >
                    <div
                        class="timer-content flex flex-col items-center"
                        :class="{ 'rotate-180': index === 0 }"
                    >
                        <div class="text-sm font-medium text-muted-foreground mb-2">
                            {{ timer.label }}
                        </div>
                        <div
                            class="timer-display font-mono text-6xl font-bold tracking-tight"
                            :class="{ 'text-destructive animate-pulse': timer.remaining <= 0 }"
                            :style="{ color: timer.remaining > 0 ? timer.color : undefined }"
                        >
                            {{ formatTime(timer.remaining) }}
                        </div>
                        <div class="w-48 mt-4">
                            <div class="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    class="h-full transition-all duration-1000"
                                    :style="{
                                        width: `${getProgress(timer)}%`,
                                        backgroundColor: timer.color,
                                    }"
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                v-else-if="mode === 'four-players'"
                data-test-id="four-players-mode"
                class="flex-1 grid grid-cols-2 grid-rows-2"
            >
                <div
                    v-for="(timer, index) in timers"
                    :key="timer.id"
                    data-test-class="timer-zone"
                    :class="[
                        getTimerClasses(timer.id, timer.isRunning, timer.remaining),
                        'flex flex-col items-center justify-center cursor-pointer select-none border-r border-b border-border',
                        {
                            'border-r-0': index % 2 === 1,
                            'border-b-0': index >= 2,
                        }
                    ]"
                    :style="{ backgroundColor: timer.isRunning ? timer.color + '20' : undefined }"
                    @click="handleTimerTap(timer.id)"
                >
                    <div
                        class="timer-content flex flex-col items-center"
                        :class="{ 'rotate-180': index < 2 }"
                    >
                        <div class="text-xs font-medium text-muted-foreground mb-1">
                            {{ timer.label }}
                        </div>
                        <div
                            class="timer-display font-mono text-4xl font-bold tracking-tight"
                            :class="{ 'text-destructive animate-pulse': timer.remaining <= 0 }"
                            :style="{ color: timer.remaining > 0 ? timer.color : undefined }"
                        >
                            {{ formatTime(timer.remaining) }}
                        </div>
                        <div class="w-24 mt-2">
                            <div class="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    class="h-full transition-all duration-1000"
                                    :style="{
                                        width: `${getProgress(timer)}%`,
                                        backgroundColor: timer.color,
                                    }"
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                v-else-if="mode === 'hourglass'"
                data-test-id="hourglass-mode"
                class="flex-1 flex flex-col items-center justify-center cursor-pointer select-none"
                @click="handleTimerTap(timers[0]?.id)"
            >
                <div
                    class="hourglass-container relative w-48 h-80 transition-transform duration-500"
                    :class="{ 'rotate-180': isFlipped }"
                >
                    <svg viewBox="0 0 100 160" class="w-full h-full">
                        <defs>
                            <clipPath id="hourglassTop">
                                <path d="M10,10 L90,10 L55,75 L45,75 Z" />
                            </clipPath>
                            <clipPath id="hourglassBottom">
                                <path d="M45,85 L55,85 L90,150 L10,150 Z" />
                            </clipPath>
                        </defs>

                        <path
                            d="M10,10 L90,10 L55,75 L55,85 L90,150 L10,150 L45,85 L45,75 Z"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="3"
                            class="text-muted-foreground"
                        />

                        <rect
                            x="10"
                            :y="10 + (65 * (100 - hourglassProgress) / 100)"
                            width="80"
                            :height="65 * hourglassProgress / 100"
                            fill="#f59e0b"
                            clip-path="url(#hourglassTop)"
                            class="transition-all duration-1000"
                        />

                        <rect
                            x="10"
                            :y="85 + (65 * hourglassProgress / 100)"
                            width="80"
                            :height="65 * (100 - hourglassProgress) / 100"
                            fill="#f59e0b"
                            clip-path="url(#hourglassBottom)"
                            class="transition-all duration-1000"
                        />

                        <line
                            v-if="timers[0]?.isRunning && hourglassProgress > 0"
                            x1="50"
                            y1="75"
                            x2="50"
                            y2="85"
                            stroke="#f59e0b"
                            stroke-width="2"
                            class="animate-pulse"
                        />
                    </svg>
                </div>

                <div
                    v-if="timers[0]"
                    class="mt-6 font-mono text-4xl font-bold"
                    :class="{ 'text-destructive animate-pulse': timers[0].remaining <= 0 }"
                >
                    {{ formatTime(timers[0].remaining) }}
                </div>

                <div class="mt-4 text-muted-foreground text-sm">
                    {{ timers[0]?.isRunning ? t('time.tapToPause') : t('time.tapToStart') }}
                </div>

                <UiButton
                    variant="outline"
                    size="sm"
                    class="mt-4"
                    data-test-id="flip-btn"
                    @click.stop="flipHourglass"
                >
                    <Hourglass class="h-4 w-4 mr-2" />
                    {{ t('time.flip') }}
                </UiButton>
            </div>
        </div>

        <footer class="sticky bottom-0 z-10 bg-card/80 backdrop-blur-lg border-t border-border p-4">
            <div class="flex items-center justify-center gap-4">
                <UiButton
                    data-test-id="presets-btn"
                    variant="outline"
                    size="lg"
                    @click="showPresets = !showPresets; showSettings = false"
                >
                    <Hourglass class="h-5 w-5" />
                </UiButton>
                <UiButton
                    data-test-id="settings-btn"
                    variant="outline"
                    size="lg"
                    @click="showSettings = !showSettings; showPresets = false"
                >
                    <Settings class="h-5 w-5" />
                </UiButton>
                <UiButton
                    data-test-id="reset-btn"
                    variant="outline"
                    size="lg"
                    @click="resetAll(); hourglassProgress = 100"
                >
                    <RotateCcw class="h-5 w-5" />
                    {{ t('time.reset') }}
                </UiButton>
            </div>

            <div
                v-if="showPresets"
                v-motion
                :initial="{ opacity: 0, height: 0 }"
                :enter="{ opacity: 1, height: 'auto' }"
                data-test-id="presets-panel"
                class="mt-4 pt-4 border-t border-border"
            >
                <div class="flex items-center justify-between mb-3">
                    <p class="text-sm font-medium">{{ t('time.presets') }}</p>
                    <div class="flex gap-2">
                        <UiButton variant="ghost" size="sm" @click="handleImportPresets">
                            <Upload class="h-4 w-4" />
                        </UiButton>
                        <UiButton variant="ghost" size="sm" @click="handleExportPresets">
                            <Download class="h-4 w-4" />
                        </UiButton>
                        <UiButton variant="ghost" size="sm" @click="showAddPreset = !showAddPreset">
                            <Plus class="h-4 w-4" />
                        </UiButton>
                    </div>
                </div>

                <div
                    v-if="showAddPreset"
                    class="flex gap-2 mb-3 p-3 bg-muted rounded-lg"
                >
                    <UiInput
                        v-model="newPresetName"
                        :placeholder="t('time.presetName')"
                        class="flex-1"
                    />
                    <UiInput
                        v-model.number="newPresetMinutes"
                        type="number"
                        min="1"
                        class="w-20"
                        placeholder="min"
                    />
                    <UiButton size="sm" @click="handleAddPreset">
                        {{ t('common.add') }}
                    </UiButton>
                    <UiButton variant="ghost" size="sm" @click="showAddPreset = false">
                        <X class="h-4 w-4" />
                    </UiButton>
                </div>

                <div class="flex flex-wrap gap-2">
                    <UiButton
                        v-for="preset in allPresets"
                        :key="preset.id"
                        variant="outline"
                        size="sm"
                        class="group relative"
                        data-test-class="preset-btn"
                        @click="handlePresetSelect(preset.duration)"
                    >
                        {{ preset.name }}
                        <button
                            v-if="!preset.id.startsWith('builtin')"
                            class="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            @click.stop="deletePreset(preset.id)"
                        >
                            <X class="h-3 w-3" />
                        </button>
                    </UiButton>
                </div>
            </div>

            <div
                v-if="showSettings"
                v-motion
                :initial="{ opacity: 0, height: 0 }"
                :enter="{ opacity: 1, height: 'auto' }"
                data-test-id="settings-panel"
                class="mt-4 pt-4 border-t border-border"
            >
                <p class="text-sm text-muted-foreground mb-3">{{ t('time.duration') }}</p>
                <div class="flex flex-wrap gap-2 justify-center">
                    <UiButton
                        v-for="minutes in DURATION_OPTIONS"
                        :key="minutes"
                        :variant="selectedMinutes === minutes ? 'default' : 'outline'"
                        size="sm"
                        data-test-class="duration-btn"
                        @click="handleDurationChange(minutes)"
                    >
                        {{ minutes }} min
                    </UiButton>
                </div>
            </div>
        </footer>
    </div>
</template>

<style scoped>
.timer-zone--active {
    box-shadow: inset 0 0 0 2px hsl(var(--ring));
}

.timer-zone--inactive {
    opacity: 0.5;
}

.timer-zone--finished {
    background-color: hsl(var(--destructive) / 0.1);
}

.hourglass-container {
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}
</style>
