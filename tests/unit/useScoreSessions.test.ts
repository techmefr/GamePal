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

describe('useScoreSessions', () => {
   beforeEach(() => {
      localStorageMock.clear()
      vi.clearAllMocks()
   })

   it('should start with empty sessions', async () => {
      const TestComponent = defineComponent({
         setup() {
            const { sessions } = useScoreSessions()
            return { sessions }
         },
         template: '<div>{{ sessions.length }}</div>',
      })

      const wrapper = await mountSuspended(TestComponent)
      expect(wrapper.text()).toBe('0')
   })

   it('should create a new session', async () => {
      const TestComponent = defineComponent({
         setup() {
            const { sessions, createSession } = useScoreSessions()
            return { sessions, createSession }
         },
         template: '<div>{{ sessions.length }}</div>',
      })

      const wrapper = await mountSuspended(TestComponent)
      wrapper.vm.createSession('Test Game', ['Alice', 'Bob'], {
         maxRounds: null,
         maxScore: null,
         isTeamMode: false,
      })
      await nextTick()
      expect(wrapper.text()).toBe('1')
   })

   it('should create session with correct players', async () => {
      const TestComponent = defineComponent({
         setup() {
            const { sessions, createSession } = useScoreSessions()
            return { sessions, createSession }
         },
         template: '<div>{{ sessions[0]?.players?.length || 0 }}</div>',
      })

      const wrapper = await mountSuspended(TestComponent)
      wrapper.vm.createSession('Test', ['Alice', 'Bob', 'Charlie'], {
         maxRounds: null,
         maxScore: null,
         isTeamMode: false,
      })
      await nextTick()
      expect(wrapper.text()).toBe('3')
   })

   it('should get session by id', async () => {
      const TestComponent = defineComponent({
         setup() {
            const { createSession, getSession } = useScoreSessions()
            const session = createSession('Test', ['A', 'B'], {
               maxRounds: null,
               maxScore: null,
               isTeamMode: false,
            })
            const found = getSession(session.id)
            return { found }
         },
         template: '<div>{{ found?.name }}</div>',
      })

      const wrapper = await mountSuspended(TestComponent)
      expect(wrapper.text()).toBe('Test')
   })

   it('should update player score', async () => {
      const TestComponent = defineComponent({
         setup() {
            const { createSession, updatePlayerScore, getSession } = useScoreSessions()
            const session = createSession('Test', ['Alice'], {
               maxRounds: null,
               maxScore: null,
               isTeamMode: false,
            })
            const playerId = session.players[0].id
            updatePlayerScore(session.id, playerId, 1, 10)
            const updated = getSession(session.id)
            return { total: updated?.players[0].total }
         },
         template: '<div>{{ total }}</div>',
      })

      const wrapper = await mountSuspended(TestComponent)
      expect(wrapper.text()).toBe('10')
   })

   it('should add round', async () => {
      const TestComponent = defineComponent({
         setup() {
            const { createSession, addRound, getSession } = useScoreSessions()
            const session = createSession('Test', ['A'], {
               maxRounds: null,
               maxScore: null,
               isTeamMode: false,
            })
            addRound(session.id)
            const updated = getSession(session.id)
            return { round: updated?.currentRound }
         },
         template: '<div>{{ round }}</div>',
      })

      const wrapper = await mountSuspended(TestComponent)
      expect(wrapper.text()).toBe('2')
   })

   it('should delete session', async () => {
      const TestComponent = defineComponent({
         setup() {
            const { sessions, createSession, deleteSession } = useScoreSessions()
            const session = createSession('Test', ['A'], {
               maxRounds: null,
               maxScore: null,
               isTeamMode: false,
            })
            deleteSession(session.id)
            return { count: sessions.value.length }
         },
         template: '<div>{{ count }}</div>',
      })

      const wrapper = await mountSuspended(TestComponent)
      expect(wrapper.text()).toBe('0')
   })
})
