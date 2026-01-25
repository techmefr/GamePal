import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import DicePage from '~/pages/dice.vue'

describe('Dice Page', () => {
   it('should render page title', async () => {
      const wrapper = await mountSuspended(DicePage)
      expect(wrapper.find('.heading').text()).toBeTruthy()
   })

   it('should render dice catalog', async () => {
      const wrapper = await mountSuspended(DicePage)
      const catalog = wrapper.find('.dice-catalog')
      expect(catalog.exists()).toBe(true)
   })

   it('should have 8 dice type buttons', async () => {
      const wrapper = await mountSuspended(DicePage)
      const buttons = wrapper.findAll('.dice-catalog__btn')
      expect(buttons.length).toBe(8)
   })

   it('should show correct dice labels', async () => {
      const wrapper = await mountSuspended(DicePage)
      const buttons = wrapper.findAll('.dice-catalog__btn')
      const labels = buttons.map(btn => btn.text())

      expect(labels).toContain('D3')
      expect(labels).toContain('D6')
      expect(labels).toContain('D20')
      expect(labels).toContain('D100')
   })

   it('should show empty state initially', async () => {
      const wrapper = await mountSuspended(DicePage)
      const empty = wrapper.find('.dice-page__empty')
      expect(empty.exists()).toBe(true)
   })

   it('should not show roll button when no dice selected', async () => {
      const wrapper = await mountSuspended(DicePage)
      const rollBtn = wrapper.find('.dice-tray__roll-btn')
      expect(rollBtn.exists()).toBe(false)
   })

   it('should add die when clicking catalog button', async () => {
      const wrapper = await mountSuspended(DicePage)
      const d6Button = wrapper.findAll('.dice-catalog__btn')[2]
      await d6Button.trigger('click')

      const diceCards = wrapper.findAll('.die-card')
      expect(diceCards.length).toBe(1)
   })

   it('should show roll button after adding dice', async () => {
      const wrapper = await mountSuspended(DicePage)
      const d6Button = wrapper.findAll('.dice-catalog__btn')[2]
      await d6Button.trigger('click')

      const rollBtn = wrapper.find('.dice-tray__roll-btn')
      expect(rollBtn.exists()).toBe(true)
   })

   it('should show total after adding dice', async () => {
      const wrapper = await mountSuspended(DicePage)
      const d6Button = wrapper.findAll('.dice-catalog__btn')[2]
      await d6Button.trigger('click')

      const total = wrapper.find('.dice-tray__total')
      expect(total.exists()).toBe(true)
   })

   it('should remove die when clicking remove button', async () => {
      const wrapper = await mountSuspended(DicePage)
      const d6Button = wrapper.findAll('.dice-catalog__btn')[2]
      await d6Button.trigger('click')

      const removeBtn = wrapper.find('.die-card__remove')
      await removeBtn.trigger('click')

      const diceCards = wrapper.findAll('.die-card')
      expect(diceCards.length).toBe(0)
   })

   it('should have back link', async () => {
      const wrapper = await mountSuspended(DicePage)
      const backLink = wrapper.find('.dice-page__back')
      expect(backLink.exists()).toBe(true)
   })
})
