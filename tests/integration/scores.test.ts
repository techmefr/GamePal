import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ScoresIndexPage from '~/pages/scores/index.vue'
import ScoresNewPage from '~/pages/scores/new.vue'

const localStorageMock = (() => {
   let store: Record<string, string> = {}
   return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
         store[key] = value
      }),
      removeItem: vi.fn((key: string) => {
         delete store[key]
      }),
      clear: vi.fn(() => {
         store = {}
      }),
   }
})()

Object.defineProperty(globalThis, 'localStorage', {
   value: localStorageMock,
})

describe('Scores Index Page', () => {
   beforeEach(() => {
      localStorageMock.clear()
      vi.clearAllMocks()
   })

   it('should render page title', async () => {
      const wrapper = await mountSuspended(ScoresIndexPage)
      expect(wrapper.find('.heading').text()).toBeTruthy()
   })

   it('should have new session button', async () => {
      const wrapper = await mountSuspended(ScoresIndexPage)
      const newBtn = wrapper.find('.scores-page__new')
      expect(newBtn.exists()).toBe(true)
   })

   it('should show empty state when no sessions', async () => {
      const wrapper = await mountSuspended(ScoresIndexPage)
      const empty = wrapper.find('.scores-page__empty')
      expect(empty.exists()).toBe(true)
   })

   it('should have back link', async () => {
      const wrapper = await mountSuspended(ScoresIndexPage)
      const backLink = wrapper.find('.scores-page__back')
      expect(backLink.exists()).toBe(true)
   })
})

describe('Scores New Page', () => {
   beforeEach(() => {
      localStorageMock.clear()
      vi.clearAllMocks()
   })

   it('should render page title', async () => {
      const wrapper = await mountSuspended(ScoresNewPage)
      expect(wrapper.find('.heading').text()).toBeTruthy()
   })

   it('should have session name input', async () => {
      const wrapper = await mountSuspended(ScoresNewPage)
      const inputs = wrapper.findAll('.form-input')
      expect(inputs.length).toBeGreaterThan(0)
   })

   it('should have player input fields', async () => {
      const wrapper = await mountSuspended(ScoresNewPage)
      const playerFields = wrapper.findAll('.player-field')
      expect(playerFields.length).toBe(2)
   })

   it('should have add player button', async () => {
      const wrapper = await mountSuspended(ScoresNewPage)
      const addBtn = wrapper.find('.add-player-btn')
      expect(addBtn.exists()).toBe(true)
   })

   it('should add player field when clicking add button', async () => {
      const wrapper = await mountSuspended(ScoresNewPage)
      const addBtn = wrapper.find('.add-player-btn')
      await addBtn.trigger('click')

      const playerFields = wrapper.findAll('.player-field')
      expect(playerFields.length).toBe(3)
   })

   it('should have game mode toggle', async () => {
      const wrapper = await mountSuspended(ScoresNewPage)
      const toggleButtons = wrapper.findAll('.toggle-btn')
      expect(toggleButtons.length).toBe(2)
   })

   it('should have individual mode active by default', async () => {
      const wrapper = await mountSuspended(ScoresNewPage)
      const activeBtn = wrapper.find('.toggle-btn--active')
      expect(activeBtn.exists()).toBe(true)
   })

   it('should have end condition inputs', async () => {
      const wrapper = await mountSuspended(ScoresNewPage)
      const endCondition = wrapper.find('.end-condition')
      expect(endCondition.exists()).toBe(true)
   })

   it('should have create button disabled initially', async () => {
      const wrapper = await mountSuspended(ScoresNewPage)
      const createBtn = wrapper.find('.new-session__create')
      expect(createBtn.attributes('disabled')).toBeDefined()
   })

   it('should have back link', async () => {
      const wrapper = await mountSuspended(ScoresNewPage)
      const backLink = wrapper.find('.new-session__back')
      expect(backLink.exists()).toBe(true)
   })

   it('should remove player field when clicking remove', async () => {
      const wrapper = await mountSuspended(ScoresNewPage)
      const addBtn = wrapper.find('.add-player-btn')
      await addBtn.trigger('click')

      const removeBtn = wrapper.find('.player-field__remove')
      await removeBtn.trigger('click')

      const playerFields = wrapper.findAll('.player-field')
      expect(playerFields.length).toBe(2)
   })
})
