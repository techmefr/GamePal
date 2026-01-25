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

describe('useLocalStorage', () => {
   beforeEach(() => {
      localStorageMock.clear()
      vi.clearAllMocks()
   })

   it('should return default value when storage is empty', async () => {
      const TestComponent = defineComponent({
         setup() {
            const { data } = useLocalStorage('test-key', 'default')
            return { data }
         },
         template: '<div>{{ data }}</div>',
      })

      const wrapper = await mountSuspended(TestComponent)
      expect(wrapper.text()).toBe('default')
   })

   it('should load stored value', async () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify('stored-value'))

      const TestComponent = defineComponent({
         setup() {
            const { data } = useLocalStorage('test-key', 'default')
            return { data }
         },
         template: '<div>{{ data }}</div>',
      })

      const wrapper = await mountSuspended(TestComponent)
      await nextTick()
      expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key')
   })

   it('should save value on change', async () => {
      const TestComponent = defineComponent({
         setup() {
            const { data } = useLocalStorage('test-key', 'default')
            return { data }
         },
         template: '<div>{{ data }}</div>',
      })

      const wrapper = await mountSuspended(TestComponent)
      wrapper.vm.data = 'new-value'
      await nextTick()
      expect(localStorageMock.setItem).toHaveBeenCalled()
   })

   it('should work with objects', async () => {
      const defaultValue = { name: 'test', count: 0 }

      const TestComponent = defineComponent({
         setup() {
            const { data } = useLocalStorage('test-key', defaultValue)
            return { data }
         },
         template: '<div>{{ data.name }}</div>',
      })

      const wrapper = await mountSuspended(TestComponent)
      expect(wrapper.text()).toBe('test')
   })

   it('should work with arrays', async () => {
      const defaultValue = ['a', 'b', 'c']

      const TestComponent = defineComponent({
         setup() {
            const { data } = useLocalStorage('test-key', defaultValue)
            return { data }
         },
         template: '<div>{{ data.length }}</div>',
      })

      const wrapper = await mountSuspended(TestComponent)
      expect(wrapper.text()).toBe('3')
   })
})
