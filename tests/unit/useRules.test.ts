import { describe, it, expect, beforeEach, vi } from 'vitest'

const mockStorage: Record<string, string> = {}

vi.stubGlobal('localStorage', {
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, value: string) => {
        mockStorage[key] = value
    },
    removeItem: (key: string) => {
        delete mockStorage[key]
    },
    clear: () => {
        for (const key of Object.keys(mockStorage)) {
            delete mockStorage[key]
        }
    },
})

import { useRules } from '~/composables/useRules'

describe('useRules', () => {
    beforeEach(() => {
        localStorage.clear()
        const { rules } = useRules()
        while (rules.value.length > 0) {
            const { deleteRule } = useRules()
            deleteRule(rules.value[0].id)
        }
    })

    it('should start with empty rules', () => {
        const { rules } = useRules()
        expect(rules.value).toEqual([])
    })

    it('should add a rule', () => {
        const { addRule, rules } = useRules()

        const rule = addRule({
            game: 'Catan',
            title: 'Setup',
            content: 'Place the board in the center',
            source: 'manual',
        })

        expect(rule.id).toBeDefined()
        expect(rule.game).toBe('Catan')
        expect(rule.title).toBe('Setup')
        expect(rule.source).toBe('manual')
        expect(rules.value).toHaveLength(1)
    })

    it('should update a rule', () => {
        const { addRule, updateRule, getRule } = useRules()

        const rule = addRule({
            game: 'Catan',
            title: 'Setup',
            content: 'Original content',
            source: 'manual',
        })

        updateRule(rule.id, { title: 'Updated Setup', content: 'Updated content' })

        const updated = getRule(rule.id)
        expect(updated?.title).toBe('Updated Setup')
        expect(updated?.content).toBe('Updated content')
    })

    it('should delete a rule', () => {
        const { addRule, deleteRule, rules } = useRules()

        const rule = addRule({
            game: 'Catan',
            title: 'Setup',
            content: 'Content',
            source: 'manual',
        })

        deleteRule(rule.id)
        expect(rules.value).toHaveLength(0)
    })

    it('should get a rule by id', () => {
        const { addRule, getRule } = useRules()

        const rule = addRule({
            game: 'Catan',
            title: 'Setup',
            content: 'Content',
            source: 'manual',
        })

        const found = getRule(rule.id)
        expect(found?.id).toBe(rule.id)
    })

    it('should return null for unknown id', () => {
        const { getRule } = useRules()
        expect(getRule('nonexistent')).toBeNull()
    })

    it('should get rules by game', () => {
        const { addRule, getRulesByGame } = useRules()

        addRule({ game: 'Catan', title: 'Setup', content: 'A', source: 'manual' })
        addRule({ game: 'Catan', title: 'Turns', content: 'B', source: 'manual' })
        addRule({ game: 'Monopoly', title: 'Setup', content: 'C', source: 'manual' })

        const catanRules = getRulesByGame('Catan')
        expect(catanRules).toHaveLength(2)

        const monopolyRules = getRulesByGame('Monopoly')
        expect(monopolyRules).toHaveLength(1)
    })

    it('should search rules by title', () => {
        const { addRule, searchRules } = useRules()

        addRule({ game: 'Catan', title: 'Setup Guide', content: 'A', source: 'manual' })
        addRule({ game: 'Catan', title: 'Turn Order', content: 'B', source: 'manual' })

        const results = searchRules('setup')
        expect(results).toHaveLength(1)
        expect(results[0].title).toBe('Setup Guide')
    })

    it('should search rules by game name', () => {
        const { addRule, searchRules } = useRules()

        addRule({ game: 'Catan', title: 'Setup', content: 'A', source: 'manual' })
        addRule({ game: 'Monopoly', title: 'Setup', content: 'B', source: 'manual' })

        const results = searchRules('monopoly')
        expect(results).toHaveLength(1)
    })

    it('should search rules by content', () => {
        const { addRule, searchRules } = useRules()

        addRule({ game: 'Catan', title: 'Setup', content: 'Place hexagonal tiles', source: 'manual' })
        addRule({ game: 'Monopoly', title: 'Setup', content: 'Place the board', source: 'manual' })

        const results = searchRules('hexagonal')
        expect(results).toHaveLength(1)
    })

    it('should return all rules for empty search', () => {
        const { addRule, searchRules } = useRules()

        addRule({ game: 'Catan', title: 'Setup', content: 'A', source: 'manual' })
        addRule({ game: 'Monopoly', title: 'Setup', content: 'B', source: 'manual' })

        const results = searchRules('')
        expect(results).toHaveLength(2)
    })

    it('should get unique game names sorted', () => {
        const { addRule, getGameNames } = useRules()

        addRule({ game: 'Monopoly', title: 'A', content: 'A', source: 'manual' })
        addRule({ game: 'Catan', title: 'B', content: 'B', source: 'manual' })
        addRule({ game: 'Catan', title: 'C', content: 'C', source: 'manual' })

        const names = getGameNames()
        expect(names).toEqual(['Catan', 'Monopoly'])
    })

    it('should export rules as JSON', () => {
        const { addRule, exportRules } = useRules()

        addRule({ game: 'Catan', title: 'Setup', content: 'Content', source: 'manual' })

        const exported = exportRules()
        const parsed = JSON.parse(exported)
        expect(parsed).toHaveLength(1)
        expect(parsed[0].game).toBe('Catan')
    })
})
