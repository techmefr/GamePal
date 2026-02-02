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
      const newBtn = wrapper.find('[data-test-id="new-btn"]')
      expect(newBtn.exists()).toBe(true)
   })

   it('should show empty state when no sessions', async () => {
      const wrapper = await mountSuspended(ScoresIndexPage)
      const empty = wrapper.find('[data-test-id="empty-state"]')
      expect(empty.exists()).toBe(true)
   })

   it('should have back link', async () => {
      const wrapper = await mountSuspended(ScoresIndexPage)
      const backLink = wrapper.find('[data-test-id="back-btn"]')
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
      const input = wrapper.find('[data-test-id="session-name-input"]')
      expect(input.exists()).toBe(true)
   })

   it('should have new player input', async () => {
      const wrapper = await mountSuspended(ScoresNewPage)
      const input = wrapper.find('[data-test-id="new-player-input"]')
      expect(input.exists()).toBe(true)
   })

   it('should have add player button', async () => {
      const wrapper = await mountSuspended(ScoresNewPage)
      const addBtn = wrapper.find('[data-test-id="add-player-btn"]')
      expect(addBtn.exists()).toBe(true)
   })

   it('should add player when clicking add button', async () => {
      const wrapper = await mountSuspended(ScoresNewPage)
      const input = wrapper.find('[data-test-id="new-player-input"]')
      const addBtn = wrapper.find('[data-test-id="add-player-btn"]')

      await input.setValue('Alice')
      await addBtn.trigger('click')

      const selectedPlayers = wrapper.findAll('[data-test-class="selected-player"]')
      expect(selectedPlayers.length).toBe(1)
   })

   it('should have game mode toggle', async () => {
      const wrapper = await mountSuspended(ScoresNewPage)
      const toggleButtons = wrapper.findAll('[data-test-class="game-mode-btn"]')
      expect(toggleButtons.length).toBe(2)
   })

   it('should have individual mode active by default', async () => {
      const wrapper = await mountSuspended(ScoresNewPage)
      const activeBtn = wrapper.find('[data-test-id="game-mode-individual"][data-active="true"]')
      expect(activeBtn.exists()).toBe(true)
   })

   it('should have end condition inputs', async () => {
      const wrapper = await mountSuspended(ScoresNewPage)
      const endConditions = wrapper.find('[data-test-id="end-conditions"]')
      expect(endConditions.exists()).toBe(true)
   })

   it('should have create button disabled initially', async () => {
      const wrapper = await mountSuspended(ScoresNewPage)
      const createBtn = wrapper.find('[data-test-id="create-btn"]')
      expect(createBtn.attributes('disabled')).toBeDefined()
   })

   it('should have back link', async () => {
      const wrapper = await mountSuspended(ScoresNewPage)
      const backLink = wrapper.find('[data-test-id="back-btn"]')
      expect(backLink.exists()).toBe(true)
   })

   it('should remove player when clicking remove', async () => {
      const wrapper = await mountSuspended(ScoresNewPage)
      const input = wrapper.find('[data-test-id="new-player-input"]')
      const addBtn = wrapper.find('[data-test-id="add-player-btn"]')

      await input.setValue('Alice')
      await addBtn.trigger('click')
      await input.setValue('Bob')
      await addBtn.trigger('click')

      const removeBtn = wrapper.find('[data-test-class="remove-player-btn"]')
      await removeBtn.trigger('click')

      const selectedPlayers = wrapper.findAll('[data-test-class="selected-player"]')
      expect(selectedPlayers.length).toBe(1)
   })
})
