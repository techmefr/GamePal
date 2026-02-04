import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
   compatibilityDate: '2025-07-15',

   devtools: { enabled: true },

   ssr: false,

   modules: ['@nuxt/eslint', '@nuxtjs/i18n', '@vueuse/motion/nuxt'],

   i18n: {
      locales: [
         { code: 'en', file: 'en.json', name: 'English' },
         { code: 'fr', file: 'fr.json', name: 'Francais' },
      ],
      defaultLocale: 'en',
      lazy: true,
      langDir: 'locales',
      strategy: 'no_prefix',
      detectBrowserLanguage: {
         useCookie: true,
         cookieKey: 'gamepal-locale',
         fallbackLocale: 'en',
      },
   },

   css: [
      '@fontsource/lexend/400.css',
      '@fontsource/lexend/500.css',
      '@fontsource/lexend/600.css',
      '@fontsource/lexend/700.css',
      '@fontsource/space-grotesk/400.css',
      '@fontsource/space-grotesk/500.css',
      '@fontsource/space-grotesk/600.css',
      '@fontsource/space-grotesk/700.css',
      '~/assets/css/main.css',
   ],

   nitro: {
      preset: 'github-pages',
      output: {
         publicDir: 'docs',
      },
   },

   app: {
      baseURL: '/GamePal/',
      head: {
         title: 'Gamepal',
         meta: [
            { name: 'description', content: 'Board game companion app' },
            {
               name: 'viewport',
               content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
            },
            { name: 'theme-color', content: '#0f1115' },
         ],
      },
   },

   vite: {
      plugins: [tailwindcss()],
      css: {
         preprocessorOptions: {
            scss: {
               api: 'modern-compiler',
            },
         },
      },
   },
})
