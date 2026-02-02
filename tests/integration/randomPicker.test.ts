import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import RandomPickerPage from '~/pages/random-picker.vue'

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

describe('Random Picker Page', () => {
   beforeEach(() => {
      localStorageMock.clear()
      vi.clearAllMocks()
   })

   it('should render page title', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      expect(wrapper.find('.heading').text()).toBeTruthy()
   })

   it('should have mode switch buttons', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const modeButtons = wrapper.findAll('[data-test-class="mode-btn"]')
      expect(modeButtons.length).toBe(2)
   })

   it('should default to touch mode', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const activeBtn = wrapper.find('[data-test-id="mode-touch"][data-active="true"]')
      expect(activeBtn.exists()).toBe(true)
   })

   it('should show touch zone in touch mode', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const touchZone = wrapper.find('[data-test-id="touch-zone"]')
      expect(touchZone.exists()).toBe(true)
   })

   it('should show touch hint initially', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const hint = wrapper.find('[data-test-id="touch-hint"]')
      expect(hint.exists()).toBe(true)
   })

   it('should switch to list mode', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const listModeBtn = wrapper.find('[data-test-id="mode-list"]')
      await listModeBtn.trigger('click')

      const listZone = wrapper.find('[data-test-id="list-zone"]')
      expect(listZone.exists()).toBe(true)
   })

   it('should show input field in list mode', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const listModeBtn = wrapper.find('[data-test-id="mode-list"]')
      await listModeBtn.trigger('click')

      const input = wrapper.find('[data-test-id="player-input"]')
      expect(input.exists()).toBe(true)
   })

   it('should show empty state when no players', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const listModeBtn = wrapper.find('[data-test-id="mode-list"]')
      await listModeBtn.trigger('click')

      const empty = wrapper.find('[data-test-id="empty-state"]')
      expect(empty.exists()).toBe(true)
   })

   it('should add player when submitting', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const listModeBtn = wrapper.find('[data-test-id="mode-list"]')
      await listModeBtn.trigger('click')

      const input = wrapper.find('[data-test-id="player-input"]')
      await input.setValue('Alice')
      await wrapper.find('[data-test-id="add-player-btn"]').trigger('click')

      const players = wrapper.findAll('[data-test-class="player-item"]')
      expect(players.length).toBe(1)
   })

   it('should show draw mode buttons in list mode', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const listModeBtn = wrapper.find('[data-test-id="mode-list"]')
      await listModeBtn.trigger('click')

      const drawModeButtons = wrapper.findAll('[data-test-class="draw-mode-btn"]')
      expect(drawModeButtons.length).toBe(2)
   })

   it('should have player mode active by default', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const listModeBtn = wrapper.find('[data-test-id="mode-list"]')
      await listModeBtn.trigger('click')

      const activeDrawBtn = wrapper.find('[data-test-id="draw-mode-player"][data-active="true"]')
      expect(activeDrawBtn.exists()).toBe(true)
   })

   it('should show toolbar when players exist', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const listModeBtn = wrapper.find('[data-test-id="mode-list"]')
      await listModeBtn.trigger('click')

      const input = wrapper.find('[data-test-id="player-input"]')
      await input.setValue('Alice')
      await wrapper.find('[data-test-id="add-player-btn"]').trigger('click')

      const toolbar = wrapper.find('[data-test-id="toolbar"]')
      expect(toolbar.exists()).toBe(true)
   })

   it('should have player toggle checkbox', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const listModeBtn = wrapper.find('[data-test-id="mode-list"]')
      await listModeBtn.trigger('click')

      const input = wrapper.find('[data-test-id="player-input"]')
      await input.setValue('Alice')
      await wrapper.find('[data-test-id="add-player-btn"]').trigger('click')

      const toggle = wrapper.find('[data-test-class="player-toggle"]')
      expect(toggle.exists()).toBe(true)
   })

   it('should toggle player active state', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const listModeBtn = wrapper.find('[data-test-id="mode-list"]')
      await listModeBtn.trigger('click')

      const input = wrapper.find('[data-test-id="player-input"]')
      await input.setValue('Alice')
      await wrapper.find('[data-test-id="add-player-btn"]').trigger('click')

      const toggle = wrapper.find('[data-test-class="player-toggle"]')
      expect(toggle.attributes('data-active')).toBe('true')

      await toggle.trigger('click')
      expect(toggle.attributes('data-active')).toBe('false')
   })

   it('should show team manager button', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const listModeBtn = wrapper.find('[data-test-id="mode-list"]')
      await listModeBtn.trigger('click')

      const input = wrapper.find('[data-test-id="player-input"]')
      await input.setValue('Alice')
      await wrapper.find('[data-test-id="add-player-btn"]').trigger('click')

      const teamsBtn = wrapper.find('[data-test-id="teams-btn"]')
      expect(teamsBtn.exists()).toBe(true)
   })

   it('should toggle team manager visibility', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const listModeBtn = wrapper.find('[data-test-id="mode-list"]')
      await listModeBtn.trigger('click')

      const input = wrapper.find('[data-test-id="player-input"]')
      await input.setValue('Alice')
      await wrapper.find('[data-test-id="add-player-btn"]').trigger('click')

      const teamsBtn = wrapper.find('[data-test-id="teams-btn"]')
      await teamsBtn.trigger('click')

      const teamManager = wrapper.find('[data-test-id="team-manager"]')
      expect(teamManager.exists()).toBe(true)
   })

   it('should show action buttons with 2+ players', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const listModeBtn = wrapper.find('[data-test-id="mode-list"]')
      await listModeBtn.trigger('click')

      const input = wrapper.find('[data-test-id="player-input"]')
      const addBtn = wrapper.find('[data-test-id="add-player-btn"]')

      await input.setValue('Alice')
      await addBtn.trigger('click')
      await input.setValue('Bob')
      await addBtn.trigger('click')

      const pickBtn = wrapper.find('[data-test-id="pick-btn"]')
      const orderBtn = wrapper.find('[data-test-id="order-btn"]')

      expect(pickBtn.exists()).toBe(true)
      expect(orderBtn.exists()).toBe(true)
   })

   it('should have back link', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const backLink = wrapper.find('[data-test-id="back-btn"]')
      expect(backLink.exists()).toBe(true)
   })

   it('should deselect all players', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const listModeBtn = wrapper.find('[data-test-id="mode-list"]')
      await listModeBtn.trigger('click')

      const input = wrapper.find('[data-test-id="player-input"]')
      const addBtn = wrapper.find('[data-test-id="add-player-btn"]')

      await input.setValue('Alice')
      await addBtn.trigger('click')
      await input.setValue('Bob')
      await addBtn.trigger('click')

      const deselectBtn = wrapper.find('[data-test-id="deselect-all-btn"]')
      await deselectBtn.trigger('click')

      const activeItems = wrapper.findAll('[data-test-class="player-item"][data-active="true"]')
      expect(activeItems.length).toBe(0)
   })

   it('should select all players', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const listModeBtn = wrapper.find('[data-test-id="mode-list"]')
      await listModeBtn.trigger('click')

      const input = wrapper.find('[data-test-id="player-input"]')
      const addBtn = wrapper.find('[data-test-id="add-player-btn"]')

      await input.setValue('Alice')
      await addBtn.trigger('click')
      await input.setValue('Bob')
      await addBtn.trigger('click')

      const deselectBtn = wrapper.find('[data-test-id="deselect-all-btn"]')
      await deselectBtn.trigger('click')

      const selectBtn = wrapper.find('[data-test-id="select-all-btn"]')
      await selectBtn.trigger('click')

      const inactiveItems = wrapper.findAll('[data-test-class="player-item"][data-active="false"]')
      expect(inactiveItems.length).toBe(0)
   })
})
