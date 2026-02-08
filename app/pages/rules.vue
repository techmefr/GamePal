<script setup lang="ts">
import {
    ArrowLeft,
    Search,
    Plus,
    Pencil,
    Trash2,
    Camera,
    X,
    Sparkles,
    Settings,
    Upload,
    ScanText,
    Save,
} from 'lucide-vue-next'
import type { RuleSource } from '~/types'

const { t } = useI18n()
const router = useRouter()
const {
    rules,
    addRule,
    updateRule,
    deleteRule,
    searchRules,
    getGameNames,
} = useRules()
const { isConfigured: isAIConfigured, isLoading: isAILoading, chat, error: aiError } = useAI()
const ocr = useOCR()

const activeTab = ref('rules')
const searchQuery = ref('')
const selectedGame = ref<string | null>(null)

const isAddingRule = ref(false)
const editingRuleId = ref<string | null>(null)
const formGame = ref('')
const formTitle = ref('')
const formContent = ref('')

const ocrImagePreview = ref<string | null>(null)
const ocrFile = ref<File | null>(null)
const ocrExtractedText = ref('')
const isOcrSaving = ref(false)
const ocrGame = ref('')
const ocrTitle = ref('')

const aiGameQuery = ref('')
const aiResult = ref('')
const aiGame = ref('')
const aiTitle = ref('')
const isAiSaving = ref(false)

const tabs = computed(() => [
    { value: 'rules', label: t('rules.tabs.rules') },
    { value: 'scanner', label: t('rules.tabs.scanner') },
    { value: 'ai', label: t('rules.tabs.ai') },
])

const gameNames = computed(() => getGameNames())

const filteredRules = computed(() => {
    let result = searchQuery.value ? searchRules(searchQuery.value) : rules.value
    if (selectedGame.value) {
        result = result.filter(r => r.game === selectedGame.value)
    }
    return result
})

function getSourceVariant(source: RuleSource): 'secondary' | 'outline' | 'default' {
    if (source === 'manual') return 'secondary'
    if (source === 'ocr') return 'outline'
    return 'default'
}

function openAddForm(): void {
    isAddingRule.value = true
    editingRuleId.value = null
    formGame.value = ''
    formTitle.value = ''
    formContent.value = ''
}

function openEditForm(id: string): void {
    const rule = rules.value.find(r => r.id === id)
    if (!rule) return
    editingRuleId.value = id
    isAddingRule.value = true
    formGame.value = rule.game
    formTitle.value = rule.title
    formContent.value = rule.content
}

function closeForm(): void {
    isAddingRule.value = false
    editingRuleId.value = null
    formGame.value = ''
    formTitle.value = ''
    formContent.value = ''
}

function handleSaveRule(): void {
    if (!formGame.value.trim() || !formTitle.value.trim() || !formContent.value.trim()) return

    if (editingRuleId.value) {
        updateRule(editingRuleId.value, {
            game: formGame.value.trim(),
            title: formTitle.value.trim(),
            content: formContent.value.trim(),
        })
    } else {
        addRule({
            game: formGame.value.trim(),
            title: formTitle.value.trim(),
            content: formContent.value.trim(),
            source: 'manual',
        })
    }
    closeForm()
}

function handleDeleteRule(id: string, title: string): void {
    if (confirm(t('rules.deleteConfirm', { title }))) {
        deleteRule(id)
    }
}

function handleOcrFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    ocrFile.value = file
    ocrExtractedText.value = ''

    const reader = new FileReader()
    reader.onload = (e: ProgressEvent<FileReader>) => {
        ocrImagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
}

async function handleOcrScan(): Promise<void> {
    if (!ocrFile.value) return
    try {
        const text = await ocr.extractText(ocrFile.value)
        ocrExtractedText.value = text
    } catch {
        // error is exposed via ocr.error
    }
}

function handleOcrSave(): void {
    if (!ocrGame.value.trim() || !ocrTitle.value.trim() || !ocrExtractedText.value.trim()) return
    isOcrSaving.value = true
    addRule({
        game: ocrGame.value.trim(),
        title: ocrTitle.value.trim(),
        content: ocrExtractedText.value.trim(),
        source: 'ocr',
    })
    ocrGame.value = ''
    ocrTitle.value = ''
    ocrExtractedText.value = ''
    ocrImagePreview.value = null
    ocrFile.value = null
    isOcrSaving.value = false
    activeTab.value = 'rules'
}

function resetOcr(): void {
    ocrFile.value = null
    ocrImagePreview.value = null
    ocrExtractedText.value = ''
    ocrGame.value = ''
    ocrTitle.value = ''
    ocr.reset()
}

async function handleAiSearch(): Promise<void> {
    if (!aiGameQuery.value.trim()) return

    const systemPrompt = `You are a board game rules expert. When given a game name, provide clear, well-structured rules in the user's language. Use numbered lists and sections for clarity. Be comprehensive but concise.`
    const userMessage = `Provide the complete rules for the board game: ${aiGameQuery.value.trim()}`

    try {
        const result = await chat(
            [{ role: 'user', content: userMessage }],
            systemPrompt
        )
        aiResult.value = result
        aiGame.value = aiGameQuery.value.trim()
        aiTitle.value = aiGameQuery.value.trim()
    } catch {
        // error is exposed via aiError
    }
}

function handleAiSave(): void {
    if (!aiGame.value.trim() || !aiTitle.value.trim() || !aiResult.value.trim()) return
    isAiSaving.value = true
    addRule({
        game: aiGame.value.trim(),
        title: aiTitle.value.trim(),
        content: aiResult.value.trim(),
        source: 'ai',
    })
    aiGameQuery.value = ''
    aiResult.value = ''
    aiGame.value = ''
    aiTitle.value = ''
    isAiSaving.value = false
    activeTab.value = 'rules'
}
</script>

<template>
    <div class="min-h-dvh bg-background">
        <header class="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border">
            <div class="flex items-center gap-4 px-4 py-4">
                <NuxtLink
                    to="/"
                    class="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    v-motion
                    :initial="{ opacity: 0, x: -10 }"
                    :enter="{ opacity: 1, x: 0 }"
                >
                    <ArrowLeft class="h-5 w-5" />
                </NuxtLink>
                <h1
                    class="flex-1 font-display text-lg font-bold tracking-tight"
                    v-motion
                    :initial="{ opacity: 0, y: -10 }"
                    :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
                >
                    {{ t('rules.title') }}
                </h1>
            </div>

            <div class="px-4 pb-3">
                <UiTabs
                    :tabs="tabs"
                    :model-value="activeTab"
                    @update:model-value="activeTab = $event"
                />
            </div>
        </header>

        <div class="p-4">
            <!-- Rules Tab -->
            <div v-if="activeTab === 'rules'" class="space-y-4">
                <div
                    class="flex gap-2"
                    v-motion
                    :initial="{ opacity: 0, y: 20 }"
                    :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
                >
                    <div class="relative flex-1">
                        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <UiInput
                            v-model="searchQuery"
                            :placeholder="t('rules.search')"
                            class="pl-10"
                        />
                    </div>
                    <UiButton size="icon" @click="openAddForm">
                        <Plus class="h-5 w-5" />
                    </UiButton>
                </div>

                <div
                    v-if="gameNames.length > 0"
                    class="flex flex-wrap gap-2"
                    v-motion
                    :initial="{ opacity: 0, y: 20 }"
                    :enter="{ opacity: 1, y: 0, transition: { delay: 150 } }"
                >
                    <button
                        class="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                        :class="selectedGame === null
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'"
                        @click="selectedGame = null"
                    >
                        {{ t('rules.allGames') }}
                    </button>
                    <button
                        v-for="game in gameNames"
                        :key="game"
                        class="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                        :class="selectedGame === game
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'"
                        @click="selectedGame = selectedGame === game ? null : game"
                    >
                        {{ game }}
                    </button>
                </div>

                <!-- Add/Edit Form -->
                <UiCard
                    v-if="isAddingRule"
                    class="p-4 space-y-3"
                    v-motion
                    :initial="{ opacity: 0, scale: 0.95 }"
                    :enter="{ opacity: 1, scale: 1 }"
                >
                    <div class="flex items-center justify-between">
                        <h3 class="font-semibold">
                            {{ editingRuleId ? t('rules.editRule') : t('rules.addRule') }}
                        </h3>
                        <button
                            class="p-1 text-muted-foreground hover:text-foreground transition-colors"
                            @click="closeForm"
                        >
                            <X class="h-4 w-4" />
                        </button>
                    </div>
                    <UiInput
                        v-model="formGame"
                        :placeholder="t('rules.gameNamePlaceholder')"
                    />
                    <UiInput
                        v-model="formTitle"
                        :placeholder="t('rules.ruleTitlePlaceholder')"
                    />
                    <UiTextarea
                        v-model="formContent"
                        :placeholder="t('rules.ruleContentPlaceholder')"
                        :rows="6"
                    />
                    <UiButton
                        class="w-full"
                        :disabled="!formGame.trim() || !formTitle.trim() || !formContent.trim()"
                        @click="handleSaveRule"
                    >
                        {{ t('common.save') }}
                    </UiButton>
                </UiCard>

                <!-- Rules List -->
                <div
                    v-if="filteredRules.length > 0"
                    class="space-y-2"
                >
                    <UiCard
                        v-for="(rule, index) in filteredRules"
                        :key="rule.id"
                        hoverable
                        class="p-4 cursor-pointer"
                        v-motion
                        :initial="{ opacity: 0, y: 20 }"
                        :enter="{ opacity: 1, y: 0, transition: { delay: 200 + index * 50 } }"
                        @click="router.push(`/rules/${rule.id}`)"
                    >
                        <div class="flex items-start gap-3">
                            <div class="flex-1 min-w-0">
                                <h3 class="font-medium truncate">{{ rule.title }}</h3>
                                <p class="text-sm text-muted-foreground truncate mt-0.5">
                                    {{ rule.content.substring(0, 100) }}
                                </p>
                                <div class="flex gap-2 mt-2">
                                    <UiBadge variant="secondary">{{ rule.game }}</UiBadge>
                                    <UiBadge :variant="getSourceVariant(rule.source)">
                                        {{ t(`rules.source.${rule.source}`) }}
                                    </UiBadge>
                                </div>
                            </div>
                            <div class="flex gap-1 shrink-0">
                                <button
                                    class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                    @click.stop="openEditForm(rule.id)"
                                >
                                    <Pencil class="h-4 w-4" />
                                </button>
                                <button
                                    class="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                    @click.stop="handleDeleteRule(rule.id, rule.title)"
                                >
                                    <Trash2 class="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </UiCard>
                </div>

                <!-- Empty State -->
                <div
                    v-else
                    class="flex flex-col items-center justify-center py-16 text-center"
                    v-motion
                    :initial="{ opacity: 0, y: 20 }"
                    :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
                >
                    <p class="text-muted-foreground mb-2">
                        {{ searchQuery ? t('rules.noResults') : t('rules.empty') }}
                    </p>
                    <p v-if="!searchQuery" class="text-sm text-muted-foreground">
                        {{ t('rules.addFirst') }}
                    </p>
                </div>
            </div>

            <!-- Scanner Tab -->
            <div v-if="activeTab === 'scanner'" class="space-y-4">
                <div
                    v-motion
                    :initial="{ opacity: 0, y: 20 }"
                    :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
                >
                    <UiCard class="p-4 space-y-4">
                        <div class="flex items-center gap-3">
                            <ScanText class="h-5 w-5 text-primary" />
                            <h3 class="font-semibold">{{ t('rules.scanner.title') }}</h3>
                        </div>

                        <div class="flex gap-2">
                            <label class="flex-1">
                                <UiButton variant="outline" class="w-full" as="span">
                                    <Upload class="h-4 w-4 mr-2" />
                                    {{ t('rules.scanner.selectImage') }}
                                </UiButton>
                                <input
                                    type="file"
                                    accept="image/*"
                                    class="hidden"
                                    @change="handleOcrFileSelect"
                                />
                            </label>
                            <label>
                                <UiButton variant="outline" as="span">
                                    <Camera class="h-4 w-4 mr-2" />
                                    {{ t('rules.scanner.takePhoto') }}
                                </UiButton>
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    class="hidden"
                                    @change="handleOcrFileSelect"
                                />
                            </label>
                        </div>

                        <div v-if="ocrImagePreview" class="space-y-3">
                            <div class="relative">
                                <img
                                    :src="ocrImagePreview"
                                    alt="Preview"
                                    class="w-full rounded-lg max-h-64 object-contain bg-muted"
                                />
                                <button
                                    class="absolute top-2 right-2 p-1 rounded-full bg-background/80 text-muted-foreground hover:text-foreground"
                                    @click="resetOcr"
                                >
                                    <X class="h-4 w-4" />
                                </button>
                            </div>

                            <UiButton
                                class="w-full"
                                :disabled="ocr.isLoading.value"
                                @click="handleOcrScan"
                            >
                                <ScanText class="h-4 w-4 mr-2" />
                                {{ ocr.isLoading.value ? t('rules.scanner.scanning') : t('rules.scanner.scan') }}
                            </UiButton>

                            <div v-if="ocr.isLoading.value" class="space-y-2">
                                <div class="h-2 rounded-full bg-muted overflow-hidden">
                                    <div
                                        class="h-full bg-primary rounded-full transition-all duration-300"
                                        :style="{ width: `${ocr.progress.value}%` }"
                                    ></div>
                                </div>
                                <p class="text-xs text-muted-foreground text-center">
                                    {{ t('rules.scanner.progress', { progress: ocr.progress.value }) }}
                                </p>
                            </div>
                        </div>

                        <div v-if="ocr.error.value" class="text-sm text-destructive">
                            {{ ocr.error.value }}
                        </div>
                    </UiCard>
                </div>

                <UiCard
                    v-if="ocrExtractedText"
                    class="p-4 space-y-3"
                    v-motion
                    :initial="{ opacity: 0, y: 20 }"
                    :enter="{ opacity: 1, y: 0 }"
                >
                    <h3 class="font-semibold">{{ t('rules.scanner.result') }}</h3>
                    <UiTextarea
                        v-model="ocrExtractedText"
                        :rows="8"
                    />
                    <UiInput
                        v-model="ocrGame"
                        :placeholder="t('rules.gameNamePlaceholder')"
                    />
                    <UiInput
                        v-model="ocrTitle"
                        :placeholder="t('rules.ruleTitlePlaceholder')"
                    />
                    <UiButton
                        class="w-full"
                        :disabled="!ocrGame.trim() || !ocrTitle.trim() || !ocrExtractedText.trim()"
                        @click="handleOcrSave"
                    >
                        <Save class="h-4 w-4 mr-2" />
                        {{ t('rules.scanner.saveRule') }}
                    </UiButton>
                </UiCard>

                <div
                    v-if="!ocrImagePreview && !ocrExtractedText"
                    class="flex flex-col items-center justify-center py-16 text-center text-muted-foreground"
                    v-motion
                    :initial="{ opacity: 0 }"
                    :enter="{ opacity: 1, transition: { delay: 200 } }"
                >
                    <ScanText class="h-10 w-10 mb-3 opacity-50" />
                    <p>{{ t('rules.scanner.title') }}</p>
                </div>
            </div>

            <!-- AI Tab -->
            <div v-if="activeTab === 'ai'" class="space-y-4">
                <div
                    v-if="!isAIConfigured"
                    class="flex flex-col items-center justify-center py-16 text-center"
                    v-motion
                    :initial="{ opacity: 0, y: 20 }"
                    :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
                >
                    <Sparkles class="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
                    <p class="text-muted-foreground mb-3">{{ t('rules.ai.notConfigured') }}</p>
                    <NuxtLink to="/settings">
                        <UiButton variant="outline">
                            <Settings class="h-4 w-4 mr-2" />
                            {{ t('rules.ai.goToSettings') }}
                        </UiButton>
                    </NuxtLink>
                </div>

                <template v-else>
                    <UiCard
                        class="p-4 space-y-3"
                        v-motion
                        :initial="{ opacity: 0, y: 20 }"
                        :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
                    >
                        <div class="flex items-center gap-3">
                            <Sparkles class="h-5 w-5 text-primary" />
                            <h3 class="font-semibold">{{ t('rules.ai.title') }}</h3>
                        </div>

                        <UiInput
                            v-model="aiGameQuery"
                            :placeholder="t('rules.ai.searchGamePlaceholder')"
                        />

                        <UiButton
                            class="w-full"
                            :disabled="!aiGameQuery.trim() || isAILoading"
                            @click="handleAiSearch"
                        >
                            <Sparkles class="h-4 w-4 mr-2" />
                            {{ isAILoading ? t('rules.ai.searching') : t('rules.ai.searchRules') }}
                        </UiButton>

                        <div v-if="aiError" class="text-sm text-destructive">
                            {{ aiError }}
                        </div>
                    </UiCard>

                    <UiCard
                        v-if="aiResult"
                        class="p-4 space-y-3"
                        v-motion
                        :initial="{ opacity: 0, y: 20 }"
                        :enter="{ opacity: 1, y: 0 }"
                    >
                        <h3 class="font-semibold">{{ t('rules.ai.result') }}</h3>
                        <div class="whitespace-pre-wrap text-sm text-foreground bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                            {{ aiResult }}
                        </div>
                        <UiInput
                            v-model="aiGame"
                            :placeholder="t('rules.gameNamePlaceholder')"
                        />
                        <UiInput
                            v-model="aiTitle"
                            :placeholder="t('rules.ruleTitlePlaceholder')"
                        />
                        <UiButton
                            class="w-full"
                            :disabled="!aiGame.trim() || !aiTitle.trim() || !aiResult.trim()"
                            @click="handleAiSave"
                        >
                            <Save class="h-4 w-4 mr-2" />
                            {{ t('rules.ai.saveRule') }}
                        </UiButton>
                    </UiCard>
                </template>
            </div>
        </div>
    </div>
</template>
