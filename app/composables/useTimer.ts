import type { ITimer, ITimerPreset } from '~/types'

const PRESETS_STORAGE_KEY = 'gamepal-timer-presets'

const DEFAULT_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b']
const DEFAULT_DURATION = 5 * 60

function generateId(): string {
    return Math.random().toString(36).substring(2, 9)
}

export function useTimer() {
    const timers = ref<ITimer[]>([])
    const activeTimerId = ref<string | null>(null)
    const intervalId = ref<ReturnType<typeof setInterval> | null>(null)
    const presets = ref<ITimerPreset[]>([])
    const isInitialized = ref(false)

    function init(): void {
        if (isInitialized.value) return

        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(PRESETS_STORAGE_KEY)
            if (stored) {
                try {
                    presets.value = JSON.parse(stored)
                } catch {
                    presets.value = []
                }
            }
        }
        isInitialized.value = true
    }

    function savePresets(): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets.value))
        }
    }

    function createTimer(label: string, duration: number, color: string): ITimer {
        const timer: ITimer = {
            id: generateId(),
            label,
            duration,
            remaining: duration,
            isRunning: false,
            color,
        }
        timers.value.push(timer)
        return timer
    }

    function setupSimpleTimer(duration: number = DEFAULT_DURATION): void {
        clearAllTimers()
        createTimer('Timer', duration, DEFAULT_COLORS[0])
    }

    function setupFaceToFaceTimers(duration: number = DEFAULT_DURATION): void {
        clearAllTimers()
        createTimer('Player 1', duration, DEFAULT_COLORS[0])
        createTimer('Player 2', duration, DEFAULT_COLORS[1])
    }

    function setupFourPlayerTimers(duration: number = DEFAULT_DURATION): void {
        clearAllTimers()
        for (let i = 0; i < 4; i++) {
            createTimer(`Player ${i + 1}`, duration, DEFAULT_COLORS[i])
        }
    }

    function clearAllTimers(): void {
        stopAll()
        timers.value = []
        activeTimerId.value = null
    }

    function startTimer(id: string): void {
        const timer = timers.value.find(t => t.id === id)
        if (!timer || timer.remaining <= 0) return

        if (activeTimerId.value && activeTimerId.value !== id) {
            pauseTimer(activeTimerId.value)
        }

        timer.isRunning = true
        activeTimerId.value = id

        if (intervalId.value) {
            clearInterval(intervalId.value)
        }

        intervalId.value = setInterval(() => {
            const activeTimer = timers.value.find(t => t.id === activeTimerId.value)
            if (activeTimer && activeTimer.isRunning) {
                activeTimer.remaining = Math.max(0, activeTimer.remaining - 1)
                if (activeTimer.remaining <= 0) {
                    activeTimer.isRunning = false
                    stopInterval()
                }
            }
        }, 1000)
    }

    function pauseTimer(id: string): void {
        const timer = timers.value.find(t => t.id === id)
        if (timer) {
            timer.isRunning = false
        }
        if (activeTimerId.value === id) {
            stopInterval()
            activeTimerId.value = null
        }
    }

    function toggleTimer(id: string): void {
        const timer = timers.value.find(t => t.id === id)
        if (!timer) return

        if (timer.isRunning) {
            pauseTimer(id)
        } else {
            startTimer(id)
        }
    }

    function resetTimer(id: string): void {
        const timer = timers.value.find(t => t.id === id)
        if (timer) {
            pauseTimer(id)
            timer.remaining = timer.duration
        }
    }

    function resetAll(): void {
        stopAll()
        for (const timer of timers.value) {
            timer.remaining = timer.duration
        }
    }

    function stopAll(): void {
        stopInterval()
        for (const timer of timers.value) {
            timer.isRunning = false
        }
        activeTimerId.value = null
    }

    function stopInterval(): void {
        if (intervalId.value) {
            clearInterval(intervalId.value)
            intervalId.value = null
        }
    }

    function switchToNext(): void {
        if (timers.value.length < 2) return

        const currentIndex = timers.value.findIndex(t => t.id === activeTimerId.value)
        const nextIndex = (currentIndex + 1) % timers.value.length
        const nextTimer = timers.value[nextIndex]

        if (activeTimerId.value) {
            pauseTimer(activeTimerId.value)
        }

        if (nextTimer.remaining > 0) {
            startTimer(nextTimer.id)
        }
    }

    function setDuration(id: string, duration: number): void {
        const timer = timers.value.find(t => t.id === id)
        if (timer) {
            timer.duration = duration
            timer.remaining = duration
        }
    }

    function setAllDurations(duration: number): void {
        for (const timer of timers.value) {
            timer.duration = duration
            timer.remaining = duration
        }
    }

    function addPreset(name: string, duration: number, game: string | null = null): ITimerPreset {
        const preset: ITimerPreset = {
            id: generateId(),
            name,
            duration,
            game,
        }
        presets.value.push(preset)
        savePresets()
        return preset
    }

    function deletePreset(id: string): void {
        const index = presets.value.findIndex(p => p.id === id)
        if (index !== -1) {
            presets.value.splice(index, 1)
            savePresets()
        }
    }

    function formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    function getProgress(timer: ITimer): number {
        if (timer.duration === 0) return 0
        return (timer.remaining / timer.duration) * 100
    }

    const isAnyRunning = computed(() => timers.value.some(t => t.isRunning))

    const isAnyFinished = computed(() => timers.value.some(t => t.remaining <= 0))

    init()

    onUnmounted(() => {
        stopInterval()
    })

    return {
        timers: readonly(timers),
        activeTimerId: readonly(activeTimerId),
        presets: readonly(presets),
        isAnyRunning,
        isAnyFinished,
        createTimer,
        setupSimpleTimer,
        setupFaceToFaceTimers,
        setupFourPlayerTimers,
        clearAllTimers,
        startTimer,
        pauseTimer,
        toggleTimer,
        resetTimer,
        resetAll,
        stopAll,
        switchToNext,
        setDuration,
        setAllDurations,
        addPreset,
        deletePreset,
        formatTime,
        getProgress,
    }
}
