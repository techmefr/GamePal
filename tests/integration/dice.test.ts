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

   it('should have tabs for roll and presets', async () => {
      const wrapper = await mountSuspended(DicePage)
      const tabs = wrapper.findAll('.tab-btn')
      expect(tabs.length).toBe(2)
   })

   it('should have standard dice catalog', async () => {
      const wrapper = await mountSuspended(DicePage)
      const catalog = wrapper.find('.dice-catalog')
      expect(catalog.exists()).toBe(true)
   })

   it('should have 8 standard dice types', async () => {
      const wrapper = await mountSuspended(DicePage)
      const diceButtons = wrapper.findAll('.dice-catalog__btn')
      expect(diceButtons.length).toBe(8)
   })

   it('should add die to tray when clicking', async () => {
      const wrapper = await mountSuspended(DicePage)
      const d6Button = wrapper.findAll('.dice-catalog__btn')[2]
      await d6Button.trigger('click')

      const diceTray = wrapper.find('.dice-tray')
      expect(diceTray.exists()).toBe(true)
   })

   it('should show die value in tray', async () => {
      const wrapper = await mountSuspended(DicePage)
      const d6Button = wrapper.findAll('.dice-catalog__btn')[2]
      await d6Button.trigger('click')

      const dieCard = wrapper.find('.die-card')
      expect(dieCard.exists()).toBe(true)
   })

   it('should show total when dice are added', async () => {
      const wrapper = await mountSuspended(DicePage)
      const d6Button = wrapper.findAll('.dice-catalog__btn')[2]
      await d6Button.trigger('click')

      const total = wrapper.find('.dice-tray__total')
      expect(total.exists()).toBe(true)
   })

   it('should have roll button', async () => {
      const wrapper = await mountSuspended(DicePage)
      const d6Button = wrapper.findAll('.dice-catalog__btn')[2]
      await d6Button.trigger('click')

      const rollBtn = wrapper.find('.dice-tray__roll-btn')
      expect(rollBtn.exists()).toBe(true)
   })

   it('should remove die from tray', async () => {
      const wrapper = await mountSuspended(DicePage)
      const d6Button = wrapper.findAll('.dice-catalog__btn')[2]
      await d6Button.trigger('click')

      const removeBtn = wrapper.find('.die-card__remove')
      await removeBtn.trigger('click')

      const diceTray = wrapper.find('.dice-tray')
      expect(diceTray.exists()).toBe(false)
   })

   it('should have back link', async () => {
      const wrapper = await mountSuspended(DicePage)
      const backLink = wrapper.find('.dice-page__back')
      expect(backLink.exists()).toBe(true)
   })

   it('should show empty state when no dice', async () => {
      const wrapper = await mountSuspended(DicePage)
      const empty = wrapper.find('.dice-page__empty')
      expect(empty.exists()).toBe(true)
   })

   it('should show clear button when dice in tray', async () => {
      const wrapper = await mountSuspended(DicePage)
      const d6Button = wrapper.findAll('.dice-catalog__btn')[2]
      await d6Button.trigger('click')

      const clearBtn = wrapper.find('.dice-page__clear')
      expect(clearBtn.exists()).toBe(true)
   })

   it('should clear all dice when clicking clear', async () => {
      const wrapper = await mountSuspended(DicePage)
      const d6Button = wrapper.findAll('.dice-catalog__btn')[2]
      await d6Button.trigger('click')
      await d6Button.trigger('click')

      const clearBtn = wrapper.find('.dice-page__clear')
      await clearBtn.trigger('click')

      const diceTray = wrapper.find('.dice-tray')
      expect(diceTray.exists()).toBe(false)
   })

   it('should have custom dice section', async () => {
      const wrapper = await mountSuspended(DicePage)
      const sections = wrapper.findAll('.dice-catalog')
      expect(sections.length).toBe(2)
   })

   it('should have create custom die button', async () => {
      const wrapper = await mountSuspended(DicePage)
      const createBtn = wrapper.find('.create-btn')
      expect(createBtn.exists()).toBe(true)
   })

   it('should switch to presets view', async () => {
      const wrapper = await mountSuspended(DicePage)
      const presetsTab = wrapper.findAll('.tab-btn')[1]
      await presetsTab.trigger('click')

      const presetsSection = wrapper.find('.presets-section')
      expect(presetsSection.exists()).toBe(true)
   })

   it('should show create preset button in presets view', async () => {
      const wrapper = await mountSuspended(DicePage)
      const presetsTab = wrapper.findAll('.tab-btn')[1]
      await presetsTab.trigger('click')

      const createBtn = wrapper.find('.presets-section__add')
      expect(createBtn.exists()).toBe(true)
   })

   it('should show create custom die form', async () => {
      const wrapper = await mountSuspended(DicePage)
      const createBtn = wrapper.find('.create-btn')
      await createBtn.trigger('click')

      const form = wrapper.find('.create-form')
      expect(form.exists()).toBe(true)
   })

   it('should have face inputs in custom die form', async () => {
      const wrapper = await mountSuspended(DicePage)
      const createBtn = wrapper.find('.create-btn')
      await createBtn.trigger('click')

      const faceItems = wrapper.findAll('.face-item')
      expect(faceItems.length).toBe(2)
   })

   it('should add face to custom die', async () => {
      const wrapper = await mountSuspended(DicePage)
      const createBtn = wrapper.find('.create-btn')
      await createBtn.trigger('click')

      const addFaceBtn = wrapper.find('.add-face-btn')
      await addFaceBtn.trigger('click')

      const faceItems = wrapper.findAll('.face-item')
      expect(faceItems.length).toBe(3)
   })

   it('should have cancel button in form views', async () => {
      const wrapper = await mountSuspended(DicePage)
      const createBtn = wrapper.find('.create-btn')
      await createBtn.trigger('click')

      const cancelBtn = wrapper.find('.dice-page__cancel')
      expect(cancelBtn.exists()).toBe(true)
   })

   it('should return to roll view when canceling', async () => {
      const wrapper = await mountSuspended(DicePage)
      const createBtn = wrapper.find('.create-btn')
      await createBtn.trigger('click')

      const cancelBtn = wrapper.find('.dice-page__cancel')
      await cancelBtn.trigger('click')

      const tabs = wrapper.findAll('.tab-btn')
      expect(tabs.length).toBe(2)
   })
})
