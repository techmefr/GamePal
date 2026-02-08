import type { IRule, RuleSource } from '~/types'

const STORAGE_KEY = 'gamepal-rules'

const rules = ref<IRule[]>([])
const isInitialized = ref(false)

export function useRules() {
    function init(): void {
        if (isInitialized.value) return

        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                try {
                    rules.value = JSON.parse(stored)
                } catch {
                    rules.value = []
                }
            }
        }
        isInitialized.value = true
    }

    function save(): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(rules.value))
        }
    }

    function addRule(data: { game: string; title: string; content: string; source: RuleSource }): IRule {
        const now = new Date().toISOString()
        const rule: IRule = {
            id: generateId(),
            game: data.game,
            title: data.title,
            content: data.content,
            source: data.source,
            createdAt: now,
            updatedAt: now,
        }
        rules.value.push(rule)
        save()
        return rule
    }

    function updateRule(id: string, updates: Partial<Omit<IRule, 'id' | 'createdAt'>>): void {
        const rule = rules.value.find(r => r.id === id)
        if (rule) {
            Object.assign(rule, { ...updates, updatedAt: new Date().toISOString() })
            save()
        }
    }

    function deleteRule(id: string): void {
        const index = rules.value.findIndex(r => r.id === id)
        if (index !== -1) {
            rules.value.splice(index, 1)
            save()
        }
    }

    function getRule(id: string): IRule | null {
        return rules.value.find(r => r.id === id) ?? null
    }

    function getRulesByGame(game: string): IRule[] {
        return rules.value.filter(r => r.game.toLowerCase() === game.toLowerCase())
    }

    function searchRules(query: string): IRule[] {
        if (!query.trim()) return rules.value
        const search = query.toLowerCase()
        return rules.value.filter(
            r =>
                r.title.toLowerCase().includes(search) ||
                r.game.toLowerCase().includes(search) ||
                r.content.toLowerCase().includes(search)
        )
    }

    function getGameNames(): string[] {
        const set = new Set<string>()
        for (const rule of rules.value) {
            if (rule.game) set.add(rule.game)
        }
        return Array.from(set).sort()
    }

    function exportRules(): string {
        return JSON.stringify(rules.value, null, 2)
    }

    init()

    return {
        rules: readonly(rules),
        addRule,
        updateRule,
        deleteRule,
        getRule,
        getRulesByGame,
        searchRules,
        getGameNames,
        exportRules,
    }
}
