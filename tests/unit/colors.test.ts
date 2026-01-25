import { describe, it, expect } from 'vitest'
import { getRandomColor, getColorByIndex } from '~/utils/colors'

describe('getRandomColor', () => {
   it('should return a valid hex color', () => {
      const color = getRandomColor()
      expect(color).toMatch(/^#[0-9a-f]{6}$/i)
   })

   it('should return colors from the palette', () => {
      const colors = new Set(Array.from({ length: 100 }, () => getRandomColor()))
      expect(colors.size).toBeGreaterThan(1)
      expect(colors.size).toBeLessThanOrEqual(10)
   })
})

describe('getColorByIndex', () => {
   it('should return consistent color for same index', () => {
      const color1 = getColorByIndex(0)
      const color2 = getColorByIndex(0)
      expect(color1).toBe(color2)
   })

   it('should return valid hex color', () => {
      const color = getColorByIndex(5)
      expect(color).toMatch(/^#[0-9a-f]{6}$/i)
   })

   it('should wrap around for large indices', () => {
      const color1 = getColorByIndex(0)
      const color2 = getColorByIndex(10)
      expect(color1).toBe(color2)
   })

   it('should return different colors for different indices', () => {
      const color1 = getColorByIndex(0)
      const color2 = getColorByIndex(1)
      expect(color1).not.toBe(color2)
   })
})
