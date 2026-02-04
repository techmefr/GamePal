import type { IGameSession } from '~/types'

const STORAGE_KEY = 'gamepal-game-sessions'

const sessions = ref<IGameSession[]>([])
const currentSessionId = ref<string | null>(null)
const isLoaded = ref(false)

function load(): void {
    if (import.meta.client && !isLoaded.value) {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                sessions.value = JSON.parse(stored)
            }
            const currentId = localStorage.getItem(`${STORAGE_KEY}-current`)
            if (currentId) {
                currentSessionId.value = currentId
            }
        } catch (_e) {
            sessions.value = []
        }
        isLoaded.value = true
    }
}

function save(): void {
    if (import.meta.client) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.value))
            if (currentSessionId.value) {
                localStorage.setItem(`${STORAGE_KEY}-current`, currentSessionId.value)
            } else {
                localStorage.removeItem(`${STORAGE_KEY}-current`)
            }
        } catch (_e) {
            console.warn('Failed to save game sessions')
        }
    }
}

export function useGameSessions() {
    onMounted(load)

    const currentSession = computed((): IGameSession | null => {
        if (!currentSessionId.value) return null
        return sessions.value.find(s => s.id === currentSessionId.value) ?? null
    })

    function createSession(name: string, playerIds: string[], teamIds: string[] = []): IGameSession {
        const session: IGameSession = {
            id: generateId(),
            name: name.trim(),
            playerIds: [...playerIds],
            teamIds: [...teamIds],
            createdAt: new Date().toISOString(),
            lastUsedAt: new Date().toISOString(),
        }
        sessions.value.unshift(session)
        save()
        return session
    }

    function updateSession(id: string, updates: Partial<Pick<IGameSession, 'name' | 'playerIds' | 'teamIds'>>): void {
        const session = sessions.value.find(s => s.id === id)
        if (!session) return

        if (updates.name !== undefined) session.name = updates.name.trim()
        if (updates.playerIds !== undefined) session.playerIds = [...updates.playerIds]
        if (updates.teamIds !== undefined) session.teamIds = [...updates.teamIds]
        session.lastUsedAt = new Date().toISOString()
        save()
    }

    function deleteSession(id: string): void {
        const index = sessions.value.findIndex(s => s.id === id)
        if (index !== -1) {
            sessions.value.splice(index, 1)
            if (currentSessionId.value === id) {
                currentSessionId.value = null
            }
            save()
        }
    }

    function loadSession(id: string): IGameSession | null {
        const session = sessions.value.find(s => s.id === id)
        if (!session) return null

        currentSessionId.value = id
        session.lastUsedAt = new Date().toISOString()
        save()
        return session
    }

    function unloadSession(): void {
        currentSessionId.value = null
        save()
    }

    function getSession(id: string): IGameSession | null {
        return sessions.value.find(s => s.id === id) ?? null
    }

    return {
        sessions: readonly(sessions),
        currentSession,
        currentSessionId: readonly(currentSessionId),
        createSession,
        updateSession,
        deleteSession,
        loadSession,
        unloadSession,
        getSession,
    }
}
