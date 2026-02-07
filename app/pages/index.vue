<script setup lang="ts">
import { Settings, Users, Gamepad2, X, Search, Play, Pencil, Trash2 } from 'lucide-vue-next'
import type { IDicePreset, ITimerPreset } from '~/types'
import { cn } from '~/lib/utils'

const { t } = useI18n()
const { games } = useLibrary()
const { activeConfig, configs, createConfig, updateConfig, deleteConfig, activateConfig, deactivateConfig } = useGameConfigs()

interface IGameMode {
    id: string
    titleKey: string
    descriptionKey: string
    route: string
    enabled: boolean
    icon: string
}

const modes: IGameMode[] = [
    {
        id: 'random-picker',
        titleKey: 'home.modes.randomPicker.title',
        descriptionKey: 'home.modes.randomPicker.description',
        route: '/random-picker',
        enabled: true,
        icon: '🎲',
    },
    {
        id: 'dice',
        titleKey: 'home.modes.dice.title',
        descriptionKey: 'home.modes.dice.description',
        route: '/dice',
        enabled: true,
        icon: '🎯',
    },
    {
        id: 'time',
        titleKey: 'home.modes.time.title',
        descriptionKey: 'home.modes.time.description',
        route: '/time',
        enabled: true,
        icon: '⏱️',
    },
    {
        id: 'scores',
        titleKey: 'home.modes.scores.title',
        descriptionKey: 'home.modes.scores.description',
        route: '/scores',
        enabled: true,
        icon: '📊',
    },
    {
        id: 'library',
        titleKey: 'home.modes.library.title',
        descriptionKey: 'home.modes.library.description',
        route: '/library',
        enabled: true,
        icon: '📚',
    },
    {
        id: 'music',
        titleKey: 'home.modes.music.title',
        descriptionKey: 'home.modes.music.description',
        route: '/music',
        enabled: false,
        icon: '🎵',
    },
    {
        id: 'rules',
        titleKey: 'home.modes.rules.title',
        descriptionKey: 'home.modes.rules.description',
        route: '/rules',
        enabled: false,
        icon: '📖',
    },
    {
        id: 'narrator',
        titleKey: 'home.modes.narrator.title',
        descriptionKey: 'home.modes.narrator.description',
        route: '/narrator',
        enabled: false,
        icon: '🎭',
    },
]

const showGameSelector = ref(false)
const showConfigEditor = ref(false)
const searchQuery = ref('')
const editingConfigId = ref<string | null>(null)
const configName = ref('')
const selectedDicePresetId = ref<string | null>(null)
const selectedTimerPresetId = ref<string | null>(null)

const { data: dicePresets } = useLocalStorage<IDicePreset[]>('gamepal-dice-presets', [])
const { data: timerPresets } = useLocalStorage<ITimerPreset[]>('gamepal-timer-presets', [])

const filteredGames = computed(() => {
    if (!searchQuery.value.trim()) return games.value
    const query = searchQuery.value.toLowerCase()
    return games.value.filter(game =>
        game.name.toLowerCase().includes(query) ||
        game.style?.toLowerCase().includes(query) ||
        game.mood?.toLowerCase().includes(query)
    )
})

function openGameSelector(): void {
    showGameSelector.value = true
    searchQuery.value = ''
}

function closeGameSelector(): void {
    showGameSelector.value = false
    searchQuery.value = ''
}

function selectGame(game: IGame): void {
    const existingConfig = configs.value.find(c => c.gameId === game.id)
    if (existingConfig) {
        activateConfig(existingConfig.id)
    } else {
        const config = createConfig(game.name, { gameId: game.id })
        activateConfig(config.id)
    }
    closeGameSelector()
}

function openConfigEditor(configId?: string): void {
    if (configId) {
        const config = configs.value.find(c => c.id === configId)
        if (config) {
            editingConfigId.value = configId
            configName.value = config.gameName
            selectedDicePresetId.value = config.dicePresetId
            selectedTimerPresetId.value = config.timerPresetId
        }
    } else {
        editingConfigId.value = null
        configName.value = ''
        selectedDicePresetId.value = null
        selectedTimerPresetId.value = null
    }
    showConfigEditor.value = true
}

function closeConfigEditor(): void {
    showConfigEditor.value = false
    editingConfigId.value = null
    configName.value = ''
    selectedDicePresetId.value = null
    selectedTimerPresetId.value = null
}

function saveConfig(): void {
    const name = configName.value.trim()
    if (name === '') return

    if (editingConfigId.value) {
        updateConfig(editingConfigId.value, {
            gameName: name,
            dicePresetId: selectedDicePresetId.value,
            timerPresetId: selectedTimerPresetId.value,
        })
        activateConfig(editingConfigId.value)
    } else {
        const config = createConfig(name, {
            dicePresetId: selectedDicePresetId.value,
            timerPresetId: selectedTimerPresetId.value,
        })
        activateConfig(config.id)
    }
    closeConfigEditor()
}

function handleDeleteConfig(id: string): void {
    deleteConfig(id)
}

function handleEndSession(): void {
    deactivateConfig()
}
</script>

<template>
    <div class="min-h-dvh bg-background pb-8">
        <header class="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
            <div class="flex items-center justify-between px-4 py-4">
                <div
                    v-motion
                    :initial="{ opacity: 0, x: -20 }"
                    :enter="{ opacity: 1, x: 0, transition: { delay: 100 } }"
                >
                    <h1 class="font-display text-2xl font-bold tracking-tight">
                        {{ t('app.name') }}
                    </h1>
                    <p class="text-sm text-muted-foreground">{{ t('app.tagline') }}</p>
                </div>
                <div class="flex gap-2">
                    <NuxtLink
                        to="/players"
                        class="home__players flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                        v-motion
                        :initial="{ opacity: 0, scale: 0.8 }"
                        :enter="{ opacity: 1, scale: 1, transition: { delay: 200 } }"
                    >
                        <Users class="h-5 w-5" />
                    </NuxtLink>
                    <NuxtLink
                        to="/settings"
                        class="home__settings flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                        v-motion
                        :initial="{ opacity: 0, scale: 0.8 }"
                        :enter="{ opacity: 1, scale: 1, transition: { delay: 250 } }"
                    >
                        <Settings class="h-5 w-5" />
                    </NuxtLink>
                </div>
            </div>
        </header>

        <main class="px-4 pt-6">
            <section
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
                class="mb-6"
            >
                <UiCard
                    v-if="activeConfig"
                    class="active-config p-4 ring-2 ring-primary"
                >
                    <div class="flex items-center gap-3 mb-3">
                        <Gamepad2 class="h-5 w-5 text-primary" />
                        <span class="flex-1 font-semibold text-primary">{{ activeConfig.gameName }}</span>
                        <UiButton size="sm" variant="ghost" @click="openConfigEditor(activeConfig.id)">
                            <Pencil class="h-4 w-4" />
                        </UiButton>
                        <UiButton size="sm" variant="outline" @click="handleEndSession">
                            {{ t('home.endGame') }}
                        </UiButton>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <UiBadge v-if="activeConfig.dicePresetId" variant="secondary">
                            {{ dicePresets.find(p => p.id === activeConfig?.dicePresetId)?.name ?? t('home.dicePreset') }}
                        </UiBadge>
                        <UiBadge v-if="activeConfig.timerPresetId" variant="secondary">
                            {{ timerPresets.find(p => p.id === activeConfig?.timerPresetId)?.name ?? t('home.timerPreset') }}
                        </UiBadge>
                    </div>
                </UiCard>

                <div v-else class="flex gap-2">
                    <UiButton class="flex-1" @click="openGameSelector">
                        <Gamepad2 class="h-4 w-4 mr-2" />
                        {{ t('home.selectGame') }}
                    </UiButton>
                    <UiButton variant="outline" @click="openConfigEditor()">
                        {{ t('home.manualConfig') }}
                    </UiButton>
                </div>
            </section>

            <div class="grid grid-cols-2 gap-4">
                <component
                    :is="mode.enabled ? 'NuxtLink' : 'div'"
                    v-for="(mode, index) in modes"
                    :key="mode.id"
                    :to="mode.enabled ? mode.route : undefined"
                    class="mode-card"
                    :class="{ 'mode-card--disabled': !mode.enabled }"
                    v-motion
                    :initial="{ opacity: 0, y: 20 }"
                    :enter="{ opacity: 1, y: 0, transition: { delay: 150 + index * 50 } }"
                >
                    <UiCard
                        :hoverable="mode.enabled"
                        :class="cn('relative h-full p-4', !mode.enabled && 'opacity-50')"
                    >
                        <UiBadge
                            v-if="!mode.enabled"
                            variant="secondary"
                            class="mode-card__badge absolute -top-2 -right-2"
                        >
                            {{ t('common.comingSoon') }}
                        </UiBadge>
                        <div class="text-3xl mb-3">{{ mode.icon }}</div>
                        <h2 class="font-display font-semibold text-foreground mb-1">
                            {{ t(mode.titleKey) }}
                        </h2>
                        <p class="text-xs text-muted-foreground leading-relaxed">
                            {{ t(mode.descriptionKey) }}
                        </p>
                    </UiCard>
                </component>
            </div>

            <section
                v-if="configs.length > 0 && !activeConfig"
                class="mt-6"
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 500 } }"
            >
                <h2 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    {{ t('home.recentGames') }}
                </h2>
                <div class="space-y-2">
                    <UiCard
                        v-for="config in configs.slice(0, 3)"
                        :key="config.id"
                        hoverable
                        class="recent-game p-3 cursor-pointer"
                        @click="activateConfig(config.id)"
                    >
                        <div class="flex items-center gap-3">
                            <Gamepad2 class="h-4 w-4 text-muted-foreground" />
                            <span class="flex-1 font-medium">{{ config.gameName }}</span>
                            <Play class="h-4 w-4 text-primary" />
                        </div>
                    </UiCard>
                </div>
            </section>
        </main>

        <Teleport to="body">
            <div
                v-if="showGameSelector"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                @click.self="closeGameSelector"
            >
                <UiCard class="game-selector w-full max-w-md p-6 space-y-4 max-h-[80vh] overflow-hidden flex flex-col">
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-semibold">{{ t('home.selectGame') }}</h3>
                        <button
                            class="p-1 text-muted-foreground hover:text-foreground transition-colors"
                            @click="closeGameSelector"
                        >
                            <X class="h-5 w-5" />
                        </button>
                    </div>

                    <div class="relative">
                        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <UiInput
                            v-model="searchQuery"
                            :placeholder="t('home.searchGame')"
                            class="pl-10"
                        />
                    </div>

                    <div class="flex-1 overflow-y-auto space-y-2 min-h-0">
                        <template v-if="filteredGames.length > 0">
                            <button
                                v-for="game in filteredGames"
                                :key="game.id"
                                class="game-item w-full p-3 rounded-lg bg-muted hover:bg-muted/80 text-left transition-colors"
                                @click="selectGame(game)"
                            >
                                <p class="font-medium">{{ game.name }}</p>
                                <p class="text-xs text-muted-foreground">
                                    {{ game.minPlayers }}-{{ game.maxPlayers }} {{ t('home.players') }}
                                    <span v-if="game.style"> - {{ game.style }}</span>
                                </p>
                            </button>
                        </template>
                        <p v-else class="text-center text-muted-foreground py-8">
                            {{ games.length === 0 ? t('home.noGamesInLibrary') : t('home.noGamesFound') }}
                        </p>
                    </div>

                    <div class="pt-4 border-t border-border">
                        <UiButton variant="outline" class="w-full" @click="closeGameSelector(); openConfigEditor()">
                            {{ t('home.manualConfig') }}
                        </UiButton>
                    </div>
                </UiCard>
            </div>

            <div
                v-if="showConfigEditor"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                @click.self="closeConfigEditor"
            >
                <UiCard class="config-editor w-full max-w-md p-6 space-y-4">
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-semibold">
                            {{ editingConfigId ? t('home.editConfig') : t('home.newConfig') }}
                        </h3>
                        <button
                            class="p-1 text-muted-foreground hover:text-foreground transition-colors"
                            @click="closeConfigEditor"
                        >
                            <X class="h-5 w-5" />
                        </button>
                    </div>

                    <div>
                        <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                            {{ t('home.gameName') }}
                        </label>
                        <UiInput
                            v-model="configName"
                            :placeholder="t('home.gameNamePlaceholder')"
                        />
                    </div>

                    <div v-if="dicePresets.length > 0">
                        <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                            {{ t('home.dicePreset') }}
                        </label>
                        <div class="flex flex-wrap gap-2">
                            <button
                                class="px-3 py-2 rounded-lg text-sm transition-all"
                                :class="selectedDicePresetId === null
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'"
                                @click="selectedDicePresetId = null"
                            >
                                {{ t('common.none') }}
                            </button>
                            <button
                                v-for="preset in dicePresets"
                                :key="preset.id"
                                class="px-3 py-2 rounded-lg text-sm transition-all"
                                :class="selectedDicePresetId === preset.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'"
                                @click="selectedDicePresetId = preset.id"
                            >
                                {{ preset.name }}
                            </button>
                        </div>
                    </div>

                    <div v-if="timerPresets.length > 0">
                        <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                            {{ t('home.timerPreset') }}
                        </label>
                        <div class="flex flex-wrap gap-2">
                            <button
                                class="px-3 py-2 rounded-lg text-sm transition-all"
                                :class="selectedTimerPresetId === null
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'"
                                @click="selectedTimerPresetId = null"
                            >
                                {{ t('common.none') }}
                            </button>
                            <button
                                v-for="preset in timerPresets"
                                :key="preset.id"
                                class="px-3 py-2 rounded-lg text-sm transition-all"
                                :class="selectedTimerPresetId === preset.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'"
                                @click="selectedTimerPresetId = preset.id"
                            >
                                {{ preset.name }}
                            </button>
                        </div>
                    </div>

                    <div class="flex gap-2 pt-4">
                        <UiButton
                            class="flex-1"
                            :disabled="!configName.trim()"
                            @click="saveConfig"
                        >
                            {{ t('common.save') }}
                        </UiButton>
                        <UiButton variant="outline" @click="closeConfigEditor">
                            {{ t('common.cancel') }}
                        </UiButton>
                    </div>
                </UiCard>
            </div>
        </Teleport>
    </div>
</template>
