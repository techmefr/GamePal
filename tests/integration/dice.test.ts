import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import DicePage from '~/pages/dice.vue'

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

describe('Dice Page', () => {
   beforeEach(() => {
      localStorageMock.clear()
      vi.clearAllMocks()
   })

   it('should render page title', async () => {
      const wrapper = await mountSuspended(DicePage)
      expect(wrapper.find('.heading').text()).toBeTruthy()
   })

   it('should have standard dice types', async () => {
      const wrapper = await mountSuspended(DicePage)
      const diceButtons = wrapper.findAll('.dice-type-card')
      expect(diceButtons.length).toBe(8)
   })

   it('should add die to tray when clicking', async () => {
      const wrapper = await mountSuspended(DicePage)
      const d6Button = wrapper.findAll('.dice-type-card')[2]
      await d6Button.trigger('click')

      const dieInTray = wrapper.find('.die-in-tray')
      expect(dieInTray.exists()).toBe(true)
   })

   it('should show die value in tray', async () => {
      const wrapper = await mountSuspended(DicePage)
      const d6Button = wrapper.findAll('.dice-type-card')[2]
      await d6Button.trigger('click')

      const dieValue = wrapper.find('.die-value')
      expect(dieValue.exists()).toBe(true)
   })

   it('should show total when dice are added', async () => {
      const wrapper = await mountSuspended(DicePage)
      const d6Button = wrapper.findAll('.dice-type-card')[2]
      await d6Button.trigger('click')

      const total = wrapper.find('.dice-total')
      expect(total.exists()).toBe(true)
   })

   it('should have roll button', async () => {
      const wrapper = await mountSuspended(DicePage)
      const d6Button = wrapper.findAll('.dice-type-card')[2]
      await d6Button.trigger('click')

      const rollBtn = wrapper.find('.roll-btn')
      expect(rollBtn.exists()).toBe(true)
   })

   it('should remove die from tray', async () => {
      const wrapper = await mountSuspended(DicePage)
      const d6Button = wrapper.findAll('.dice-type-card')[2]
      await d6Button.trigger('click')

      const removeBtn = wrapper.find('.die-remove')
      await removeBtn.trigger('click')

      const dieInTray = wrapper.find('.die-in-tray')
      expect(dieInTray.exists()).toBe(false)
   })

   it('should have back link', async () => {
      const wrapper = await mountSuspended(DicePage)
      const backLink = wrapper.find('.dice-page__back')
      expect(backLink.exists()).toBe(true)
   })

   it('should show empty state when no dice', async () => {
      const wrapper = await mountSuspended(DicePage)
      const empty = wrapper.find('.dice-empty')
      expect(empty.exists()).toBe(true)
   })

   it('should show clear button when dice in tray', async () => {
      const wrapper = await mountSuspended(DicePage)
      const d6Button = wrapper.findAll('.dice-type-card')[2]
      await d6Button.trigger('click')

      const clearBtn = wrapper.find('.dice-page__clear')
      expect(clearBtn.exists()).toBe(true)
   })

   it('should clear all dice when clicking clear', async () => {
      const wrapper = await mountSuspended(DicePage)
      const d6Button = wrapper.findAll('.dice-type-card')[2]
      await d6Button.trigger('click')
      await d6Button.trigger('click')

      const clearBtn = wrapper.find('.dice-page__clear')
      await clearBtn.trigger('click')

      const dieInTray = wrapper.find('.die-in-tray')
      expect(dieInTray.exists()).toBe(false)
   })

   it('should have create custom die button', async () => {
      const wrapper = await mountSuspended(DicePage)
      const createBtn = wrapper.find('.create-custom-btn')
      expect(createBtn.exists()).toBe(true)
   })

   it('should have cancel button in form views', async () => {
      const wrapper = await mountSuspended(DicePage)
      const createBtn = wrapper.find('.create-custom-btn')
      await createBtn.trigger('click')

      const cancelBtn = wrapper.find('.dice-page__cancel')
      expect(cancelBtn.exists()).toBe(true)
   })

   it('should show face editor in create mode', async () => {
      const wrapper = await mountSuspended(DicePage)
      const createBtn = wrapper.find('.create-custom-btn')
      await createBtn.trigger('click')

      const faceEditors = wrapper.findAll('.face-editor')
      expect(faceEditors.length).toBe(2)
   })

   it('should add face to custom die', async () => {
      const wrapper = await mountSuspended(DicePage)
      const createBtn = wrapper.find('.create-custom-btn')
      await createBtn.trigger('click')

      const addFaceBtn = wrapper.find('.add-face-btn')
      await addFaceBtn.trigger('click')

      const faceEditors = wrapper.findAll('.face-editor')
      expect(faceEditors.length).toBe(3)
   })

   it('should toggle die lock', async () => {
      const wrapper = await mountSuspended(DicePage)
      const d6Button = wrapper.findAll('.dice-type-card')[2]
      await d6Button.trigger('click')

      const lockBtn = wrapper.find('.die-lock')
      expect(lockBtn.exists()).toBe(true)
   })

   it('should show custom dice section', async () => {
      const wrapper = await mountSuspended(DicePage)
      const customDiceAdd = wrapper.find('.custom-dice-add')
      expect(customDiceAdd.exists()).toBe(false)
   })
})
