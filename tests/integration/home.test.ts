import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import HomePage from '~/pages/index.vue'

describe('Home Page', () => {
   it('should render app title', async () => {
      const wrapper = await mountSuspended(HomePage)
      expect(wrapper.text()).toContain('Gamepal')
   })

   it('should render all mode cards', async () => {
      const wrapper = await mountSuspended(HomePage)
      const cards = wrapper.findAll('.mode-card')
      expect(cards.length).toBe(8)
   })

   it('should have 5 available modes', async () => {
      const wrapper = await mountSuspended(HomePage)
      const availableCards = wrapper.findAll('.mode-card:not(.mode-card--disabled)')
      expect(availableCards.length).toBe(5)
   })

   it('should have 3 disabled modes', async () => {
      const wrapper = await mountSuspended(HomePage)
      const disabledCards = wrapper.findAll('.mode-card--disabled')
      expect(disabledCards.length).toBe(3)
   })

   it('should show coming soon badge on disabled modes', async () => {
      const wrapper = await mountSuspended(HomePage)
      const badges = wrapper.findAll('.mode-card__badge')
      expect(badges.length).toBe(3)
   })

   it('should have link to settings', async () => {
      const wrapper = await mountSuspended(HomePage)
      const settingsLink = wrapper.find('.home__settings')
      expect(settingsLink.exists()).toBe(true)
   })

   it('should have correct routes for available modes', async () => {
      const wrapper = await mountSuspended(HomePage)
      const links = wrapper.findAll('.mode-card:not(.mode-card--disabled)')

      const hrefs = links.map(link => link.attributes('href') || link.attributes('to'))
      expect(hrefs.some(h => h?.includes('random-picker'))).toBe(true)
      expect(hrefs.some(h => h?.includes('dice'))).toBe(true)
      expect(hrefs.some(h => h?.includes('time'))).toBe(true)
      expect(hrefs.some(h => h?.includes('scores'))).toBe(true)
      expect(hrefs.some(h => h?.includes('library'))).toBe(true)
   })
})
