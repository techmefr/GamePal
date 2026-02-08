import type { IAIConfig, IAIMessage, AIProvider } from '~/types'

const STORAGE_KEY = 'gamepal-ai-config'

interface IOpenAIResponse {
    choices: { message: { content: string } }[]
}

interface IAnthropicResponse {
    content: { type: string; text: string }[]
}

const config = ref<IAIConfig>({
    provider: 'openai',
    openaiKey: null,
    anthropicKey: null,
})
const isLoading = ref(false)
const error = ref<string | null>(null)
const isInitialized = ref(false)

export function useAI() {
    function init(): void {
        if (isInitialized.value) return

        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                try {
                    config.value = JSON.parse(stored)
                } catch {
                    config.value = { provider: 'openai', openaiKey: null, anthropicKey: null }
                }
            }
        }
        isInitialized.value = true
    }

    function save(): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(config.value))
        }
    }

    function setProvider(provider: AIProvider): void {
        config.value.provider = provider
        save()
    }

    function setApiKey(provider: AIProvider, key: string): void {
        if (provider === 'openai') {
            config.value.openaiKey = key
        } else {
            config.value.anthropicKey = key
        }
        save()
    }

    const isConfigured = computed((): boolean => {
        if (config.value.provider === 'openai') {
            return config.value.openaiKey !== null && config.value.openaiKey.length > 0
        }
        return config.value.anthropicKey !== null && config.value.anthropicKey.length > 0
    })

    const activeKey = computed((): string | null => {
        if (config.value.provider === 'openai') return config.value.openaiKey
        return config.value.anthropicKey
    })

    async function chat(messages: IAIMessage[], systemPrompt?: string): Promise<string> {
        if (!isConfigured.value) {
            throw new Error('AI is not configured')
        }

        isLoading.value = true
        error.value = null

        try {
            if (config.value.provider === 'openai') {
                return await chatOpenAI(messages, systemPrompt)
            }
            return await chatAnthropic(messages, systemPrompt)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error'
            error.value = message
            throw err
        } finally {
            isLoading.value = false
        }
    }

    async function chatOpenAI(messages: IAIMessage[], systemPrompt?: string): Promise<string> {
        const allMessages: IAIMessage[] = []
        if (systemPrompt) {
            allMessages.push({ role: 'system', content: systemPrompt })
        }
        allMessages.push(...messages)

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${activeKey.value}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: allMessages.map(m => ({ role: m.role, content: m.content })),
            }),
        })

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`)
        }

        const data: IOpenAIResponse = await response.json()
        return data.choices[0].message.content
    }

    async function chatAnthropic(messages: IAIMessage[], systemPrompt?: string): Promise<string> {
        const userMessages = messages.filter(m => m.role !== 'system')

        const body: Record<string, unknown> = {
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            messages: userMessages.map(m => ({ role: m.role, content: m.content })),
        }

        if (systemPrompt) {
            body.system = systemPrompt
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': activeKey.value!,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify(body),
        })

        if (!response.ok) {
            throw new Error(`Anthropic API error: ${response.status}`)
        }

        const data: IAnthropicResponse = await response.json()
        const textBlock = data.content.find(c => c.type === 'text')
        return textBlock?.text ?? ''
    }

    async function testConnection(): Promise<boolean> {
        try {
            await chat([{ role: 'user', content: 'Say "ok"' }])
            return true
        } catch {
            return false
        }
    }

    init()

    return {
        config: readonly(config),
        isLoading: readonly(isLoading),
        error: readonly(error),
        isConfigured,
        setProvider,
        setApiKey,
        chat,
        testConnection,
    }
}
