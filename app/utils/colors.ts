const TOUCH_COLORS = [
   '#818cf8',
   '#c084fc',
   '#f472b6',
   '#fb7185',
   '#fbbf24',
   '#4ade80',
   '#22d3ee',
   '#60a5fa',
   '#a78bfa',
   '#f97316',
]

export function getRandomColor(): string {
   const index = Math.floor(Math.random() * TOUCH_COLORS.length)
   return TOUCH_COLORS[index]
}

export function getColorByIndex(index: number): string {
   return TOUCH_COLORS[index % TOUCH_COLORS.length]
}
