<script setup lang="ts">
import { ArrowLeft, Plus, X, Users, Shuffle, Play, CheckSquare, Square } from 'lucide-vue-next'
import type { ITouchPoint } from '~/types'

const { t } = useI18n()
const { players, addPlayer } = usePlayers()
const { teams, addTeam, deleteTeam, addPlayerToTeam, removePlayerFromAllTeams, getPlayerTeam } = useTeams()

type PickerMode = 'touch' | 'list'
type DrawMode = 'player' | 'team'

const mode = ref<PickerMode>('touch')
const drawMode = ref<DrawMode>('player')
const touchPoints = ref<ITouchPoint[]>([])
const selectedPoint = ref<ITouchPoint | null>(null)
const isSelecting = ref(false)
const selectionTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

const { data: activePlayerIds } = useLocalStorage<string[]>('gamepal-picker-active', [])
const newPlayerName = ref('')
const newTeamName = ref('')
const selectedResult = ref<string | null>(null)
const turnOrderResult = ref<string[]>([])
const isListSelecting = ref(false)
const showTeamManager = ref(false)
const editingPlayerId = ref<string | null>(null)

const SELECTION_DELAY = 3000
const MIN_POINTS_FOR_SELECTION = 2

onMounted(() => {
    if (activePlayerIds.value.length === 0 && players.value.length > 0) {
        activePlayerIds.value = players.value.map(p => p.id)
    }
})

watch(players, (newPlayers) => {
    activePlayerIds.value = activePlayerIds.value.filter(id =>
        newPlayers.some(p => p.id === id)
    )
    for (const player of newPlayers) {
        if (!activePlayerIds.value.includes(player.id)) {
            activePlayerIds.value.push(player.id)
        }
    }
}, { deep: true })

const activePlayers = computed(() =>
    players.value.filter(p => activePlayerIds.value.includes(p.id))
)

const activeTeams = computed(() => {
    return teams.value.filter(team => {
        const teamPlayers = team.playerIds.filter(id => activePlayerIds.value.includes(id))
        return teamPlayers.length > 0
    })
})

const unassignedPlayers = computed(() =>
    players.value.filter(p => !getPlayerTeam(p.id))
)

const canDraw = computed((): boolean => {
    if (drawMode.value === 'team') return activeTeams.value.length >= 2
    return activePlayers.value.length >= 2
})

function isPlayerActive(playerId: string): boolean {
    return activePlayerIds.value.includes(playerId)
}

function handleTouchStart(event: TouchEvent): void {
    event.preventDefault()
    clearSelection()
    for (const touch of Array.from(event.changedTouches)) {
        touchPoints.value.push({
            id: touch.identifier,
            x: touch.clientX,
            y: touch.clientY,
            color: getRandomColor(),
        })
    }
    startSelectionTimer()
}

function handleTouchMove(event: TouchEvent): void {
    event.preventDefault()
    for (const touch of Array.from(event.changedTouches)) {
        const point = touchPoints.value.find(p => p.id === touch.identifier)
        if (point) {
            point.x = touch.clientX
            point.y = touch.clientY
        }
    }
}

function handleTouchEnd(event: TouchEvent): void {
    event.preventDefault()
    for (const touch of Array.from(event.changedTouches)) {
        const index = touchPoints.value.findIndex(p => p.id === touch.identifier)
        if (index !== -1) touchPoints.value.splice(index, 1)
    }
    if (touchPoints.value.length < MIN_POINTS_FOR_SELECTION) cancelSelectionTimer()
}

function startSelectionTimer(): void {
    cancelSelectionTimer()
    if (touchPoints.value.length >= MIN_POINTS_FOR_SELECTION) {
        selectionTimeout.value = setTimeout(() => selectRandomPoint(), SELECTION_DELAY)
    }
}

function cancelSelectionTimer(): void {
    if (selectionTimeout.value) {
        clearTimeout(selectionTimeout.value)
        selectionTimeout.value = null
    }
}

function selectRandomPoint(): void {
    if (touchPoints.value.length === 0) return
    isSelecting.value = true
    selectedPoint.value = pickRandom(touchPoints.value)
    setTimeout(() => {
        touchPoints.value = []
        isSelecting.value = false
    }, 2000)
}

function clearSelection(): void {
    selectedPoint.value = null
    isSelecting.value = false
}

function handleAddPlayer(): void {
    const name = newPlayerName.value.trim()
    if (name === '') return
    const player = addPlayer(name)
    activePlayerIds.value.push(player.id)
    newPlayerName.value = ''
}

function togglePlayerActive(id: string): void {
    const index = activePlayerIds.value.indexOf(id)
    if (index !== -1) {
        activePlayerIds.value.splice(index, 1)
    } else {
        activePlayerIds.value.push(id)
    }
}

function toggleAllPlayers(active: boolean): void {
    if (active) {
        activePlayerIds.value = players.value.map(p => p.id)
    } else {
        activePlayerIds.value = []
    }
}

function handleAddTeam(): void {
    const name = newTeamName.value.trim()
    if (name === '') return
    addTeam(name)
    newTeamName.value = ''
}

function handleRemoveTeam(id: string): void {
    deleteTeam(id)
}

function assignPlayerToTeam(playerId: string, teamId: string | null): void {
    if (teamId) {
        addPlayerToTeam(teamId, playerId)
    } else {
        removePlayerFromAllTeams(playerId)
    }
    editingPlayerId.value = null
}

function getTeamPlayers(teamId: string): typeof players.value {
    const team = teams.value.find(t => t.id === teamId)
    if (!team) return []
    return players.value.filter(p => team.playerIds.includes(p.id))
}

function pickRandomFromList(): void {
    if (!canDraw.value) return
    isListSelecting.value = true
    selectedResult.value = null
    turnOrderResult.value = []
    const items = drawMode.value === 'team'
        ? activeTeams.value.map(t => t.name)
        : activePlayers.value.map(p => p.name)
    let iterations = 0
    const interval = setInterval(() => {
        selectedResult.value = pickRandom(items)
        if (++iterations >= 15) {
            clearInterval(interval)
            isListSelecting.value = false
        }
    }, 100)
}

function generateTurnOrder(): void {
    if (!canDraw.value) return
    isListSelecting.value = true
    selectedResult.value = null
    turnOrderResult.value = []
    const items = drawMode.value === 'team'
        ? activeTeams.value.map(t => t.name)
        : activePlayers.value.map(p => p.name)
    setTimeout(() => {
        turnOrderResult.value = shuffleArray([...items])
        isListSelecting.value = false
    }, 500)
}

function switchMode(newMode: PickerMode): void {
    mode.value = newMode
    clearSelection()
    selectedResult.value = null
    turnOrderResult.value = []
}

function clearResults(): void {
    selectedResult.value = null
    turnOrderResult.value = []
}

onUnmounted(() => cancelSelectionTimer())
</script>

<template>
    <div class="min-h-dvh bg-background flex flex-col">
        <header class="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border">
            <div class="flex items-center gap-4 px-4 py-3">
                <NuxtLink
                    to="/"
                    class="picker__back flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                    <ArrowLeft class="h-5 w-5" />
                </NuxtLink>
                <h1 class="heading flex-1 font-display text-lg font-bold">{{ t('randomPicker.title') }}</h1>
                <UiTabs
                    :tabs="[
                        { value: 'touch', label: t('randomPicker.touch') },
                        { value: 'list', label: t('randomPicker.list') },
                    ]"
                    :model-value="mode"
                    class="picker__mode-switch"
                    @update:model-value="switchMode($event as PickerMode)"
                />
            </div>
        </header>

        <div v-if="mode === 'touch'" class="touch-zone flex-1 relative">
            <div
                class="touch-area absolute inset-0 touch-none select-none"
                @touchstart="handleTouchStart"
                @touchmove="handleTouchMove"
                @touchend="handleTouchEnd"
                @touchcancel="handleTouchEnd"
            >
                <p
                    v-if="touchPoints.length === 0"
                    class="touch-area__hint absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground text-lg text-center px-8"
                >
                    {{ t('randomPicker.touchHint') }}
                </p>

                <div
                    v-for="point in touchPoints"
                    :key="point.id"
                    class="touch-point absolute w-20 h-20 rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none"
                    :class="{
                        'scale-150 shadow-2xl z-10': selectedPoint?.id === point.id,
                        'opacity-30 scale-75': selectedPoint && selectedPoint.id !== point.id,
                    }"
                    :style="{ left: `${point.x}px`, top: `${point.y}px`, backgroundColor: point.color }"
                ></div>
            </div>

            <p
                v-if="touchPoints.length >= MIN_POINTS_FOR_SELECTION && !isSelecting"
                class="touch-zone__status absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground animate-pulse"
            >
                {{ t('randomPicker.holdStill') }}
            </p>
        </div>

        <div v-else class="list-zone flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
            <UiTabs
                :tabs="[
                    { value: 'player', label: t('randomPicker.drawPlayer') },
                    { value: 'team', label: t('randomPicker.drawTeam') },
                ]"
                :model-value="drawMode"
                class="list-zone__draw-modes"
                @update:model-value="drawMode = $event as DrawMode; clearResults()"
            />

            <div class="flex gap-2">
                <UiInput
                    v-model="newPlayerName"
                    :placeholder="t('randomPicker.playerName')"
                    class="list-zone__input flex-1"
                    @keyup.enter="handleAddPlayer"
                />
                <UiButton @click="handleAddPlayer">
                    <Plus class="h-4 w-4" />
                    {{ t('common.add') }}
                </UiButton>
            </div>

            <div v-if="players.length > 0" class="list-zone__toolbar flex gap-2 flex-wrap">
                <UiButton variant="outline" size="sm" @click="toggleAllPlayers(true)">
                    <CheckSquare class="h-4 w-4" />
                    {{ t('randomPicker.selectAll') }}
                </UiButton>
                <UiButton variant="outline" size="sm" @click="toggleAllPlayers(false)">
                    <Square class="h-4 w-4" />
                    {{ t('randomPicker.deselectAll') }}
                </UiButton>
                <UiButton
                    variant="outline"
                    size="sm"
                    class="toolbar-btn--teams ml-auto"
                    :class="{ 'bg-primary text-primary-foreground': showTeamManager }"
                    @click="showTeamManager = !showTeamManager"
                >
                    <Users class="h-4 w-4" />
                    {{ t('randomPicker.manageTeams') }}
                </UiButton>
            </div>

            <UiCard
                v-if="showTeamManager"
                v-motion
                :initial="{ opacity: 0, height: 0 }"
                :enter="{ opacity: 1, height: 'auto' }"
                class="team-manager p-4 space-y-4"
            >
                <h3 class="font-semibold">{{ t('randomPicker.teams') }}</h3>

                <div class="flex gap-2">
                    <UiInput
                        v-model="newTeamName"
                        :placeholder="t('randomPicker.teamName')"
                        class="flex-1"
                        @keyup.enter="handleAddTeam"
                    />
                    <UiButton size="sm" @click="handleAddTeam">
                        <Plus class="h-4 w-4" />
                    </UiButton>
                </div>

                <div v-if="teams.length > 0" class="space-y-2">
                    <div
                        v-for="team in teams"
                        :key="team.id"
                        class="team-item bg-muted rounded-lg p-3"
                    >
                        <div class="flex items-center gap-2 mb-2">
                            <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: team.color }"></span>
                            <span class="font-medium flex-1">{{ team.name }}</span>
                            <UiBadge variant="secondary">{{ getTeamPlayers(team.id).length }}</UiBadge>
                            <UiIconButton variant="destructive" size="sm" @click="handleRemoveTeam(team.id)">
                                <X class="h-4 w-4" />
                            </UiIconButton>
                        </div>
                        <div v-if="getTeamPlayers(team.id).length > 0" class="flex flex-wrap gap-1">
                            <UiBadge
                                v-for="player in getTeamPlayers(team.id)"
                                :key="player.id"
                                :variant="isPlayerActive(player.id) ? 'default' : 'secondary'"
                                :class="{ 'opacity-50 line-through': !isPlayerActive(player.id) }"
                            >
                                {{ player.name }}
                            </UiBadge>
                        </div>
                    </div>
                </div>

                <div v-if="unassignedPlayers.length > 0" class="pt-3 border-t border-border">
                    <p class="text-xs text-muted-foreground mb-2">{{ t('randomPicker.unassigned') }}</p>
                    <div class="flex flex-wrap gap-1">
                        <UiBadge
                            v-for="player in unassignedPlayers"
                            :key="player.id"
                            variant="outline"
                            :class="{ 'opacity-50': !isPlayerActive(player.id) }"
                        >
                            {{ player.name }}
                        </UiBadge>
                    </div>
                </div>
            </UiCard>

            <div v-if="players.length > 0" class="player-list space-y-2">
                <UiCard
                    v-for="(player, index) in players"
                    :key="player.id"
                    v-motion
                    :initial="{ opacity: 0, x: -20 }"
                    :enter="{ opacity: 1, x: 0, transition: { delay: index * 30 } }"
                    class="player-list__item p-3"
                    :class="{
                        'ring-2 ring-primary bg-primary/10': selectedResult === player.name,
                        'opacity-50': !isPlayerActive(player.id),
                    }"
                >
                    <div class="flex items-center gap-3">
                        <UiCheckbox
                            :model-value="isPlayerActive(player.id)"
                            class="player-list__toggle"
                            @update:model-value="togglePlayerActive(player.id)"
                        />
                        <span
                            class="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            :style="{ backgroundColor: player.color }"
                        >
                            {{ player.name.charAt(0).toUpperCase() }}
                        </span>
                        <span class="player-list__name flex-1 font-medium">{{ player.name }}</span>
                        <UiBadge
                            v-if="getPlayerTeam(player.id)"
                            class="player-list__team-badge"
                            :style="{ backgroundColor: getPlayerTeam(player.id)?.color }"
                        >
                            {{ getPlayerTeam(player.id)?.name }}
                        </UiBadge>
                        <div class="player-list__actions flex gap-1">
                            <UiButton
                                v-if="teams.length > 0"
                                variant="ghost"
                                size="sm"
                                class="player-list__assign text-xs"
                                @click="editingPlayerId = editingPlayerId === player.id ? null : player.id"
                            >
                                {{ getPlayerTeam(player.id) ? t('randomPicker.reassign') : t('randomPicker.assign') }}
                            </UiButton>
                        </div>
                    </div>
                    <div
                        v-if="editingPlayerId === player.id"
                        class="player-list__team-select flex flex-wrap gap-2 pt-3 mt-3 border-t border-border"
                    >
                        <UiButton
                            v-for="team in teams"
                            :key="team.id"
                            variant="outline"
                            size="sm"
                            :style="{ borderColor: team.color }"
                            @click="assignPlayerToTeam(player.id, team.id)"
                        >
                            {{ team.name }}
                        </UiButton>
                        <UiButton
                            v-if="getPlayerTeam(player.id)"
                            variant="ghost"
                            size="sm"
                            @click="assignPlayerToTeam(player.id, null)"
                        >
                            {{ t('randomPicker.noTeam') }}
                        </UiButton>
                    </div>
                </UiCard>
            </div>

            <p v-else class="list-zone__empty text-center text-muted-foreground py-8">
                {{ t('randomPicker.noPlayers') }}
            </p>

            <div v-if="players.length >= 2" class="list-zone__actions flex flex-col gap-3 mt-auto pt-4">
                <UiButton
                    :disabled="isListSelecting || !canDraw"
                    class="list-zone__pick-btn w-full"
                    @click="pickRandomFromList"
                >
                    <Play class="h-4 w-4" />
                    {{ isListSelecting ? t('randomPicker.picking') : t('randomPicker.pickRandom') }}
                </UiButton>
                <UiButton
                    variant="outline"
                    :disabled="isListSelecting || !canDraw"
                    class="list-zone__order-btn w-full"
                    @click="generateTurnOrder"
                >
                    <Shuffle class="h-4 w-4" />
                    {{ t('randomPicker.turnOrder') }}
                </UiButton>
            </div>

            <div
                v-if="selectedResult && !isListSelecting && turnOrderResult.length === 0"
                v-motion
                :initial="{ opacity: 0, scale: 0.8 }"
                :enter="{ opacity: 1, scale: 1 }"
                class="list-zone__result text-center py-8"
            >
                <p class="list-zone__winner font-display text-3xl font-bold text-primary">
                    {{ selectedResult }}
                </p>
            </div>

            <UiCard
                v-if="turnOrderResult.length > 0 && !isListSelecting"
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0 }"
                class="list-zone__turn-order p-4"
            >
                <h3 class="turn-order__title font-semibold text-center mb-4">{{ t('randomPicker.turnOrderResult') }}</h3>
                <ol class="turn-order__list space-y-2">
                    <li
                        v-for="(name, index) in turnOrderResult"
                        :key="index"
                        v-motion
                        :initial="{ opacity: 0, x: -20 }"
                        :enter="{ opacity: 1, x: 0, transition: { delay: index * 100 } }"
                        class="turn-order__item flex items-center gap-4 p-3 bg-muted rounded-lg"
                    >
                        <span class="turn-order__position w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-full font-bold text-sm">
                            {{ index + 1 }}
                        </span>
                        <span class="turn-order__name font-medium">{{ name }}</span>
                    </li>
                </ol>
            </UiCard>
        </div>
    </div>
</template>

<style scoped>
.touch-point {
    box-shadow: 0 0 30px currentColor;
}
</style>
