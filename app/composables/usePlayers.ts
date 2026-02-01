import type { IPlayer } from '~/types'

const STORAGE_KEY = 'gamepal-players'

const players = ref<IPlayer[]>([])
const isInitialized = ref(false)

export function usePlayers() {
    function init(): void {
        if (isInitialized.value) return

        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                try {
                    players.value = JSON.parse(stored)
                } catch {
                    players.value = []
                }
            }
        }
        isInitialized.value = true
    }

    function save(): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(players.value))
        }
    }

    function addPlayer(name: string, color?: string): IPlayer {
        const player: IPlayer = {
            id: generateId(),
            name: name.trim(),
            color: color ?? getColorByIndex(players.value.length),
        }
        players.value.push(player)
        save()
        return player
    }

    function updatePlayer(id: string, updates: Partial<Omit<IPlayer, 'id'>>): void {
        const player = players.value.find(p => p.id === id)
        if (player) {
            if (updates.name !== undefined) player.name = updates.name.trim()
            if (updates.color !== undefined) player.color = updates.color
            if (updates.avatar !== undefined) player.avatar = updates.avatar
            save()
        }
    }

    function deletePlayer(id: string): void {
        const index = players.value.findIndex(p => p.id === id)
        if (index !== -1) {
            players.value.splice(index, 1)
            save()
        }
    }

    function getPlayer(id: string): IPlayer | null {
        return players.value.find(p => p.id === id) ?? null
    }

    function getPlayersByIds(ids: string[]): IPlayer[] {
        return ids.map(id => getPlayer(id)).filter((p): p is IPlayer => p !== null)
    }

    init()

    return {
        players: readonly(players),
        addPlayer,
        updatePlayer,
        deletePlayer,
        getPlayer,
        getPlayersByIds,
    }
}
