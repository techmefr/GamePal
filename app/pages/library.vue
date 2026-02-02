<script setup lang="ts">
import { ArrowLeft, Plus, Search, Filter, X, Pencil, Trash2, Users, DollarSign, Download, History, ChevronDown, ChevronUp } from 'lucide-vue-next'
import type { IGame } from '~/types'
import type { IGameFilters } from '~/composables/useLibrary'

const { t } = useI18n()
const { games, stats, addGame, updateGame, deleteGame, markAsBorrowed, markForSale, filterGames, exportLibrary, getLoanHistory } = useLibrary()

const STYLES = ['strategy', 'party', 'family', 'cooperative', 'card', 'dice', 'rpg', 'trivia']
const MOODS = ['casual', 'competitive', 'relaxed', 'intense', 'funny', 'serious']

const showAddForm = ref(false)
const showFilters = ref(false)
const editingGameId = ref<string | null>(null)
const showDeleteConfirm = ref<string | null>(null)
const borrowingGameId = ref<string | null>(null)
const borrowerName = ref('')
const showHistoryGameId = ref<string | null>(null)

const filters = ref<IGameFilters>({
    search: '',
    style: null,
    mood: null,
    minPlayers: null,
    maxPlayers: null,
    showOwned: true,
    showBorrowed: true,
    showForSale: true,
})

const newGame = ref({
    name: '',
    minPlayers: 2,
    maxPlayers: 4,
    style: null as string | null,
    mood: null as string | null,
})

const filteredGames = computed(() => filterGames(filters.value))

const hasActiveFilters = computed(() => {
    return filters.value.style !== null ||
        filters.value.mood !== null ||
        filters.value.minPlayers !== null ||
        filters.value.maxPlayers !== null ||
        !filters.value.showOwned ||
        !filters.value.showBorrowed ||
        !filters.value.showForSale
})

function handleAddGame(): void {
    if (newGame.value.name.trim() === '') return

    addGame({
        name: newGame.value.name.trim(),
        minPlayers: newGame.value.minPlayers,
        maxPlayers: newGame.value.maxPlayers,
        style: newGame.value.style,
        mood: newGame.value.mood,
        isOwned: true,
        isBorrowed: false,
        borrowedTo: null,
        forSale: false,
    })

    resetForm()
    showAddForm.value = false
}

function resetForm(): void {
    newGame.value = {
        name: '',
        minPlayers: 2,
        maxPlayers: 4,
        style: null,
        mood: null,
    }
}

function startEdit(game: IGame): void {
    editingGameId.value = game.id
    newGame.value = {
        name: game.name,
        minPlayers: game.minPlayers,
        maxPlayers: game.maxPlayers,
        style: game.style,
        mood: game.mood,
    }
    showAddForm.value = true
}

function handleSaveEdit(): void {
    if (editingGameId.value && newGame.value.name.trim()) {
        updateGame(editingGameId.value, {
            name: newGame.value.name.trim(),
            minPlayers: newGame.value.minPlayers,
            maxPlayers: newGame.value.maxPlayers,
            style: newGame.value.style,
            mood: newGame.value.mood,
        })
    }
    cancelEdit()
}

function cancelEdit(): void {
    editingGameId.value = null
    resetForm()
    showAddForm.value = false
}

function handleDelete(id: string): void {
    deleteGame(id)
    showDeleteConfirm.value = null
}

function handleBorrow(gameId: string): void {
    if (borrowerName.value.trim()) {
        markAsBorrowed(gameId, borrowerName.value.trim())
    }
    borrowingGameId.value = null
    borrowerName.value = ''
}

function handleReturn(gameId: string): void {
    markAsBorrowed(gameId, null)
}

function toggleForSale(game: IGame): void {
    markForSale(game.id, !game.forSale)
}

function clearFilters(): void {
    filters.value = {
        search: '',
        style: null,
        mood: null,
        minPlayers: null,
        maxPlayers: null,
        showOwned: true,
        showBorrowed: true,
        showForSale: true,
    }
}

function handleExport(): void {
    const json = exportLibrary()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'gamepal-library.json'
    a.click()
    URL.revokeObjectURL(url)
}

function getStyleLabel(style: string): string {
    return t(`library.styles.${style}`)
}

function getMoodLabel(mood: string): string {
    return t(`library.moods.${mood}`)
}

function formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString()
}

function toggleHistory(gameId: string): void {
    showHistoryGameId.value = showHistoryGameId.value === gameId ? null : gameId
}
</script>

<template>
    <div class="min-h-dvh bg-background">
        <header class="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border">
            <div class="flex items-center gap-4 px-4 py-4">
                <NuxtLink
                    to="/"
                    class="library__back flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    <ArrowLeft class="h-5 w-5" />
                </NuxtLink>
                <h1 class="heading flex-1 font-display text-lg font-bold tracking-tight">
                    {{ t('library.title') }}
                </h1>
                <button
                    class="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    @click="handleExport"
                >
                    <Download class="h-5 w-5" />
                </button>
            </div>
        </header>

        <div class="p-4 space-y-4">
            <div v-if="stats.total > 0" class="space-y-2">
                <div class="grid grid-cols-4 gap-2">
                    <UiCard class="stat-card p-3 text-center">
                        <span class="text-2xl font-bold text-primary">{{ stats.total }}</span>
                        <span class="text-xs text-muted-foreground block">{{ t('library.stats.total') }}</span>
                    </UiCard>
                    <UiCard class="stat-card p-3 text-center">
                        <span class="text-2xl font-bold text-green-500">{{ stats.owned }}</span>
                        <span class="text-xs text-muted-foreground block">{{ t('library.stats.owned') }}</span>
                    </UiCard>
                    <UiCard class="stat-card p-3 text-center">
                        <span class="text-2xl font-bold text-orange-500">{{ stats.borrowed }}</span>
                        <span class="text-xs text-muted-foreground block">{{ t('library.stats.borrowed') }}</span>
                    </UiCard>
                    <UiCard class="stat-card p-3 text-center">
                        <span class="text-2xl font-bold text-blue-500">{{ stats.forSale }}</span>
                        <span class="text-xs text-muted-foreground block">{{ t('library.stats.forSale') }}</span>
                    </UiCard>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <UiCard class="stat-card p-3 text-center">
                        <span class="text-lg font-bold text-muted-foreground">{{ stats.minPlayers }}-{{ stats.maxPlayers }}</span>
                        <span class="text-xs text-muted-foreground block">{{ t('library.stats.playerRange') }}</span>
                    </UiCard>
                    <UiCard class="stat-card p-3 text-center">
                        <span class="text-lg font-bold text-muted-foreground">{{ stats.totalLoans }}</span>
                        <span class="text-xs text-muted-foreground block">{{ t('library.stats.totalLoans') }}</span>
                    </UiCard>
                </div>
            </div>

            <div class="flex gap-2">
                <div class="relative flex-1">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <UiInput
                        v-model="filters.search"
                        :placeholder="t('library.search')"
                        class="pl-10"
                    />
                </div>
                <UiButton
                    variant="outline"
                    :class="{ 'bg-primary text-primary-foreground': showFilters || hasActiveFilters }"
                    @click="showFilters = !showFilters"
                >
                    <Filter class="h-4 w-4" />
                </UiButton>
                <UiButton @click="showAddForm = true">
                    <Plus class="h-4 w-4" />
                </UiButton>
            </div>

            <UiCard v-if="showFilters" class="filters p-4 space-y-4">
                <div class="flex items-center justify-between">
                    <h3 class="font-semibold">{{ t('library.filters') }}</h3>
                    <UiButton v-if="hasActiveFilters" variant="ghost" size="sm" @click="clearFilters">
                        {{ t('library.clearFilters') }}
                    </UiButton>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="text-xs text-muted-foreground block mb-1">{{ t('library.style') }}</label>
                        <select
                            v-model="filters.style"
                            class="w-full h-9 px-3 rounded-md border border-border bg-background text-sm"
                        >
                            <option :value="null">{{ t('library.all') }}</option>
                            <option v-for="style in STYLES" :key="style" :value="style">
                                {{ getStyleLabel(style) }}
                            </option>
                        </select>
                    </div>
                    <div>
                        <label class="text-xs text-muted-foreground block mb-1">{{ t('library.mood') }}</label>
                        <select
                            v-model="filters.mood"
                            class="w-full h-9 px-3 rounded-md border border-border bg-background text-sm"
                        >
                            <option :value="null">{{ t('library.all') }}</option>
                            <option v-for="mood in MOODS" :key="mood" :value="mood">
                                {{ getMoodLabel(mood) }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="text-xs text-muted-foreground block mb-1">{{ t('library.minPlayers') }}</label>
                        <UiInput v-model.number="filters.minPlayers" type="number" min="1" placeholder="--" />
                    </div>
                    <div>
                        <label class="text-xs text-muted-foreground block mb-1">{{ t('library.maxPlayers') }}</label>
                        <UiInput v-model.number="filters.maxPlayers" type="number" min="1" placeholder="--" />
                    </div>
                </div>

                <div class="flex flex-wrap gap-2">
                    <UiButton
                        :variant="filters.showOwned ? 'default' : 'outline'"
                        size="sm"
                        @click="filters.showOwned = !filters.showOwned"
                    >
                        {{ t('library.owned') }}
                    </UiButton>
                    <UiButton
                        :variant="filters.showBorrowed ? 'default' : 'outline'"
                        size="sm"
                        @click="filters.showBorrowed = !filters.showBorrowed"
                    >
                        {{ t('library.borrowed') }}
                    </UiButton>
                    <UiButton
                        :variant="filters.showForSale ? 'default' : 'outline'"
                        size="sm"
                        @click="filters.showForSale = !filters.showForSale"
                    >
                        {{ t('library.forSale') }}
                    </UiButton>
                </div>
            </UiCard>

            <UiCard v-if="showAddForm" class="add-form p-4 space-y-4">
                <div class="flex items-center justify-between">
                    <h3 class="font-semibold">
                        {{ editingGameId ? t('library.editGame') : t('library.addGame') }}
                    </h3>
                    <button class="text-muted-foreground hover:text-foreground" @click="cancelEdit">
                        <X class="h-5 w-5" />
                    </button>
                </div>

                <UiInput
                    v-model="newGame.name"
                    :placeholder="t('library.gameName')"
                />

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="text-xs text-muted-foreground block mb-1">{{ t('library.minPlayers') }}</label>
                        <UiInput v-model.number="newGame.minPlayers" type="number" min="1" />
                    </div>
                    <div>
                        <label class="text-xs text-muted-foreground block mb-1">{{ t('library.maxPlayers') }}</label>
                        <UiInput v-model.number="newGame.maxPlayers" type="number" min="1" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="text-xs text-muted-foreground block mb-1">{{ t('library.style') }}</label>
                        <select
                            v-model="newGame.style"
                            class="w-full h-9 px-3 rounded-md border border-border bg-background text-sm"
                        >
                            <option :value="null">-</option>
                            <option v-for="style in STYLES" :key="style" :value="style">
                                {{ getStyleLabel(style) }}
                            </option>
                        </select>
                    </div>
                    <div>
                        <label class="text-xs text-muted-foreground block mb-1">{{ t('library.mood') }}</label>
                        <select
                            v-model="newGame.mood"
                            class="w-full h-9 px-3 rounded-md border border-border bg-background text-sm"
                        >
                            <option :value="null">-</option>
                            <option v-for="mood in MOODS" :key="mood" :value="mood">
                                {{ getMoodLabel(mood) }}
                            </option>
                        </select>
                    </div>
                </div>

                <UiButton
                    class="w-full"
                    :disabled="!newGame.name.trim()"
                    @click="editingGameId ? handleSaveEdit() : handleAddGame()"
                >
                    {{ editingGameId ? t('common.save') : t('common.add') }}
                </UiButton>
            </UiCard>

            <div v-if="filteredGames.length > 0" class="game-list space-y-2">
                <UiCard
                    v-for="(game, index) in filteredGames"
                    :key="game.id"
                    v-motion
                    :initial="{ opacity: 0, y: 10 }"
                    :enter="{ opacity: 1, y: 0, transition: { delay: index * 30 } }"
                    class="game-card p-4"
                >
                    <div class="flex items-start gap-3">
                        <div class="flex-1">
                            <h3 class="font-semibold text-foreground">{{ game.name }}</h3>
                            <div class="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <Users class="h-3 w-3" />
                                <span>{{ game.minPlayers }}-{{ game.maxPlayers }}</span>
                                <span v-if="game.style" class="px-2 py-0.5 bg-muted rounded text-xs">
                                    {{ getStyleLabel(game.style) }}
                                </span>
                            </div>
                            <div class="flex flex-wrap gap-1 mt-2">
                                <UiBadge v-if="game.isBorrowed" variant="warning">
                                    {{ t('library.lentTo', { name: game.borrowedTo }) }}
                                </UiBadge>
                                <UiBadge v-if="game.forSale" variant="secondary">
                                    <DollarSign class="h-3 w-3 mr-1" />
                                    {{ t('library.forSale') }}
                                </UiBadge>
                            </div>
                        </div>
                        <div class="flex gap-1">
                            <UiIconButton variant="ghost" size="sm" @click="startEdit(game)">
                                <Pencil class="h-4 w-4" />
                            </UiIconButton>
                            <UiIconButton variant="destructive" size="sm" @click="showDeleteConfirm = game.id">
                                <Trash2 class="h-4 w-4" />
                            </UiIconButton>
                        </div>
                    </div>

                    <div class="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
                        <UiButton
                            v-if="!game.isBorrowed"
                            variant="outline"
                            size="sm"
                            @click="borrowingGameId = game.id"
                        >
                            {{ t('library.lend') }}
                        </UiButton>
                        <UiButton
                            v-else
                            variant="outline"
                            size="sm"
                            @click="handleReturn(game.id)"
                        >
                            {{ t('library.return') }}
                        </UiButton>
                        <UiButton
                            :variant="game.forSale ? 'default' : 'outline'"
                            size="sm"
                            @click="toggleForSale(game)"
                        >
                            <DollarSign class="h-3 w-3 mr-1" />
                            {{ game.forSale ? t('library.notForSale') : t('library.markForSale') }}
                        </UiButton>
                        <UiButton
                            v-if="getLoanHistory(game.id).length > 0"
                            variant="ghost"
                            size="sm"
                            @click="toggleHistory(game.id)"
                        >
                            <History class="h-3 w-3 mr-1" />
                            {{ t('library.history') }}
                            <ChevronUp v-if="showHistoryGameId === game.id" class="h-3 w-3 ml-1" />
                            <ChevronDown v-else class="h-3 w-3 ml-1" />
                        </UiButton>
                    </div>

                    <div
                        v-if="showHistoryGameId === game.id"
                        class="mt-3 pt-3 border-t border-border"
                    >
                        <h4 class="text-sm font-medium mb-2">{{ t('library.loanHistory') }}</h4>
                        <div class="space-y-2">
                            <div
                                v-for="entry in getLoanHistory(game.id)"
                                :key="entry.id"
                                class="flex items-center justify-between text-sm p-2 bg-muted rounded"
                            >
                                <span class="font-medium">{{ entry.borrower }}</span>
                                <span class="text-muted-foreground">
                                    {{ formatDate(entry.lentAt) }}
                                    <template v-if="entry.returnedAt">
                                        → {{ formatDate(entry.returnedAt) }}
                                    </template>
                                    <UiBadge v-else variant="warning" class="ml-2">
                                        {{ t('library.ongoing') }}
                                    </UiBadge>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div
                        v-if="borrowingGameId === game.id"
                        class="flex gap-2 mt-3 pt-3 border-t border-border"
                    >
                        <UiInput
                            v-model="borrowerName"
                            :placeholder="t('library.borrowerName')"
                            class="flex-1"
                            @keyup.enter="handleBorrow(game.id)"
                        />
                        <UiButton size="sm" @click="handleBorrow(game.id)">
                            {{ t('common.save') }}
                        </UiButton>
                        <UiButton variant="ghost" size="sm" @click="borrowingGameId = null">
                            {{ t('common.cancel') }}
                        </UiButton>
                    </div>

                    <div
                        v-if="showDeleteConfirm === game.id"
                        class="flex items-center gap-2 mt-3 pt-3 border-t border-border"
                    >
                        <span class="flex-1 text-sm text-muted-foreground">
                            {{ t('library.deleteConfirm', { name: game.name }) }}
                        </span>
                        <UiButton size="sm" variant="destructive" @click="handleDelete(game.id)">
                            {{ t('common.delete') }}
                        </UiButton>
                        <UiButton size="sm" variant="ghost" @click="showDeleteConfirm = null">
                            {{ t('common.cancel') }}
                        </UiButton>
                    </div>
                </UiCard>
            </div>

            <div v-else-if="games.length === 0" class="text-center py-12">
                <p class="text-muted-foreground mb-4">{{ t('library.empty') }}</p>
                <UiButton @click="showAddForm = true">
                    <Plus class="h-4 w-4 mr-2" />
                    {{ t('library.addFirst') }}
                </UiButton>
            </div>

            <p v-else class="text-center text-muted-foreground py-8">
                {{ t('library.noResults') }}
            </p>
        </div>
    </div>
</template>
