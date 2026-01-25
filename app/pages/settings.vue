<script setup lang="ts">
const { t, locale, locales } = useI18n()
const { theme, setTheme } = useTheme()

const isDyslexiaMode = ref(false)

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

function toggleDyslexiaMode(): void {
   isDyslexiaMode.value = !isDyslexiaMode.value
   if (import.meta.client) {
      localStorage.setItem('gamepal-dyslexia', isDyslexiaMode.value.toString())
      applyDyslexiaMode()
   }
}

function applyDyslexiaMode(): void {
   if (import.meta.client) {
      document.documentElement.classList.toggle('dyslexia-mode', isDyslexiaMode.value)
   }
}

onMounted(() => {
   if (import.meta.client) {
      isDyslexiaMode.value = localStorage.getItem('gamepal-dyslexia') === 'true'
      applyDyslexiaMode()
   }
})
</script>

<template>
   <div class="settings-page">
      <header class="settings-page__header">
         <NuxtLink to="/" class="settings-page__back">
            <span>←</span>
         </NuxtLink>
         <h1 class="heading">{{ t('settings.title') }}</h1>
      </header>

      <div class="settings-page__content">
         <section class="settings-section">
            <h2 class="settings-section__title">{{ t('settings.appearance') }}</h2>

            <div class="setting-item card-game">
               <div class="setting-item__info">
                  <span class="setting-item__label">{{ t('settings.theme') }}</span>
                  <span class="setting-item__description">{{ t('settings.themeDescription') }}</span>
               </div>
               <div class="theme-toggle">
                  <button
                     class="theme-toggle__btn"
                     :class="{ 'theme-toggle__btn--active': theme === 'dark' }"
                     @click="setTheme('dark')"
                  >
                     {{ t('settings.dark') }}
                  </button>
                  <button
                     class="theme-toggle__btn"
                     :class="{ 'theme-toggle__btn--active': theme === 'light' }"
                     @click="setTheme('light')"
                  >
                     {{ t('settings.light') }}
                  </button>
               </div>
            </div>

            <div class="setting-item card-game">
               <div class="setting-item__info">
                  <span class="setting-item__label">{{ t('settings.language') }}</span>
                  <span class="setting-item__description">{{ t('settings.languageDescription') }}</span>
               </div>
               <div class="locale-toggle">
                  <button
                     v-for="loc in availableLocales"
                     :key="loc.code"
                     class="locale-toggle__btn"
                     :class="{ 'locale-toggle__btn--active': locale === loc.code }"
                     @click="setLocale(loc.code)"
                  >
                     {{ loc.name }}
                  </button>
               </div>
            </div>

            <div class="setting-item card-game">
               <div class="setting-item__info">
                  <span class="setting-item__label">{{ t('settings.dyslexiaMode') }}</span>
                  <span class="setting-item__description">{{ t('settings.dyslexiaDescription') }}</span>
               </div>
               <button
                  class="toggle-switch"
                  :class="{ 'toggle-switch--active': isDyslexiaMode }"
                  @click="toggleDyslexiaMode"
               >
                  <span class="toggle-switch__thumb"></span>
               </button>
            </div>
         </section>

         <section class="settings-section">
            <h2 class="settings-section__title">{{ t('settings.data') }}</h2>

            <button class="setting-item setting-item--danger card-game" @click="handleClearData">
               <div class="setting-item__info">
                  <span class="setting-item__label">{{ t('settings.clearData') }}</span>
                  <span class="setting-item__description">{{ t('settings.clearDataDescription') }}</span>
               </div>
            </button>
         </section>

         <footer class="settings-page__footer">
            <p>{{ t('settings.version') }}</p>
         </footer>
      </div>
   </div>
</template>

<style scoped>
.settings-page {
   min-height: 100dvh;
   display: flex;
   flex-direction: column;
}

.settings-page__header {
   display: flex;
   align-items: center;
   gap: var(--gap-md);
   padding: var(--gap-md);
   background: var(--bg-secondary);
}

.settings-page__back {
   font-size: var(--text-lg);
   color: var(--text-primary);
   padding: var(--gap-xs);
}

.settings-page__header .heading {
   flex: 1;
   font-size: var(--text-lg);
}

.settings-page__content {
   flex: 1;
   padding: var(--gap-md);
   display: flex;
   flex-direction: column;
   gap: var(--gap-lg);
}

.settings-section__title {
   font-size: var(--text-sm);
   color: var(--text-secondary);
   text-transform: uppercase;
   letter-spacing: 0.05em;
   margin-bottom: var(--gap-sm);
}

.setting-item {
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: var(--gap-md);
   margin-bottom: var(--gap-sm);
}

.setting-item--danger {
   cursor: pointer;
}

.setting-item--danger:hover {
   border-color: var(--error);
}

.setting-item--danger .setting-item__label {
   color: var(--error);
}

.setting-item__info {
   display: flex;
   flex-direction: column;
   gap: 2px;
}

.setting-item__label {
   font-size: var(--text-base);
   color: var(--text-primary);
}

.setting-item__description {
   font-size: var(--text-sm);
   color: var(--text-secondary);
}

.theme-toggle,
.locale-toggle {
   display: flex;
   gap: var(--gap-xs);
}

.theme-toggle__btn,
.locale-toggle__btn {
   padding: var(--gap-xs) var(--gap-md);
   border-radius: var(--radius-sm);
   font-size: var(--text-sm);
   color: var(--text-secondary);
   transition: all var(--transition-fast);
}

.theme-toggle__btn--active,
.locale-toggle__btn--active {
   background: var(--accent-primary);
   color: #ffffff;
}

.toggle-switch {
   width: 50px;
   height: 28px;
   border-radius: var(--radius-lg);
   background: var(--surface-hover);
   position: relative;
   transition: background var(--transition-fast);
}

.toggle-switch--active {
   background: var(--accent-primary);
}

.toggle-switch__thumb {
   position: absolute;
   top: 3px;
   left: 3px;
   width: 22px;
   height: 22px;
   border-radius: 50%;
   background: #ffffff;
   transition: transform var(--transition-fast);
}

.toggle-switch--active .toggle-switch__thumb {
   transform: translateX(22px);
}

.settings-page__footer {
   margin-top: auto;
   text-align: center;
   padding: var(--gap-lg);
   color: var(--text-secondary);
   font-size: var(--text-sm);
}
</style>
