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
      const modeButtons = wrapper.findAll('.picker__mode-btn')
      expect(modeButtons.length).toBe(2)
   })

   it('should default to touch mode', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const activeBtn = wrapper.find('.picker__mode-btn--active')
      expect(activeBtn.exists()).toBe(true)
   })

   it('should show touch zone in touch mode', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const touchZone = wrapper.find('.touch-zone')
      expect(touchZone.exists()).toBe(true)
   })

   it('should show touch hint initially', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const hint = wrapper.find('.touch-area__hint')
      expect(hint.exists()).toBe(true)
   })

   it('should switch to list mode', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const listModeBtn = wrapper.findAll('.picker__mode-btn')[1]
      await listModeBtn.trigger('click')

      const listZone = wrapper.find('.list-zone')
      expect(listZone.exists()).toBe(true)
   })

   it('should show input field in list mode', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const listModeBtn = wrapper.findAll('.picker__mode-btn')[1]
      await listModeBtn.trigger('click')

      const input = wrapper.find('.list-zone__input')
      expect(input.exists()).toBe(true)
   })

   it('should show empty state when no players', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const listModeBtn = wrapper.findAll('.picker__mode-btn')[1]
      await listModeBtn.trigger('click')

      const empty = wrapper.find('.list-zone__empty')
      expect(empty.exists()).toBe(true)
   })

   it('should add player when submitting', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const listModeBtn = wrapper.findAll('.picker__mode-btn')[1]
      await listModeBtn.trigger('click')

      const input = wrapper.find('.list-zone__input')
      await input.setValue('Alice')
      await wrapper.find('.btn-primary').trigger('click')

      const players = wrapper.findAll('.player-list__item')
      expect(players.length).toBe(1)
   })

   it('should show draw mode buttons in list mode', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const listModeBtn = wrapper.findAll('.picker__mode-btn')[1]
      await listModeBtn.trigger('click')

      const drawModeButtons = wrapper.findAll('.draw-mode-btn')
      expect(drawModeButtons.length).toBe(2)
   })

   it('should have player mode active by default', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const listModeBtn = wrapper.findAll('.picker__mode-btn')[1]
      await listModeBtn.trigger('click')

      const activeDrawBtn = wrapper.find('.draw-mode-btn--active')
      expect(activeDrawBtn.exists()).toBe(true)
   })

   it('should show toolbar when players exist', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const listModeBtn = wrapper.findAll('.picker__mode-btn')[1]
      await listModeBtn.trigger('click')

      const input = wrapper.find('.list-zone__input')
      await input.setValue('Alice')
      await wrapper.find('.btn-primary').trigger('click')

      const toolbar = wrapper.find('.list-zone__toolbar')
      expect(toolbar.exists()).toBe(true)
   })

   it('should have player toggle checkbox', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const listModeBtn = wrapper.findAll('.picker__mode-btn')[1]
      await listModeBtn.trigger('click')

      const input = wrapper.find('.list-zone__input')
      await input.setValue('Alice')
      await wrapper.find('.btn-primary').trigger('click')

      const toggle = wrapper.find('.player-list__toggle')
      expect(toggle.exists()).toBe(true)
   })

   it('should toggle player active state', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const listModeBtn = wrapper.findAll('.picker__mode-btn')[1]
      await listModeBtn.trigger('click')

      const input = wrapper.find('.list-zone__input')
      await input.setValue('Alice')
      await wrapper.find('.btn-primary').trigger('click')

      const toggle = wrapper.find('.player-list__toggle')
      expect(toggle.classes()).toContain('player-list__toggle--active')

      await toggle.trigger('click')
      expect(toggle.classes()).not.toContain('player-list__toggle--active')
   })

   it('should show team manager button', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const listModeBtn = wrapper.findAll('.picker__mode-btn')[1]
      await listModeBtn.trigger('click')

      const input = wrapper.find('.list-zone__input')
      await input.setValue('Alice')
      await wrapper.find('.btn-primary').trigger('click')

      const teamsBtn = wrapper.find('.toolbar-btn--teams')
      expect(teamsBtn.exists()).toBe(true)
   })

   it('should toggle team manager visibility', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const listModeBtn = wrapper.findAll('.picker__mode-btn')[1]
      await listModeBtn.trigger('click')

      const input = wrapper.find('.list-zone__input')
      await input.setValue('Alice')
      await wrapper.find('.btn-primary').trigger('click')

      const teamsBtn = wrapper.find('.toolbar-btn--teams')
      await teamsBtn.trigger('click')

      const teamManager = wrapper.find('.team-manager')
      expect(teamManager.exists()).toBe(true)
   })

   it('should show action buttons with 2+ players', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const listModeBtn = wrapper.findAll('.picker__mode-btn')[1]
      await listModeBtn.trigger('click')

      const input = wrapper.find('.list-zone__input')
      const addBtn = wrapper.find('.btn-primary')

      await input.setValue('Alice')
      await addBtn.trigger('click')
      await input.setValue('Bob')
      await addBtn.trigger('click')

      const pickBtn = wrapper.find('.list-zone__pick-btn')
      const orderBtn = wrapper.find('.list-zone__order-btn')
      const firstBtn = wrapper.find('.list-zone__first-btn')

      expect(pickBtn.exists()).toBe(true)
      expect(orderBtn.exists()).toBe(true)
      expect(firstBtn.exists()).toBe(true)
   })

   it('should remove player when clicking remove button', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const listModeBtn = wrapper.findAll('.picker__mode-btn')[1]
      await listModeBtn.trigger('click')

      const input = wrapper.find('.list-zone__input')
      await input.setValue('Alice')
      await wrapper.find('.btn-primary').trigger('click')

      const removeBtn = wrapper.find('.player-list__remove')
      await removeBtn.trigger('click')

      const players = wrapper.findAll('.player-list__item')
      expect(players.length).toBe(0)
   })

   it('should have back link', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const backLink = wrapper.find('.picker__back')
      expect(backLink.exists()).toBe(true)
   })

   it('should deselect all players', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const listModeBtn = wrapper.findAll('.picker__mode-btn')[1]
      await listModeBtn.trigger('click')

      const input = wrapper.find('.list-zone__input')
      const addBtn = wrapper.find('.btn-primary')

      await input.setValue('Alice')
      await addBtn.trigger('click')
      await input.setValue('Bob')
      await addBtn.trigger('click')

      const deselectBtn = wrapper.findAll('.toolbar-btn')[1]
      await deselectBtn.trigger('click')

      const inactiveItems = wrapper.findAll('.player-list__item--inactive')
      expect(inactiveItems.length).toBe(2)
   })

   it('should select all players', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const listModeBtn = wrapper.findAll('.picker__mode-btn')[1]
      await listModeBtn.trigger('click')

      const input = wrapper.find('.list-zone__input')
      const addBtn = wrapper.find('.btn-primary')

      await input.setValue('Alice')
      await addBtn.trigger('click')
      await input.setValue('Bob')
      await addBtn.trigger('click')

      const deselectBtn = wrapper.findAll('.toolbar-btn')[1]
      await deselectBtn.trigger('click')

      const selectBtn = wrapper.findAll('.toolbar-btn')[0]
      await selectBtn.trigger('click')

      const inactiveItems = wrapper.findAll('.player-list__item--inactive')
      expect(inactiveItems.length).toBe(0)
   })
})
