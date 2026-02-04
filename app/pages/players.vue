<script setup lang="ts">
import { ArrowLeft, Plus, X, Users, Pencil, Check, Trash2, Play, History } from 'lucide-vue-next'
import type { IPlayer } from '~/types'

const { t } = useI18n()
const { players, addPlayer, updatePlayer, deletePlayer } = usePlayers()
const { teams, addTeam, deleteTeam, addPlayerToTeam, removePlayerFromAllTeams, getPlayerTeam } = useTeams()
const { sessions, currentSession, createSession, updateSession, deleteSession, loadSession, unloadSession } = useGameSessions()

type ViewMode = 'players' | 'teams' | 'sessions'

const viewMode = ref<ViewMode>('players')
const newPlayerName = ref('')
const newTeamName = ref('')
const editingPlayerId = ref<string | null>(null)
const editingPlayerName = ref('')
const editingTeamId = ref<string | null>(null)
const editingTeamName = ref('')
const assigningPlayerId = ref<string | null>(null)
const showDeleteConfirm = ref<string | null>(null)

const showCreateSession = ref(false)
const newSessionName = ref('')
const selectedPlayerIds = ref<string[]>([])
const selectedTeamIds = ref<string[]>([])
const editingSessionId = ref<string | null>(null)

function handleAddPlayer(): void {
    const name = newPlayerName.value.trim()
    if (name === '') return
    addPlayer(name)
    newPlayerName.value = ''
}

function handleAddTeam(): void {
    const name = newTeamName.value.trim()
    if (name === '') return
    addTeam(name)
    newTeamName.value = ''
}

function startEditPlayer(player: IPlayer): void {
    editingPlayerId.value = player.id
    editingPlayerName.value = player.name
}

function saveEditPlayer(): void {
    if (editingPlayerId.value && editingPlayerName.value.trim()) {
        updatePlayer(editingPlayerId.value, { name: editingPlayerName.value })
    }
    editingPlayerId.value = null
    editingPlayerName.value = ''
}

function cancelEditPlayer(): void {
    editingPlayerId.value = null
    editingPlayerName.value = ''
}

function startEditTeam(team: { id: string; name: string }): void {
    editingTeamId.value = team.id
    editingTeamName.value = team.name
}

function saveEditTeam(): void {
    if (editingTeamId.value && editingTeamName.value.trim()) {
        const { updateTeam } = useTeams()
        updateTeam(editingTeamId.value, { name: editingTeamName.value })
    }
    editingTeamId.value = null
    editingTeamName.value = ''
}

function cancelEditTeam(): void {
    editingTeamId.value = null
    editingTeamName.value = ''
}

function handleDeletePlayer(id: string): void {
    removePlayerFromAllTeams(id)
    deletePlayer(id)
    showDeleteConfirm.value = null
}

function handleDeleteTeam(id: string): void {
    deleteTeam(id)
    showDeleteConfirm.value = null
}

function toggleAssignPlayer(playerId: string): void {
    assigningPlayerId.value = assigningPlayerId.value === playerId ? null : playerId
}

function handleAssignToTeam(playerId: string, teamId: string): void {
    addPlayerToTeam(teamId, playerId)
    assigningPlayerId.value = null
}

function handleRemoveFromTeam(playerId: string): void {
    removePlayerFromAllTeams(playerId)
    assigningPlayerId.value = null
}

function getTeamPlayersCount(teamId: string): number {
    const team = teams.value.find(t => t.id === teamId)
    return team?.playerIds.length ?? 0
}

function getUnassignedPlayers(): IPlayer[] {
    return players.value.filter(p => !getPlayerTeam(p.id))
}

function openCreateSession(): void {
    showCreateSession.value = true
    newSessionName.value = ''
    selectedPlayerIds.value = []
    selectedTeamIds.value = []
    editingSessionId.value = null
}

function openEditSession(sessionId: string): void {
    const session = sessions.value.find(s => s.id === sessionId)
    if (!session) return

    showCreateSession.value = true
    newSessionName.value = session.name
    selectedPlayerIds.value = [...session.playerIds]
    selectedTeamIds.value = [...session.teamIds]
    editingSessionId.value = sessionId
}

function togglePlayerInSession(playerId: string): void {
    const index = selectedPlayerIds.value.indexOf(playerId)
    if (index !== -1) {
        selectedPlayerIds.value.splice(index, 1)
    } else {
        selectedPlayerIds.value.push(playerId)
    }
}

function toggleTeamInSession(teamId: string): void {
    const index = selectedTeamIds.value.indexOf(teamId)
    if (index !== -1) {
        selectedTeamIds.value.splice(index, 1)
    } else {
        selectedTeamIds.value.push(teamId)
    }
}

function handleSaveSession(): void {
    const name = newSessionName.value.trim()
    if (name === '' || selectedPlayerIds.value.length === 0) return

    if (editingSessionId.value) {
        updateSession(editingSessionId.value, {
            name,
            playerIds: selectedPlayerIds.value,
            teamIds: selectedTeamIds.value,
        })
    } else {
        createSession(name, selectedPlayerIds.value, selectedTeamIds.value)
    }
    cancelCreateSession()
}

function cancelCreateSession(): void {
    showCreateSession.value = false
    newSessionName.value = ''
    selectedPlayerIds.value = []
    selectedTeamIds.value = []
    editingSessionId.value = null
}

function handleDeleteSession(id: string): void {
    deleteSession(id)
    showDeleteConfirm.value = null
}

function handleLoadSession(id: string): void {
    loadSession(id)
}

function handleUnloadSession(): void {
    unloadSession()
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString()
}
</script>

<template>
    <div class="min-h-dvh bg-background">
        <header class="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border">
            <div class="flex items-center gap-4 px-4 py-4">
                <NuxtLink
                    to="/"
                    class="players-page__back flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
                    {{ t('players.title') }}
                </h1>
            </div>
        </header>

        <div class="p-4 space-y-6">
            <UiTabs
                :tabs="[
                    { value: 'players', label: t('players.players') },
                    { value: 'teams', label: t('players.teams') },
                    { value: 'sessions', label: t('players.sessions'), icon: History },
                ]"
                :model-value="viewMode"
                v-motion
                :initial="{ opacity: 0, y: 10 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 150 } }"
                @update:model-value="viewMode = $event as ViewMode"
            />

            <div v-if="viewMode === 'players'">
                <section
                    v-motion
                    :initial="{ opacity: 0, y: 20 }"
                    :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
                >
                    <div class="flex gap-2 mb-4">
                        <UiInput
                            v-model="newPlayerName"
                            :placeholder="t('players.newPlayerName')"
                            class="flex-1"
                            @keyup.enter="handleAddPlayer"
                        />
                        <UiButton @click="handleAddPlayer">
                            <Plus class="h-4 w-4" />
                            {{ t('common.add') }}
                        </UiButton>
                    </div>

                    <div v-if="players.length > 0" class="space-y-2">
                        <UiCard
                            v-for="(player, index) in players"
                            :key="player.id"
                            v-motion
                            :initial="{ opacity: 0, x: -20 }"
                            :enter="{ opacity: 1, x: 0, transition: { delay: 250 + index * 30 } }"
                            class="player-card p-3"
                        >
                            <div class="flex items-center gap-3">
                                <span
                                    class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                    :style="{ backgroundColor: player.color }"
                                >
                                    {{ player.name.charAt(0).toUpperCase() }}
                                </span>

                                <template v-if="editingPlayerId === player.id">
                                    <UiInput
                                        v-model="editingPlayerName"
                                        class="flex-1"
                                        @keyup.enter="saveEditPlayer"
                                        @keyup.escape="cancelEditPlayer"
                                    />
                                    <UiIconButton size="sm" @click="saveEditPlayer">
                                        <Check class="h-4 w-4" />
                                    </UiIconButton>
                                    <UiIconButton variant="ghost" size="sm" @click="cancelEditPlayer">
                                        <X class="h-4 w-4" />
                                    </UiIconButton>
                                </template>

                                <template v-else>
                                    <span class="flex-1 font-medium">{{ player.name }}</span>
                                    <UiBadge
                                        v-if="getPlayerTeam(player.id)"
                                        :style="{ backgroundColor: getPlayerTeam(player.id)?.color }"
                                    >
                                        {{ getPlayerTeam(player.id)?.name }}
                                    </UiBadge>
                                    <UiIconButton variant="ghost" size="sm" @click="startEditPlayer(player)">
                                        <Pencil class="h-4 w-4" />
                                    </UiIconButton>
                                    <UiIconButton
                                        v-if="teams.length > 0"
                                        variant="ghost"
                                        size="sm"
                                        @click="toggleAssignPlayer(player.id)"
                                    >
                                        <Users class="h-4 w-4" />
                                    </UiIconButton>
                                    <UiIconButton
                                        variant="destructive"
                                        size="sm"
                                        @click="showDeleteConfirm = player.id"
                                    >
                                        <Trash2 class="h-4 w-4" />
                                    </UiIconButton>
                                </template>
                            </div>

                            <div
                                v-if="assigningPlayerId === player.id"
                                class="flex flex-wrap gap-2 pt-3 mt-3 border-t border-border"
                            >
                                <UiButton
                                    v-for="team in teams"
                                    :key="team.id"
                                    variant="outline"
                                    size="sm"
                                    :style="{ borderColor: team.color }"
                                    @click="handleAssignToTeam(player.id, team.id)"
                                >
                                    {{ team.name }}
                                </UiButton>
                                <UiButton
                                    v-if="getPlayerTeam(player.id)"
                                    variant="ghost"
                                    size="sm"
                                    @click="handleRemoveFromTeam(player.id)"
                                >
                                    {{ t('players.removeFromTeam') }}
                                </UiButton>
                            </div>

                            <div
                                v-if="showDeleteConfirm === player.id"
                                class="flex items-center gap-2 pt-3 mt-3 border-t border-border"
                            >
                                <span class="flex-1 text-sm text-muted-foreground">
                                    {{ t('players.deleteConfirm', { name: player.name }) }}
                                </span>
                                <UiButton size="sm" variant="destructive" @click="handleDeletePlayer(player.id)">
                                    {{ t('common.delete') }}
                                </UiButton>
                                <UiButton size="sm" variant="ghost" @click="showDeleteConfirm = null">
                                    {{ t('common.cancel') }}
                                </UiButton>
                            </div>
                        </UiCard>
                    </div>

                    <p v-else class="text-center text-muted-foreground py-12">
                        {{ t('players.noPlayers') }}
                    </p>
                </section>
            </div>

            <div v-else-if="viewMode === 'teams'">
                <section
                    v-motion
                    :initial="{ opacity: 0, y: 20 }"
                    :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
                >
                    <div class="flex gap-2 mb-4">
                        <UiInput
                            v-model="newTeamName"
                            :placeholder="t('players.newTeamName')"
                            class="flex-1"
                            @keyup.enter="handleAddTeam"
                        />
                        <UiButton @click="handleAddTeam">
                            <Plus class="h-4 w-4" />
                            {{ t('common.add') }}
                        </UiButton>
                    </div>

                    <div v-if="teams.length > 0" class="space-y-3">
                        <UiCard
                            v-for="(team, index) in teams"
                            :key="team.id"
                            v-motion
                            :initial="{ opacity: 0, x: -20 }"
                            :enter="{ opacity: 1, x: 0, transition: { delay: 250 + index * 30 } }"
                            class="team-card p-4"
                        >
                            <div class="flex items-center gap-3 mb-3">
                                <span
                                    class="w-4 h-4 rounded-full"
                                    :style="{ backgroundColor: team.color }"
                                ></span>

                                <template v-if="editingTeamId === team.id">
                                    <UiInput
                                        v-model="editingTeamName"
                                        class="flex-1"
                                        @keyup.enter="saveEditTeam"
                                        @keyup.escape="cancelEditTeam"
                                    />
                                    <UiIconButton size="sm" @click="saveEditTeam">
                                        <Check class="h-4 w-4" />
                                    </UiIconButton>
                                    <UiIconButton variant="ghost" size="sm" @click="cancelEditTeam">
                                        <X class="h-4 w-4" />
                                    </UiIconButton>
                                </template>

                                <template v-else>
                                    <span class="flex-1 font-semibold">{{ team.name }}</span>
                                    <UiBadge variant="secondary">
                                        {{ getTeamPlayersCount(team.id) }} {{ t('players.members') }}
                                    </UiBadge>
                                    <UiIconButton variant="ghost" size="sm" @click="startEditTeam(team)">
                                        <Pencil class="h-4 w-4" />
                                    </UiIconButton>
                                    <UiIconButton
                                        variant="destructive"
                                        size="sm"
                                        @click="showDeleteConfirm = team.id"
                                    >
                                        <Trash2 class="h-4 w-4" />
                                    </UiIconButton>
                                </template>
                            </div>

                            <div v-if="team.playerIds.length > 0" class="flex flex-wrap gap-1">
                                <UiBadge
                                    v-for="playerId in team.playerIds"
                                    :key="playerId"
                                    variant="default"
                                >
                                    {{ players.find(p => p.id === playerId)?.name }}
                                </UiBadge>
                            </div>
                            <p v-else class="text-sm text-muted-foreground">
                                {{ t('players.noMembers') }}
                            </p>

                            <div
                                v-if="showDeleteConfirm === team.id"
                                class="flex items-center gap-2 pt-3 mt-3 border-t border-border"
                            >
                                <span class="flex-1 text-sm text-muted-foreground">
                                    {{ t('players.deleteTeamConfirm', { name: team.name }) }}
                                </span>
                                <UiButton size="sm" variant="destructive" @click="handleDeleteTeam(team.id)">
                                    {{ t('common.delete') }}
                                </UiButton>
                                <UiButton size="sm" variant="ghost" @click="showDeleteConfirm = null">
                                    {{ t('common.cancel') }}
                                </UiButton>
                            </div>
                        </UiCard>
                    </div>

                    <p v-else class="text-center text-muted-foreground py-12">
                        {{ t('players.noTeams') }}
                    </p>

                    <div v-if="getUnassignedPlayers().length > 0 && teams.length > 0" class="mt-6">
                        <h3 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                            {{ t('players.unassigned') }}
                        </h3>
                        <div class="flex flex-wrap gap-2">
                            <UiBadge
                                v-for="player in getUnassignedPlayers()"
                                :key="player.id"
                                variant="outline"
                            >
                                {{ player.name }}
                            </UiBadge>
                        </div>
                    </div>
                </section>
            </div>

            <div v-else-if="viewMode === 'sessions'">
                <section
                    v-motion
                    :initial="{ opacity: 0, y: 20 }"
                    :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
                >
                    <div v-if="currentSession" class="mb-6">
                        <UiCard class="current-session p-4 ring-2 ring-primary">
                            <div class="flex items-center gap-3 mb-3">
                                <Play class="h-5 w-5 text-primary" />
                                <span class="flex-1 font-semibold text-primary">{{ currentSession.name }}</span>
                                <UiButton size="sm" variant="outline" @click="handleUnloadSession">
                                    {{ t('players.endSession') }}
                                </UiButton>
                            </div>
                            <div class="flex flex-wrap gap-1">
                                <UiBadge
                                    v-for="playerId in currentSession.playerIds"
                                    :key="playerId"
                                    variant="default"
                                >
                                    {{ players.find(p => p.id === playerId)?.name }}
                                </UiBadge>
                            </div>
                        </UiCard>
                    </div>

                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {{ t('players.sessionHistory') }}
                        </h2>
                        <UiButton size="sm" @click="openCreateSession">
                            <Plus class="h-4 w-4 mr-1" />
                            {{ t('players.newSession') }}
                        </UiButton>
                    </div>

                    <div v-if="sessions.length > 0" class="space-y-3">
                        <UiCard
                            v-for="(session, index) in sessions"
                            :key="session.id"
                            v-motion
                            :initial="{ opacity: 0, x: -20 }"
                            :enter="{ opacity: 1, x: 0, transition: { delay: 250 + index * 30 } }"
                            class="session-card p-4"
                            :class="{ 'opacity-50': currentSession?.id === session.id }"
                        >
                            <div class="flex items-center gap-3 mb-2">
                                <span class="flex-1 font-semibold">{{ session.name }}</span>
                                <span class="text-xs text-muted-foreground">{{ formatDate(session.lastUsedAt) }}</span>
                            </div>
                            <div class="flex flex-wrap gap-1 mb-3">
                                <UiBadge
                                    v-for="playerId in session.playerIds"
                                    :key="playerId"
                                    variant="secondary"
                                >
                                    {{ players.find(p => p.id === playerId)?.name ?? t('players.unknownPlayer') }}
                                </UiBadge>
                            </div>
                            <div class="flex gap-2 pt-3 border-t border-border">
                                <UiButton
                                    v-if="currentSession?.id !== session.id"
                                    size="sm"
                                    class="flex-1"
                                    @click="handleLoadSession(session.id)"
                                >
                                    <Play class="h-4 w-4 mr-1" />
                                    {{ t('players.loadSession') }}
                                </UiButton>
                                <UiButton
                                    variant="outline"
                                    size="sm"
                                    @click="openEditSession(session.id)"
                                >
                                    <Pencil class="h-4 w-4" />
                                </UiButton>
                                <UiButton
                                    variant="outline"
                                    size="sm"
                                    class="text-destructive hover:text-destructive"
                                    @click="showDeleteConfirm = session.id"
                                >
                                    <Trash2 class="h-4 w-4" />
                                </UiButton>
                            </div>

                            <div
                                v-if="showDeleteConfirm === session.id"
                                class="flex items-center gap-2 pt-3 mt-3 border-t border-border"
                            >
                                <span class="flex-1 text-sm text-muted-foreground">
                                    {{ t('players.deleteSessionConfirm', { name: session.name }) }}
                                </span>
                                <UiButton size="sm" variant="destructive" @click="handleDeleteSession(session.id)">
                                    {{ t('common.delete') }}
                                </UiButton>
                                <UiButton size="sm" variant="ghost" @click="showDeleteConfirm = null">
                                    {{ t('common.cancel') }}
                                </UiButton>
                            </div>
                        </UiCard>
                    </div>

                    <p v-else class="text-center text-muted-foreground py-12">
                        {{ t('players.noSessions') }}
                    </p>
                </section>
            </div>
        </div>

        <Teleport to="body">
            <div
                v-if="showCreateSession"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                @click.self="cancelCreateSession"
            >
                <UiCard class="create-session-modal w-full max-w-md p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-semibold">
                            {{ editingSessionId ? t('players.editSession') : t('players.newSession') }}
                        </h3>
                        <button
                            class="p-1 text-muted-foreground hover:text-foreground transition-colors"
                            @click="cancelCreateSession"
                        >
                            <X class="h-5 w-5" />
                        </button>
                    </div>

                    <div>
                        <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                            {{ t('players.sessionName') }}
                        </label>
                        <UiInput
                            v-model="newSessionName"
                            :placeholder="t('players.sessionNamePlaceholder')"
                        />
                    </div>

                    <div>
                        <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                            {{ t('players.selectPlayers') }} ({{ selectedPlayerIds.length }})
                        </label>
                        <div v-if="players.length > 0" class="flex flex-wrap gap-2">
                            <button
                                v-for="player in players"
                                :key="player.id"
                                class="px-3 py-2 rounded-lg text-sm transition-all"
                                :class="selectedPlayerIds.includes(player.id)
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'"
                                @click="togglePlayerInSession(player.id)"
                            >
                                {{ player.name }}
                            </button>
                        </div>
                        <p v-else class="text-sm text-muted-foreground">
                            {{ t('players.noPlayersToSelect') }}
                        </p>
                    </div>

                    <div v-if="teams.length > 0">
                        <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                            {{ t('players.selectTeams') }}
                        </label>
                        <div class="flex flex-wrap gap-2">
                            <button
                                v-for="team in teams"
                                :key="team.id"
                                class="px-3 py-2 rounded-lg text-sm transition-all"
                                :class="selectedTeamIds.includes(team.id)
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'"
                                @click="toggleTeamInSession(team.id)"
                            >
                                {{ team.name }}
                            </button>
                        </div>
                    </div>

                    <div class="flex gap-2 pt-4">
                        <UiButton
                            class="flex-1"
                            :disabled="!newSessionName.trim() || selectedPlayerIds.length === 0"
                            @click="handleSaveSession"
                        >
                            {{ t('common.save') }}
                        </UiButton>
                        <UiButton variant="outline" @click="cancelCreateSession">
                            {{ t('common.cancel') }}
                        </UiButton>
                    </div>
                </UiCard>
            </div>
        </Teleport>
    </div>
</template>
