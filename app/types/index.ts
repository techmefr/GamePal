export interface IPlayer {
   id: string
   name: string
}

export interface IPickerPlayer extends IPlayer {
   isActive: boolean
   teamId: string | null
}

export interface ITeam {
   id: string
   name: string
   color: string
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
}
