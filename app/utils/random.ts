export function generateId(): string {
   return Math.random().toString(36).substring(2, 11)
}

export function pickRandom<T>(array: T[]): T | null {
   if (array.length === 0) return null
   const index = Math.floor(Math.random() * array.length)
   return array[index]
}

export function shuffleArray<T>(array: T[]): T[] {
   const shuffled = [...array]
   for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
   }
   return shuffled
}
