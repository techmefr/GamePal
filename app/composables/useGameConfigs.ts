import type { IGameConfig } from '~/types'

const STORAGE_KEY = 'gamepal-game-configs'

const configs = ref<IGameConfig[]>([])
const activeConfigId = ref<string | null>(null)
const isLoaded = ref(false)

function load(): void {
    if (import.meta.client && !isLoaded.value) {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                configs.value = JSON.parse(stored)
            }
            const activeId = localStorage.getItem(`${STORAGE_KEY}-active`)
            if (activeId) {
                activeConfigId.value = activeId
            }
        } catch (_e) {
            configs.value = []
        }
        isLoaded.value = true
    }
}

function save(): void {
    if (import.meta.client) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(configs.value))
            if (activeConfigId.value) {
                localStorage.setItem(`${STORAGE_KEY}-active`, activeConfigId.value)
            } else {
                localStorage.removeItem(`${STORAGE_KEY}-active`)
            }
        } catch (_e) {
            console.warn('Failed to save game configs')
        }
    }
}

export function useGameConfigs() {
    onMounted(load)

    const activeConfig = computed((): IGameConfig | null => {
        if (!activeConfigId.value) return null
        return configs.value.find(c => c.id === activeConfigId.value) ?? null
    })

    function createConfig(
        gameName: string,
        options: {
            gameId?: string | null
            dicePresetId?: string | null
            timerPresetId?: string | null
        } = {}
    ): IGameConfig {
        const config: IGameConfig = {
            id: generateId(),
            gameId: options.gameId ?? null,
            gameName: gameName.trim(),
            dicePresetId: options.dicePresetId ?? null,
            timerPresetId: options.timerPresetId ?? null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
        configs.value.unshift(config)
        save()
        return config
    }

    function updateConfig(
        id: string,
        updates: Partial<Pick<IGameConfig, 'gameName' | 'dicePresetId' | 'timerPresetId'>>
    ): void {
        const config = configs.value.find(c => c.id === id)
        if (!config) return

        if (updates.gameName !== undefined) config.gameName = updates.gameName.trim()
        if (updates.dicePresetId !== undefined) config.dicePresetId = updates.dicePresetId
        if (updates.timerPresetId !== undefined) config.timerPresetId = updates.timerPresetId
        config.updatedAt = new Date().toISOString()
        save()
    }

    function deleteConfig(id: string): void {
        const index = configs.value.findIndex(c => c.id === id)
        if (index !== -1) {
            configs.value.splice(index, 1)
            if (activeConfigId.value === id) {
                activeConfigId.value = null
            }
            save()
        }
    }

    function activateConfig(id: string): IGameConfig | null {
        const config = configs.value.find(c => c.id === id)
        if (!config) return null

        activeConfigId.value = id
        config.updatedAt = new Date().toISOString()
        save()
        return config
    }

    function deactivateConfig(): void {
        activeConfigId.value = null
        save()
    }

    function getConfig(id: string): IGameConfig | null {
        return configs.value.find(c => c.id === id) ?? null
    }

    function getConfigByGameId(gameId: string): IGameConfig | null {
        return configs.value.find(c => c.gameId === gameId) ?? null
    }

    return {
        configs: readonly(configs),
        activeConfig,
        activeConfigId: readonly(activeConfigId),
        createConfig,
        updateConfig,
        deleteConfig,
        activateConfig,
        deactivateConfig,
        getConfig,
        getConfigByGameId,
    }
}
