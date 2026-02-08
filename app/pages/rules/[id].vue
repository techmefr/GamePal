<script setup lang="ts">
import {
    ArrowLeft,
    Play,
    Pause,
    Square,
    Volume2,
    Sparkles,
    Send,
    ChevronDown,
    ChevronUp,
} from 'lucide-vue-next'
import type { IAIMessage } from '~/types'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { getRule } = useRules()
const { isConfigured: isAIConfigured, isLoading: isAILoading, chat } = useAI()
const tts = useTTS()

const ruleId = computed(() => route.params.id as string)
const rule = computed(() => getRule(ruleId.value))

const isSummaryOpen = ref(false)
const summaryContent = ref('')
const isGeneratingSummary = ref(false)

const qaQuestion = ref('')
const qaMessages = ref<{ question: string; answer: string }[]>([])
const isAskingQuestion = ref(false)

const formattedCreatedAt = computed(() => {
    if (!rule.value) return ''
    return new Date(rule.value.createdAt).toLocaleDateString()
})

const formattedUpdatedAt = computed(() => {
    if (!rule.value) return ''
    return new Date(rule.value.updatedAt).toLocaleDateString()
})

function handlePlay(): void {
    if (!rule.value) return
    if (tts.isPaused.value) {
        tts.resume()
    } else {
        tts.speak(rule.value.content)
    }
}

function handleVoiceChange(event: Event): void {
    const target = event.target as HTMLSelectElement
    tts.setVoice(target.value)
}

function handleRateChange(event: Event): void {
    const target = event.target as HTMLInputElement
    tts.setRate(parseFloat(target.value))
}

async function handleGenerateSummary(): Promise<void> {
    if (!rule.value || !isAIConfigured.value) return

    isGeneratingSummary.value = true
    isSummaryOpen.value = true

    const systemPrompt = `You are a board game rules expert. Summarize the following rules in a concise 2-minute read. Keep the most important points. Write in the same language as the rules.`

    try {
        const result = await chat(
            [{ role: 'user', content: rule.value.content }],
            systemPrompt
        )
        summaryContent.value = result
    } catch {
        summaryContent.value = ''
    } finally {
        isGeneratingSummary.value = false
    }
}

async function handleAskQuestion(): Promise<void> {
    if (!rule.value || !qaQuestion.value.trim() || !isAIConfigured.value) return

    const question = qaQuestion.value.trim()
    qaQuestion.value = ''
    isAskingQuestion.value = true

    const systemPrompt = `You are a board game rules expert. Answer questions based ONLY on the following rules. Be concise and precise. If the answer is not in the rules, say so. Write in the same language as the question.\n\nRules:\n${rule.value.content}`

    const messages: IAIMessage[] = []
    for (const msg of qaMessages.value) {
        messages.push({ role: 'user', content: msg.question })
        messages.push({ role: 'assistant', content: msg.answer })
    }
    messages.push({ role: 'user', content: question })

    try {
        const answer = await chat(messages, systemPrompt)
        qaMessages.value.push({ question, answer })
    } catch {
        qaMessages.value.push({ question, answer: 'Error' })
    } finally {
        isAskingQuestion.value = false
    }
}

onMounted(() => {
    if (!rule.value) {
        router.push('/rules')
    }
})
</script>

<template>
    <div class="min-h-dvh bg-background">
        <header class="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border">
            <div class="flex items-center gap-4 px-4 py-4">
                <NuxtLink
                    to="/rules"
                    class="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    v-motion
                    :initial="{ opacity: 0, x: -10 }"
                    :enter="{ opacity: 1, x: 0 }"
                >
                    <ArrowLeft class="h-5 w-5" />
                </NuxtLink>
                <h1
                    class="flex-1 font-display text-lg font-bold tracking-tight truncate"
                    v-motion
                    :initial="{ opacity: 0, y: -10 }"
                    :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
                >
                    {{ rule?.title ?? '' }}
                </h1>
            </div>
        </header>

        <div v-if="rule" class="p-4 space-y-6">
            <!-- Metadata -->
            <section
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 150 } }"
            >
                <h2 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    {{ t('rules.detail.metadata') }}
                </h2>
                <UiCard class="p-4">
                    <div class="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p class="text-muted-foreground">{{ t('rules.detail.game') }}</p>
                            <UiBadge variant="secondary" class="mt-1">{{ rule.game }}</UiBadge>
                        </div>
                        <div>
                            <p class="text-muted-foreground">{{ t('rules.detail.source') }}</p>
                            <UiBadge variant="outline" class="mt-1">
                                {{ t(`rules.source.${rule.source}`) }}
                            </UiBadge>
                        </div>
                        <div>
                            <p class="text-muted-foreground">{{ t('rules.detail.created') }}</p>
                            <p class="font-medium mt-1">{{ formattedCreatedAt }}</p>
                        </div>
                        <div>
                            <p class="text-muted-foreground">{{ t('rules.detail.updated') }}</p>
                            <p class="font-medium mt-1">{{ formattedUpdatedAt }}</p>
                        </div>
                    </div>
                </UiCard>
            </section>

            <!-- Content -->
            <section
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
            >
                <h2 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    {{ t('rules.detail.content') }}
                </h2>
                <UiCard class="p-4">
                    <div class="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                        {{ rule.content }}
                    </div>
                </UiCard>
            </section>

            <!-- TTS -->
            <section
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 250 } }"
            >
                <h2 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    <Volume2 class="h-3.5 w-3.5 inline mr-1" />
                    {{ t('rules.detail.tts') }}
                </h2>
                <UiCard class="p-4 space-y-3">
                    <div class="flex gap-2">
                        <UiButton
                            v-if="!tts.isSpeaking.value || tts.isPaused.value"
                            size="sm"
                            @click="handlePlay"
                        >
                            <Play class="h-4 w-4 mr-1" />
                            {{ tts.isPaused.value ? t('rules.detail.resume') : t('rules.detail.play') }}
                        </UiButton>
                        <UiButton
                            v-if="tts.isSpeaking.value && !tts.isPaused.value"
                            size="sm"
                            variant="secondary"
                            @click="tts.pause()"
                        >
                            <Pause class="h-4 w-4 mr-1" />
                            {{ t('rules.detail.pause') }}
                        </UiButton>
                        <UiButton
                            v-if="tts.isSpeaking.value"
                            size="sm"
                            variant="outline"
                            @click="tts.stop()"
                        >
                            <Square class="h-4 w-4 mr-1" />
                            {{ t('rules.detail.stop') }}
                        </UiButton>
                    </div>

                    <div v-if="tts.voices.value.length > 0" class="space-y-2">
                        <label class="text-xs text-muted-foreground">{{ t('rules.detail.voice') }}</label>
                        <select
                            class="w-full rounded-lg border border-input bg-secondary px-3 py-2 text-sm text-foreground"
                            :value="tts.selectedVoiceURI.value"
                            @change="handleVoiceChange"
                        >
                            <option
                                v-for="voice in tts.voices.value"
                                :key="voice.voiceURI"
                                :value="voice.voiceURI"
                            >
                                {{ voice.name }} ({{ voice.lang }})
                            </option>
                        </select>
                    </div>

                    <div class="space-y-1">
                        <label class="text-xs text-muted-foreground">
                            {{ t('rules.detail.speed') }}: {{ tts.rate.value.toFixed(1) }}x
                        </label>
                        <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            :value="tts.rate.value"
                            class="w-full accent-primary"
                            @input="handleRateChange"
                        />
                    </div>
                </UiCard>
            </section>

            <!-- AI Summary -->
            <section
                v-if="isAIConfigured"
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
            >
                <h2 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    <Sparkles class="h-3.5 w-3.5 inline mr-1" />
                    {{ t('rules.detail.summary') }}
                </h2>
                <UiCard class="overflow-hidden">
                    <button
                        v-if="!summaryContent && !isGeneratingSummary"
                        class="w-full p-4 text-left hover:bg-muted/50 transition-colors"
                        @click="handleGenerateSummary"
                    >
                        <span class="text-sm text-primary font-medium">
                            {{ t('rules.detail.generateSummary') }}
                        </span>
                    </button>

                    <div v-if="isGeneratingSummary" class="p-4">
                        <p class="text-sm text-muted-foreground animate-pulse">
                            {{ t('rules.detail.generatingSummary') }}
                        </p>
                    </div>

                    <div v-if="summaryContent">
                        <button
                            class="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                            @click="isSummaryOpen = !isSummaryOpen"
                        >
                            <span class="font-medium text-sm">{{ t('rules.detail.summary') }}</span>
                            <ChevronUp v-if="isSummaryOpen" class="h-4 w-4 text-muted-foreground" />
                            <ChevronDown v-else class="h-4 w-4 text-muted-foreground" />
                        </button>
                        <div v-if="isSummaryOpen" class="px-4 pb-4">
                            <div class="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                                {{ summaryContent }}
                            </div>
                        </div>
                    </div>
                </UiCard>
            </section>

            <!-- Q&A -->
            <section
                v-if="isAIConfigured"
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 350 } }"
            >
                <h2 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    {{ t('rules.detail.qa') }}
                </h2>
                <UiCard class="p-4 space-y-3">
                    <div v-if="qaMessages.length > 0" class="space-y-3 max-h-80 overflow-y-auto">
                        <div v-for="(msg, index) in qaMessages" :key="index" class="space-y-2">
                            <div class="flex justify-end">
                                <div class="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-3 py-2 text-sm max-w-[80%]">
                                    {{ msg.question }}
                                </div>
                            </div>
                            <div class="flex justify-start">
                                <div class="bg-muted rounded-2xl rounded-bl-sm px-3 py-2 text-sm max-w-[80%] whitespace-pre-wrap">
                                    {{ msg.answer }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="isAskingQuestion" class="flex justify-start">
                        <div class="bg-muted rounded-2xl px-3 py-2 text-sm text-muted-foreground animate-pulse">
                            {{ t('rules.detail.asking') }}
                        </div>
                    </div>

                    <div class="flex gap-2">
                        <UiInput
                            v-model="qaQuestion"
                            :placeholder="t('rules.detail.askQuestion')"
                            class="flex-1"
                            @keyup.enter="handleAskQuestion"
                        />
                        <UiButton
                            size="icon"
                            :disabled="!qaQuestion.trim() || isAskingQuestion"
                            @click="handleAskQuestion"
                        >
                            <Send class="h-4 w-4" />
                        </UiButton>
                    </div>
                </UiCard>
            </section>
        </div>

        <div v-else class="flex items-center justify-center min-h-[50vh]">
            <p class="text-muted-foreground">{{ t('common.loading') }}</p>
        </div>
    </div>
</template>
