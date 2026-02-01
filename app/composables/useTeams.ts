import type { ITeam } from '~/types'

const STORAGE_KEY = 'gamepal-teams'

const teams = ref<ITeam[]>([])
const isInitialized = ref(false)

export function useTeams() {
    function init(): void {
        if (isInitialized.value) return

        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                try {
                    teams.value = JSON.parse(stored)
                } catch {
                    teams.value = []
                }
            }
        }
        isInitialized.value = true
    }

    function save(): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(teams.value))
        }
    }

    function addTeam(name: string, color?: string): ITeam {
        const team: ITeam = {
            id: generateId(),
            name: name.trim(),
            color: color ?? getColorByIndex(teams.value.length),
            playerIds: [],
        }
        teams.value.push(team)
        save()
        return team
    }

    function updateTeam(id: string, updates: Partial<Omit<ITeam, 'id'>>): void {
        const team = teams.value.find(t => t.id === id)
        if (team) {
            if (updates.name !== undefined) team.name = updates.name.trim()
            if (updates.color !== undefined) team.color = updates.color
            if (updates.playerIds !== undefined) team.playerIds = updates.playerIds
            save()
        }
    }

    function deleteTeam(id: string): void {
        const index = teams.value.findIndex(t => t.id === id)
        if (index !== -1) {
            teams.value.splice(index, 1)
            save()
        }
    }

    function getTeam(id: string): ITeam | null {
        return teams.value.find(t => t.id === id) ?? null
    }

    function addPlayerToTeam(teamId: string, playerId: string): void {
        const team = teams.value.find(t => t.id === teamId)
        if (team && !team.playerIds.includes(playerId)) {
            for (const t of teams.value) {
                const idx = t.playerIds.indexOf(playerId)
                if (idx !== -1) t.playerIds.splice(idx, 1)
            }
            team.playerIds.push(playerId)
            save()
        }
    }

    function removePlayerFromTeam(teamId: string, playerId: string): void {
        const team = teams.value.find(t => t.id === teamId)
        if (team) {
            const idx = team.playerIds.indexOf(playerId)
            if (idx !== -1) {
                team.playerIds.splice(idx, 1)
                save()
            }
        }
    }

    function removePlayerFromAllTeams(playerId: string): void {
        for (const team of teams.value) {
            const idx = team.playerIds.indexOf(playerId)
            if (idx !== -1) team.playerIds.splice(idx, 1)
        }
        save()
    }

    function getPlayerTeam(playerId: string): ITeam | null {
        return teams.value.find(t => t.playerIds.includes(playerId)) ?? null
    }

    init()

    return {
        teams: readonly(teams),
        addTeam,
        updateTeam,
        deleteTeam,
        getTeam,
        addPlayerToTeam,
        removePlayerFromTeam,
        removePlayerFromAllTeams,
        getPlayerTeam,
    }
}
