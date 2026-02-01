<script setup lang="ts">
import { ArrowLeft, Plus, X, Users, User, Pencil, Check, Trash2 } from 'lucide-vue-next'
import type { IPlayer } from '~/types'

const { t } = useI18n()
const { players, addPlayer, updatePlayer, deletePlayer } = usePlayers()
const { teams, addTeam, deleteTeam, addPlayerToTeam, removePlayerFromAllTeams, getPlayerTeam } = useTeams()

type ViewMode = 'players' | 'teams'

const viewMode = ref<ViewMode>('players')
const newPlayerName = ref('')
const newTeamName = ref('')
const editingPlayerId = ref<string | null>(null)
const editingPlayerName = ref('')
const editingTeamId = ref<string | null>(null)
const editingTeamName = ref('')
const assigningPlayerId = ref<string | null>(null)
const showDeleteConfirm = ref<string | null>(null)

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

            <div v-else>
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
        </div>
    </div>
</template>
