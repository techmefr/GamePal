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

   it('should not show pick button with less than 2 players', async () => {
      const wrapper = await mountSuspended(RandomPickerPage)
      const listModeBtn = wrapper.findAll('.picker__mode-btn')[1]
      await listModeBtn.trigger('click')

      const input = wrapper.find('.list-zone__input')
      await input.setValue('Alice')
      await wrapper.find('.btn-primary').trigger('click')

      const pickBtn = wrapper.find('.list-zone__pick-btn')
      expect(pickBtn.exists()).toBe(false)
   })

   it('should show pick button with 2+ players', async () => {
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
      expect(pickBtn.exists()).toBe(true)
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
})
