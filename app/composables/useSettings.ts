const SETTINGS_STORAGE_KEY = 'gamepal-settings'

type FontSize = 'small' | 'medium' | 'large'

interface ISettings {
    fontSize: FontSize
    isDyslexiaMode: boolean
}

const DEFAULT_SETTINGS: ISettings = {
    fontSize: 'medium',
    isDyslexiaMode: false,
}

const FONT_SIZE_VALUES: Record<FontSize, string> = {
    small: '14px',
    medium: '16px',
    large: '18px',
}

const settings = ref<ISettings>({ ...DEFAULT_SETTINGS })
const isInitialized = ref(false)

export function useSettings() {
    function init(): void {
        if (isInitialized.value) return
        if (typeof window === 'undefined') return

        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as Partial<ISettings>
                settings.value = { ...DEFAULT_SETTINGS, ...parsed }
            } catch {
                settings.value = { ...DEFAULT_SETTINGS }
            }
        }

        applySettings()
        isInitialized.value = true
    }

    function saveSettings(): void {
        if (typeof window === 'undefined') return
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings.value))
    }

    function applySettings(): void {
        if (typeof window === 'undefined') return

        document.documentElement.style.fontSize = FONT_SIZE_VALUES[settings.value.fontSize]
        document.documentElement.classList.toggle('dyslexia-mode', settings.value.isDyslexiaMode)
    }

    function setFontSize(size: FontSize): void {
        settings.value.fontSize = size
        saveSettings()
        applySettings()
    }

    function setDyslexiaMode(enabled: boolean): void {
        settings.value.isDyslexiaMode = enabled
        saveSettings()
        applySettings()
    }

    const fontSize = computed(() => settings.value.fontSize)
    const isDyslexiaMode = computed(() => settings.value.isDyslexiaMode)

    init()

    return {
        fontSize,
        isDyslexiaMode,
        setFontSize,
        setDyslexiaMode,
    }
}
