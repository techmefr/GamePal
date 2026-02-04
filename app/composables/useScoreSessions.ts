import type { IScoreSession, IScorePlayer } from '~/types'

const STORAGE_KEY = 'gamepal-score-sessions'

export function useScoreSessions() {
   const sessions = ref<IScoreSession[]>([])
   const currentSession = ref<IScoreSession | null>(null)
   const isLoaded = ref(false)

   function load(): void {
      if (import.meta.client) {
         try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
               sessions.value = JSON.parse(stored)
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
         } catch (_e) {
            console.warn('Failed to save sessions')
         }
      }
   }

   function createSession(name: string, playerNames: string[], options: {
      maxRounds: number | null
      maxScore: number | null
      isTeamMode: boolean
   }): IScoreSession {
      const players: IScorePlayer[] = playerNames.map(playerName => ({
         id: generateId(),
         name: playerName,
         scores: [],
         total: 0,
      }))

      const session: IScoreSession = {
         id: generateId(),
         name,
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString(),
         players,
         currentRound: 1,
         maxRounds: options.maxRounds,
         maxScore: options.maxScore,
         isTeamMode: options.isTeamMode,
         isClosed: false,
      }

      sessions.value.unshift(session)
      save()
      return session
   }

   function getSession(id: string): IScoreSession | null {
      return sessions.value.find(s => s.id === id) ?? null
   }

   function updatePlayerScore(sessionId: string, playerId: string, round: number, score: number): void {
      const session = sessions.value.find(s => s.id === sessionId)
      if (!session) return

      const player = session.players.find(p => p.id === playerId)
      if (!player) return

      while (player.scores.length < round) {
         player.scores.push(0)
      }

      player.scores[round - 1] = score
      player.total = player.scores.reduce((sum, s) => sum + s, 0)
      session.updatedAt = new Date().toISOString()
      save()
   }

   function addRound(sessionId: string): void {
      const session = sessions.value.find(s => s.id === sessionId)
      if (!session) return

      session.currentRound++
      session.updatedAt = new Date().toISOString()
      save()
   }

   function deleteSession(id: string): void {
      const index = sessions.value.findIndex(s => s.id === id)
      if (index !== -1) {
         sessions.value.splice(index, 1)
         save()
      }
   }

   function closeSession(sessionId: string): void {
      const session = sessions.value.find(s => s.id === sessionId)
      if (!session) return

      session.isClosed = true
      session.updatedAt = new Date().toISOString()
      save()
   }

   function setCurrentSession(session: IScoreSession | null): void {
      currentSession.value = session
   }

   onMounted(load)

   return {
      sessions,
      currentSession,
      isLoaded,
      createSession,
      getSession,
      updatePlayerScore,
      addRound,
      deleteSession,
      closeSession,
      setCurrentSession,
   }
}
