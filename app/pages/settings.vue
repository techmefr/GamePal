<script setup lang="ts">
import { ArrowLeft, Moon, Sun, Languages, Eye, Trash2, Type, Brain, Key, Zap } from 'lucide-vue-next'
import type { AIProvider } from '~/types'

const { t, locale, locales } = useI18n()
const { theme, setTheme } = useTheme()
const { fontSize, isDyslexiaMode, setFontSize, setDyslexiaMode } = useSettings()
const { config: aiConfig, setProvider, setApiKey, testConnection, isConfigured: isAIConfigured } = useAI()

type FontSize = 'small' | 'medium' | 'large'

const aiKeyInput = ref('')
const isTestingConnection = ref(false)
const aiTestResult = ref<'success' | 'error' | null>(null)
const isAiKeySaved = ref(false)

function handleProviderChange(provider: string): void {
    setProvider(provider as AIProvider)
    aiKeyInput.value = ''
    aiTestResult.value = null
    isAiKeySaved.value = false
}

function handleSaveApiKey(): void {
    if (!aiKeyInput.value.trim()) return
    setApiKey(aiConfig.value.provider, aiKeyInput.value.trim())
    aiKeyInput.value = ''
    isAiKeySaved.value = true
    aiTestResult.value = null
    setTimeout(() => {
        isAiKeySaved.value = false
    }, 2000)
}

async function handleTestConnection(): Promise<void> {
    isTestingConnection.value = true
    aiTestResult.value = null
    try {
        const isSuccess = await testConnection()
        aiTestResult.value = isSuccess ? 'success' : 'error'
    } catch {
        aiTestResult.value = 'error'
    } finally {
        isTestingConnection.value = false
    }
}

const availableLocales = computed(() => {
   return (locales.value as Array<{ code: string; name: string }>).map(l => ({
      code: l.code,
      name: l.name,
   }))
})

function setLocale(code: string): void {
   locale.value = code
}

function handleClearData(): void {
   if (confirm(t('settings.clearDataConfirm'))) {
      if (import.meta.client) {
         localStorage.clear()
         window.location.reload()
      }
   }
}

function handleFontSizeChange(size: FontSize): void {
   setFontSize(size)
}

function toggleDyslexiaMode(): void {
   setDyslexiaMode(!isDyslexiaMode.value)
}
</script>

<template>
   <div class="min-h-dvh bg-background">
      <header class="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border">
         <div class="flex items-center gap-4 px-4 py-4">
            <NuxtLink
               to="/"
               data-test-id="back-btn"
               class="settings-page__back flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
               v-motion
               :initial="{ opacity: 0, x: -10 }"
               :enter="{ opacity: 1, x: 0 }"
            >
               <ArrowLeft class="h-5 w-5" />
            </NuxtLink>
            <h1
               class="heading font-display text-lg font-bold tracking-tight"
               v-motion
               :initial="{ opacity: 0, y: -10 }"
               :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
            >
               {{ t('settings.title') }}
            </h1>
         </div>
      </header>

      <div class="p-4 space-y-6">
         <section
            data-test-id="appearance-section"
            class="settings-section"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 150 } }"
         >
            <h2 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
               {{ t('settings.appearance') }}
            </h2>

            <UiCard class="p-4 mb-3">
               <div class="flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3">
                     <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Moon v-if="theme === 'dark'" class="h-5 w-5" />
                        <Sun v-else class="h-5 w-5" />
                     </div>
                     <div>
                        <p class="font-medium">{{ t('settings.theme') }}</p>
                        <p class="text-sm text-muted-foreground">{{ t('settings.themeDescription') }}</p>
                     </div>
                  </div>
                  <UiTabs
                     :tabs="[
                        { value: 'dark', label: t('settings.dark') },
                        { value: 'light', label: t('settings.light') },
                     ]"
                     :model-value="theme"
                     test-id="theme"
                     class="theme-toggle"
                     @update:model-value="setTheme($event as 'dark' | 'light')"
                  />
               </div>
            </UiCard>

            <UiCard class="p-4 mb-3">
               <div class="flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3">
                     <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                        <Type class="h-5 w-5" />
                     </div>
                     <div>
                        <p class="font-medium">{{ t('settings.fontSize') }}</p>
                        <p class="text-sm text-muted-foreground">{{ t('settings.fontSizeDescription') }}</p>
                     </div>
                  </div>
                  <UiTabs
                     :tabs="[
                        { value: 'small', label: t('settings.fontSizeSmall') },
                        { value: 'medium', label: t('settings.fontSizeMedium') },
                        { value: 'large', label: t('settings.fontSizeLarge') },
                     ]"
                     :model-value="fontSize"
                     test-id="font-size"
                     @update:model-value="handleFontSizeChange($event as FontSize)"
                  />
               </div>
            </UiCard>

            <UiCard class="p-4 mb-3">
               <div class="flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3">
                     <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <Languages class="h-5 w-5" />
                     </div>
                     <div>
                        <p class="font-medium">{{ t('settings.language') }}</p>
                        <p class="text-sm text-muted-foreground">{{ t('settings.languageDescription') }}</p>
                     </div>
                  </div>
                  <div data-test-id="locale-toggle" class="locale-toggle flex gap-1 rounded-lg bg-muted p-1">
                     <button
                        v-for="loc in availableLocales"
                        :key="loc.code"
                        :data-test-id="`locale-${loc.code}`"
                        data-test-class="locale-btn"
                        :data-active="locale === loc.code ? 'true' : undefined"
                        class="locale-toggle__btn px-3 py-1.5 rounded-md text-sm font-medium transition-all"
                        :class="locale === loc.code ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'"
                        @click="setLocale(loc.code)"
                     >
                        {{ loc.name }}
                     </button>
                  </div>
               </div>
            </UiCard>

            <UiCard class="p-4">
               <div class="flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3">
                     <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                        <Eye class="h-5 w-5" />
                     </div>
                     <div>
                        <p class="font-medium">{{ t('settings.dyslexiaMode') }}</p>
                        <p class="text-sm text-muted-foreground">{{ t('settings.dyslexiaDescription') }}</p>
                     </div>
                  </div>
                  <UiSwitch
                     :model-value="isDyslexiaMode"
                     data-test-id="dyslexia-toggle"
                     class="toggle-switch"
                     @update:model-value="toggleDyslexiaMode"
                  />
               </div>
            </UiCard>
         </section>

         <section
            data-test-id="ai-section"
            class="settings-section"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
         >
            <h2 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
               {{ t('settings.ai') }}
            </h2>

            <UiCard class="p-4 mb-3">
               <div class="flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3">
                     <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
                        <Brain class="h-5 w-5" />
                     </div>
                     <div>
                        <p class="font-medium">{{ t('settings.aiProvider') }}</p>
                        <p class="text-sm text-muted-foreground">{{ t('settings.aiDescription') }}</p>
                     </div>
                  </div>
                  <UiTabs
                     :tabs="[
                        { value: 'openai', label: 'OpenAI' },
                        { value: 'anthropic', label: 'Anthropic' },
                     ]"
                     :model-value="aiConfig.provider"
                     test-id="ai-provider"
                     @update:model-value="handleProviderChange"
                  />
               </div>
            </UiCard>

            <UiCard class="p-4 mb-3">
               <div class="flex items-center gap-3 mb-3">
                  <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                     <Key class="h-5 w-5" />
                  </div>
                  <div>
                     <p class="font-medium">{{ t('settings.aiApiKey') }}</p>
                  </div>
               </div>
               <div class="flex gap-2">
                  <UiInput
                     v-model="aiKeyInput"
                     type="password"
                     :placeholder="t('settings.aiApiKeyPlaceholder')"
                     class="flex-1"
                  />
                  <UiButton
                     :disabled="!aiKeyInput.trim()"
                     @click="handleSaveApiKey"
                  >
                     {{ t('settings.aiSaveKey') }}
                  </UiButton>
               </div>
               <p v-if="isAiKeySaved" class="text-sm text-green-500 mt-2">
                  {{ t('settings.aiKeySaved') }}
               </p>
            </UiCard>

            <UiCard class="p-4">
               <div class="flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3">
                     <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500">
                        <Zap class="h-5 w-5" />
                     </div>
                     <div>
                        <p class="font-medium">{{ t('settings.aiTestConnection') }}</p>
                     </div>
                  </div>
                  <div class="flex items-center gap-2">
                     <UiBadge
                        v-if="aiTestResult === 'success'"
                        variant="success"
                     >
                        {{ t('settings.aiTestSuccess') }}
                     </UiBadge>
                     <UiBadge
                        v-if="aiTestResult === 'error'"
                        variant="destructive"
                     >
                        {{ t('settings.aiTestError') }}
                     </UiBadge>
                     <UiButton
                        variant="outline"
                        :disabled="!isAIConfigured || isTestingConnection"
                        @click="handleTestConnection"
                     >
                        {{ isTestingConnection ? t('common.loading') : t('settings.aiTestConnection') }}
                     </UiButton>
                  </div>
               </div>
            </UiCard>
         </section>

         <section
            data-test-id="data-section"
            class="settings-section"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
         >
            <h2 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
               {{ t('settings.data') }}
            </h2>

            <UiCard
               hoverable
               data-test-id="clear-data-btn"
               class="setting-item--danger p-4 cursor-pointer border-destructive/20 hover:border-destructive/50 transition-colors"
               @click="handleClearData"
            >
               <div class="flex items-center gap-3">
                  <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                     <Trash2 class="h-5 w-5" />
                  </div>
                  <div>
                     <p class="font-medium text-destructive">{{ t('settings.clearData') }}</p>
                     <p class="text-sm text-muted-foreground">{{ t('settings.clearDataDescription') }}</p>
                  </div>
               </div>
            </UiCard>
         </section>

         <footer
            data-test-id="footer"
            class="settings-page__footer text-center py-8 text-sm text-muted-foreground"
            v-motion
            :initial="{ opacity: 0 }"
            :enter="{ opacity: 1, transition: { delay: 400 } }"
         >
            <p>{{ t('settings.version') }}</p>
         </footer>
      </div>
   </div>
</template>
