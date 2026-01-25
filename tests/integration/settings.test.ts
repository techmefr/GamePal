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
      const sections = wrapper.findAll('.settings-section')
      expect(sections.length).toBeGreaterThanOrEqual(1)
   })

   it('should have theme toggle buttons', async () => {
      const wrapper = await mountSuspended(SettingsPage)
      const themeButtons = wrapper.findAll('.theme-toggle__btn')
      expect(themeButtons.length).toBe(2)
   })

   it('should have dark theme active by default', async () => {
      const wrapper = await mountSuspended(SettingsPage)
      const activeBtn = wrapper.find('.theme-toggle__btn--active')
      expect(activeBtn.exists()).toBe(true)
   })

   it('should have language toggle buttons', async () => {
      const wrapper = await mountSuspended(SettingsPage)
      const localeButtons = wrapper.findAll('.locale-toggle__btn')
      expect(localeButtons.length).toBe(2)
   })

   it('should have dyslexia mode toggle', async () => {
      const wrapper = await mountSuspended(SettingsPage)
      const toggle = wrapper.find('.toggle-switch')
      expect(toggle.exists()).toBe(true)
   })

   it('should toggle dyslexia mode', async () => {
      const wrapper = await mountSuspended(SettingsPage)
      const toggle = wrapper.find('.toggle-switch')

      expect(toggle.classes()).not.toContain('toggle-switch--active')
      await toggle.trigger('click')
      expect(toggle.classes()).toContain('toggle-switch--active')
   })

   it('should have clear data button', async () => {
      const wrapper = await mountSuspended(SettingsPage)
      const clearBtn = wrapper.find('.setting-item--danger')
      expect(clearBtn.exists()).toBe(true)
   })

   it('should show version in footer', async () => {
      const wrapper = await mountSuspended(SettingsPage)
      const footer = wrapper.find('.settings-page__footer')
      expect(footer.text()).toContain('v1.0.0')
   })

   it('should have back link', async () => {
      const wrapper = await mountSuspended(SettingsPage)
      const backLink = wrapper.find('.settings-page__back')
      expect(backLink.exists()).toBe(true)
   })

   it('should switch theme when clicking light button', async () => {
      const wrapper = await mountSuspended(SettingsPage)
      const lightBtn = wrapper.findAll('.theme-toggle__btn')[1]
      await lightBtn.trigger('click')

      expect(lightBtn.classes()).toContain('theme-toggle__btn--active')
   })
})
