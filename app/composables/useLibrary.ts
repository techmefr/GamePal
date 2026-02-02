import type { IGame, ILoanHistoryEntry } from '~/types'

const STORAGE_KEY = 'gamepal-library'

const games = ref<IGame[]>([])
const isInitialized = ref(false)

function generateId(): string {
    return Math.random().toString(36).substring(2, 9)
}

export interface IGameFilters {
    search: string
    style: string | null
    mood: string | null
    minPlayers: number | null
    maxPlayers: number | null
    showOwned: boolean
    showBorrowed: boolean
    showForSale: boolean
}

export function useLibrary() {
    function init(): void {
        if (isInitialized.value) return

        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                try {
                    games.value = JSON.parse(stored)
                } catch {
                    games.value = []
                }
            }
        }
        isInitialized.value = true
    }

    function save(): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(games.value))
        }
    }

    function addGame(data: Omit<IGame, 'id' | 'createdAt' | 'loanHistory'>): IGame {
        const game: IGame = {
            id: generateId(),
            createdAt: new Date().toISOString(),
            loanHistory: [],
            ...data,
        }
        games.value.push(game)
        save()
        return game
    }

    function updateGame(id: string, updates: Partial<Omit<IGame, 'id' | 'createdAt'>>): void {
        const game = games.value.find(g => g.id === id)
        if (game) {
            Object.assign(game, updates)
            save()
        }
    }

    function deleteGame(id: string): void {
        const index = games.value.findIndex(g => g.id === id)
        if (index !== -1) {
            games.value.splice(index, 1)
            save()
        }
    }

    function getGame(id: string): IGame | null {
        return games.value.find(g => g.id === id) ?? null
    }

    function markAsBorrowed(id: string, borrower: string | null): void {
        const game = games.value.find(g => g.id === id)
        if (!game) return

        if (!game.loanHistory) {
            game.loanHistory = []
        }

        if (borrower !== null) {
            const entry: ILoanHistoryEntry = {
                id: generateId(),
                borrower,
                lentAt: new Date().toISOString(),
                returnedAt: null,
            }
            game.loanHistory.push(entry)
            game.isBorrowed = true
            game.borrowedTo = borrower
        } else {
            const openLoan = game.loanHistory.find(l => l.returnedAt === null)
            if (openLoan) {
                openLoan.returnedAt = new Date().toISOString()
            }
            game.isBorrowed = false
            game.borrowedTo = null
        }
        save()
    }

    function getLoanHistory(id: string): ILoanHistoryEntry[] {
        const game = games.value.find(g => g.id === id)
        return game?.loanHistory ?? []
    }

    function markForSale(id: string, forSale: boolean): void {
        const game = games.value.find(g => g.id === id)
        if (game) {
            game.forSale = forSale
            save()
        }
    }

    function filterGames(filters: IGameFilters): IGame[] {
        return games.value.filter(game => {
            if (filters.search) {
                const search = filters.search.toLowerCase()
                if (!game.name.toLowerCase().includes(search)) return false
            }

            if (filters.style && game.style !== filters.style) return false
            if (filters.mood && game.mood !== filters.mood) return false

            if (filters.minPlayers && game.maxPlayers < filters.minPlayers) return false
            if (filters.maxPlayers && game.minPlayers > filters.maxPlayers) return false

            if (!filters.showOwned && game.isOwned && !game.isBorrowed && !game.forSale) return false
            if (!filters.showBorrowed && game.isBorrowed) return false
            if (!filters.showForSale && game.forSale) return false

            return true
        })
    }

    const stats = computed(() => {
        const total = games.value.length
        const owned = games.value.filter(g => g.isOwned).length
        const borrowed = games.value.filter(g => g.isBorrowed).length
        const forSale = games.value.filter(g => g.forSale).length

        const allMinPlayers = games.value.map(g => g.minPlayers)
        const allMaxPlayers = games.value.map(g => g.maxPlayers)

        const totalLoans = games.value.reduce((acc, g) => {
            return acc + (g.loanHistory?.length ?? 0)
        }, 0)

        return {
            total,
            owned,
            borrowed,
            forSale,
            minPlayers: allMinPlayers.length > 0 ? Math.min(...allMinPlayers) : 0,
            maxPlayers: allMaxPlayers.length > 0 ? Math.max(...allMaxPlayers) : 0,
            totalLoans,
        }
    })

    const styles = computed(() => {
        const set = new Set<string>()
        for (const game of games.value) {
            if (game.style) set.add(game.style)
        }
        return Array.from(set).sort()
    })

    const moods = computed(() => {
        const set = new Set<string>()
        for (const game of games.value) {
            if (game.mood) set.add(game.mood)
        }
        return Array.from(set).sort()
    })

    function exportLibrary(): string {
        return JSON.stringify(games.value, null, 2)
    }

    init()

    return {
        games: readonly(games),
        stats,
        styles,
        moods,
        addGame,
        updateGame,
        deleteGame,
        getGame,
        markAsBorrowed,
        markForSale,
        filterGames,
        exportLibrary,
        getLoanHistory,
    }
}
