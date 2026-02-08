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

import { useAI } from '~/composables/useAI'

describe('useAI', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.restoreAllMocks()
        const { setProvider, setApiKey } = useAI()
        setProvider('openai')
        setApiKey('openai', '')
        setApiKey('anthropic', '')
    })

    it('should set provider', () => {
        const { setProvider, config } = useAI()
        setProvider('anthropic')
        expect(config.value.provider).toBe('anthropic')
    })

    it('should not be configured without API key', () => {
        const { isConfigured } = useAI()
        expect(isConfigured.value).toBe(false)
    })

    it('should set OpenAI API key', () => {
        const { setApiKey, config } = useAI()
        setApiKey('openai', 'sk-test-key')
        expect(config.value.openaiKey).toBe('sk-test-key')
    })

    it('should set Anthropic API key', () => {
        const { setApiKey, config } = useAI()
        setApiKey('anthropic', 'sk-ant-test-key')
        expect(config.value.anthropicKey).toBe('sk-ant-test-key')
    })

    it('should be configured when OpenAI key is set', () => {
        const { setApiKey, isConfigured } = useAI()
        setApiKey('openai', 'sk-test-key')
        expect(isConfigured.value).toBe(true)
    })

    it('should be configured when Anthropic key is set and provider is anthropic', () => {
        const { setProvider, setApiKey, isConfigured } = useAI()
        setProvider('anthropic')
        setApiKey('anthropic', 'sk-ant-test-key')
        expect(isConfigured.value).toBe(true)
    })

    it('should not be configured when wrong provider key is set', () => {
        const { setProvider, setApiKey, isConfigured } = useAI()
        setProvider('anthropic')
        setApiKey('openai', 'sk-test-key')
        expect(isConfigured.value).toBe(false)
    })

    it('should call OpenAI API with correct format', async () => {
        const { setApiKey, chat } = useAI()
        setApiKey('openai', 'sk-test-key')

        const mockResponse = {
            choices: [{ message: { content: 'Hello from OpenAI' } }],
        }

        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockResponse),
        }))

        const result = await chat([{ role: 'user', content: 'Hello' }])

        expect(result).toBe('Hello from OpenAI')
        expect(fetch).toHaveBeenCalledWith(
            'https://api.openai.com/v1/chat/completions',
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    Authorization: 'Bearer sk-test-key',
                }),
            })
        )
    })

    it('should call Anthropic API with correct format', async () => {
        const { setProvider, setApiKey, chat } = useAI()
        setProvider('anthropic')
        setApiKey('anthropic', 'sk-ant-test-key')

        const mockResponse = {
            content: [{ type: 'text', text: 'Hello from Anthropic' }],
        }

        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockResponse),
        }))

        const result = await chat([{ role: 'user', content: 'Hello' }])

        expect(result).toBe('Hello from Anthropic')
        expect(fetch).toHaveBeenCalledWith(
            'https://api.anthropic.com/v1/messages',
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'x-api-key': 'sk-ant-test-key',
                    'anthropic-dangerous-direct-browser-access': 'true',
                }),
            })
        )
    })

    it('should throw when API returns error', async () => {
        const { setApiKey, chat } = useAI()
        setApiKey('openai', 'sk-test-key')

        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            status: 401,
        }))

        await expect(chat([{ role: 'user', content: 'Hello' }])).rejects.toThrow('OpenAI API error: 401')
    })

    it('should set error ref on failure', async () => {
        const { setApiKey, chat, error } = useAI()
        setApiKey('openai', 'sk-test-key')

        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            status: 500,
        }))

        try {
            await chat([{ role: 'user', content: 'Hello' }])
        } catch {
            // expected
        }

        expect(error.value).toBe('OpenAI API error: 500')
    })

    it('should throw when not configured', async () => {
        const { chat } = useAI()
        await expect(chat([{ role: 'user', content: 'Hello' }])).rejects.toThrow('AI is not configured')
    })

    it('should persist config to localStorage', () => {
        const { setProvider, setApiKey } = useAI()
        setProvider('anthropic')
        setApiKey('anthropic', 'sk-ant-key')

        const stored = localStorage.getItem('gamepal-ai-config')
        expect(stored).toBeTruthy()

        const parsed = JSON.parse(stored!)
        expect(parsed.provider).toBe('anthropic')
        expect(parsed.anthropicKey).toBe('sk-ant-key')
    })
})
