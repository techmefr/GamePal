<script setup lang="ts">
import { ArrowLeft, Play, Pause, RotateCcw, Settings, Clock } from 'lucide-vue-next'

type TimerMode = 'simple' | 'face-to-face' | 'four-players'

const { t } = useI18n()
const {
    timers,
    activeTimerId,
    isAnyRunning,
    setupSimpleTimer,
    setupFaceToFaceTimers,
    setupFourPlayerTimers,
    toggleTimer,
    resetAll,
    switchToNext,
    setAllDurations,
    formatTime,
    getProgress,
} = useTimer()

const mode = ref<TimerMode>('simple')
const showSettings = ref(false)
const selectedMinutes = ref(5)

const DURATION_OPTIONS = [1, 2, 3, 5, 10, 15, 20, 30]

function initMode(newMode: TimerMode): void {
    mode.value = newMode
    const duration = selectedMinutes.value * 60

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
    }
}

function handleTimerTap(timerId: string): void {
    if (mode.value === 'simple') {
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
        </div>

        <footer class="sticky bottom-0 z-10 bg-card/80 backdrop-blur-lg border-t border-border p-4">
            <div class="flex items-center justify-center gap-4">
                <UiButton
                    data-test-id="settings-btn"
                    variant="outline"
                    size="lg"
                    @click="showSettings = !showSettings"
                >
                    <Settings class="h-5 w-5" />
                </UiButton>
                <UiButton
                    data-test-id="reset-btn"
                    variant="outline"
                    size="lg"
                    @click="resetAll"
                >
                    <RotateCcw class="h-5 w-5" />
                    {{ t('time.reset') }}
                </UiButton>
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
    @apply ring-2 ring-primary ring-inset;
}

.timer-zone--inactive {
    @apply opacity-50;
}

.timer-zone--finished {
    @apply bg-destructive/10;
}
</style>
