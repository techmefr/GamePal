import { describe, it, expect } from 'vitest'
import { generateId, pickRandom, shuffleArray } from '~/utils/random'

describe('generateId', () => {
   it('should generate a string id', () => {
      const id = generateId()
      expect(typeof id).toBe('string')
   })

   it('should generate unique ids', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateId()))
      expect(ids.size).toBe(100)
   })

   it('should generate id with correct length', () => {
      const id = generateId()
      expect(id.length).toBeGreaterThanOrEqual(8)
   })
})

describe('pickRandom', () => {
   it('should return null for empty array', () => {
      const result = pickRandom([])
      expect(result).toBeNull()
   })

   it('should return the only element for single item array', () => {
      const result = pickRandom(['only'])
      expect(result).toBe('only')
   })

   it('should return an element from the array', () => {
      const array = [1, 2, 3, 4, 5]
      const result = pickRandom(array)
      expect(array).toContain(result)
   })

   it('should work with different types', () => {
      const objects = [{ id: 1 }, { id: 2 }, { id: 3 }]
      const result = pickRandom(objects)
      expect(objects).toContain(result)
   })
})

describe('shuffleArray', () => {
   it('should return empty array for empty input', () => {
      const result = shuffleArray([])
      expect(result).toEqual([])
   })

   it('should return array with same elements', () => {
      const original = [1, 2, 3, 4, 5]
      const shuffled = shuffleArray(original)
      expect(shuffled.sort()).toEqual(original.sort())
   })

   it('should not modify original array', () => {
      const original = [1, 2, 3, 4, 5]
      const copy = [...original]
      shuffleArray(original)
      expect(original).toEqual(copy)
   })

   it('should return new array instance', () => {
      const original = [1, 2, 3]
      const shuffled = shuffleArray(original)
      expect(shuffled).not.toBe(original)
   })
})
