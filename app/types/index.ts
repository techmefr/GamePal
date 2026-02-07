export interface IPlayer {
   id: string
   name: string
   color: string
   avatar?: string
}

export interface IPickerPlayer extends IPlayer {
   isActive: boolean
   teamId: string | null
}

export interface ITeam {
   id: string
   name: string
   color: string
   playerIds: string[]
}

export interface ITouchPoint {
   id: number
   x: number
   y: number
   color: string
}

export interface IDie {
   id: string
   type: number
   value: number | null
   isLocked: boolean
}

export interface ICustomDieFace {
   value: string
   color: string | null
}

export interface ICustomDie {
   id: string
   name: string
   faces: ICustomDieFace[]
   currentFaceIndex: number | null
   isLocked: boolean
   game: string | null
}

export interface IDicePreset {
   id: string
   name: string
   standardDice: { type: number; count: number }[]
   customDice: ICustomDie[]
}

export interface IScorePlayer {
   id: string
   name: string
   scores: number[]
   total: number
}

export interface ILoanHistoryEntry {
   id: string
   borrower: string
   lentAt: string
   returnedAt: string | null
}

export interface IGame {
   id: string
   name: string
   minPlayers: number
   maxPlayers: number
   style: string | null
   mood: string | null
   isOwned: boolean
   isBorrowed: boolean
   borrowedTo: string | null
   forSale: boolean
   createdAt: string
   loanHistory: ILoanHistoryEntry[]
}

export interface IScoreSession {
   id: string
   name: string
   createdAt: string
   updatedAt: string
   players: IScorePlayer[]
   currentRound: number
   maxRounds: number | null
   maxScore: number | null
   isTeamMode: boolean
   isClosed: boolean
}

export interface ITimer {
   id: string
   label: string
   duration: number
   remaining: number
   isRunning: boolean
   color: string
}

export interface ITimerPreset {
   id: string
   name: string
   duration: number
   game: string | null
}

export interface IGameSession {
   id: string
   name: string
   playerIds: string[]
   teamIds: string[]
   createdAt: string
   lastUsedAt: string
}

export interface IGameConfig {
   id: string
   gameId: string | null
   gameName: string
   dicePresetId: string | null
   timerPresetId: string | null
   createdAt: string
   updatedAt: string
}
