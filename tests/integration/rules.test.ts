import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import RulesPage from '~/pages/rules.vue'

describe('Rules Page', () => {
    it('should render rules title', async () => {
        const wrapper = await mountSuspended(RulesPage)
        expect(wrapper.text()).toContain('Rules')
    })

    it('should render three tabs', async () => {
        const wrapper = await mountSuspended(RulesPage)
        const text = wrapper.text()
        expect(text).toContain('Rules')
        expect(text).toContain('Scanner')
        expect(text).toContain('AI')
    })

    it('should show empty state when no rules', async () => {
        const wrapper = await mountSuspended(RulesPage)
        expect(wrapper.text()).toContain('No rules yet')
    })

    it('should have search input', async () => {
        const wrapper = await mountSuspended(RulesPage)
        const input = wrapper.find('input')
        expect(input.exists()).toBe(true)
    })

    it('should have add button', async () => {
        const wrapper = await mountSuspended(RulesPage)
        const buttons = wrapper.findAll('button')
        expect(buttons.length).toBeGreaterThan(0)
    })
})
