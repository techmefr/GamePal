import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent, nextTick } from 'vue'

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

describe('useTheme', () => {
   beforeEach(() => {
      localStorageMock.clear()
      vi.clearAllMocks()
      document.documentElement.removeAttribute('data-theme')
   })

   it('should default to dark theme', async () => {
      const TestComponent = defineComponent({
         setup() {
            const { theme } = useTheme()
            return { theme }
         },
         template: '<div>{{ theme }}</div>',
      })

      const wrapper = await mountSuspended(TestComponent)
      expect(wrapper.text()).toBe('dark')
   })

   it('should toggle theme', async () => {
      const TestComponent = defineComponent({
         setup() {
            const { theme, toggleTheme } = useTheme()
            return { theme, toggleTheme }
         },
         template: '<button @click="toggleTheme">{{ theme }}</button>',
      })

      const wrapper = await mountSuspended(TestComponent)
      expect(wrapper.text()).toBe('dark')

      await wrapper.find('button').trigger('click')
      await nextTick()
      expect(wrapper.text()).toBe('light')
   })

   it('should set specific theme', async () => {
      const TestComponent = defineComponent({
         setup() {
            const { theme, setTheme } = useTheme()
            return { theme, setTheme }
         },
         template: '<div>{{ theme }}</div>',
      })

      const wrapper = await mountSuspended(TestComponent)
      wrapper.vm.setTheme('light')
      await nextTick()
      expect(wrapper.text()).toBe('light')
   })

   it('should persist theme to localStorage', async () => {
      const TestComponent = defineComponent({
         setup() {
            const { setTheme } = useTheme()
            return { setTheme }
         },
         template: '<div></div>',
      })

      const wrapper = await mountSuspended(TestComponent)
      wrapper.vm.setTheme('light')
      await nextTick()
      expect(localStorageMock.setItem).toHaveBeenCalledWith('gamepal-theme', 'light')
   })
})
