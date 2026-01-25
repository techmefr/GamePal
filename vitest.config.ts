import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
   test: {
      environment: 'nuxt',
      environmentOptions: {
         nuxt: {
            domEnvironment: 'happy-dom',
         },
      },
      include: ['tests/**/*.test.ts'],
      coverage: {
         provider: 'v8',
         reporter: ['text', 'html'],
         include: ['app/**/*.ts', 'app/**/*.vue'],
         exclude: ['app/types/**'],
      },
   },
})
