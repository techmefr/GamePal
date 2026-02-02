import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SettingsPage from '~/pages/settings.vue'

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

describe('Settings Page', () => {
   beforeEach(() => {
      localStorageMock.clear()
      vi.clearAllMocks()
      document.documentElement.removeAttribute('data-theme')
      document.documentElement.classList.remove('dyslexia-mode')
   })

   it('should render page title', async () => {
      const wrapper = await mountSuspended(SettingsPage)
      expect(wrapper.find('.heading').text()).toBeTruthy()
   })

   it('should have appearance section', async () => {
      const wrapper = await mountSuspended(SettingsPage)
      const section = wrapper.find('[data-test-id="appearance-section"]')
      expect(section.exists()).toBe(true)
   })

   it('should have theme toggle buttons', async () => {
      const wrapper = await mountSuspended(SettingsPage)
      const themeButtons = wrapper.findAll('[data-test-class="theme-btn"]')
      expect(themeButtons.length).toBe(2)
   })

   it('should have dark theme active by default', async () => {
      const wrapper = await mountSuspended(SettingsPage)
      const activeBtn = wrapper.find('[data-test-id="theme-dark"][data-active="true"]')
      expect(activeBtn.exists()).toBe(true)
   })

   it('should have language toggle buttons', async () => {
      const wrapper = await mountSuspended(SettingsPage)
      const localeButtons = wrapper.findAll('[data-test-class="locale-btn"]')
      expect(localeButtons.length).toBe(2)
   })

   it('should have dyslexia mode toggle', async () => {
      const wrapper = await mountSuspended(SettingsPage)
      const toggle = wrapper.find('[data-test-id="dyslexia-toggle"]')
      expect(toggle.exists()).toBe(true)
   })

   it('should toggle dyslexia mode', async () => {
      const wrapper = await mountSuspended(SettingsPage)
      const toggle = wrapper.find('[data-test-id="dyslexia-toggle"]')

      expect(toggle.attributes('data-active')).toBeUndefined()
      await toggle.trigger('click')
      expect(toggle.attributes('data-active')).toBe('true')
   })

   it('should have clear data button', async () => {
      const wrapper = await mountSuspended(SettingsPage)
      const clearBtn = wrapper.find('[data-test-id="clear-data-btn"]')
      expect(clearBtn.exists()).toBe(true)
   })

   it('should show version in footer', async () => {
      const wrapper = await mountSuspended(SettingsPage)
      const footer = wrapper.find('[data-test-id="footer"]')
      expect(footer.text()).toContain('v1.0.0')
   })

   it('should have back link', async () => {
      const wrapper = await mountSuspended(SettingsPage)
      const backLink = wrapper.find('[data-test-id="back-btn"]')
      expect(backLink.exists()).toBe(true)
   })

   it('should switch theme when clicking light button', async () => {
      const wrapper = await mountSuspended(SettingsPage)
      const lightBtn = wrapper.find('[data-test-id="theme-light"]')
      await lightBtn.trigger('click')

      expect(lightBtn.attributes('data-active')).toBe('true')
   })
})
