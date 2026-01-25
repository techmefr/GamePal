import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
   rules: {
      'vue/require-default-prop': 'off',
      'vue/html-self-closing': [
         'error',
         {
            html: {
               void: 'always',
               normal: 'never',
            },
            svg: 'always',
         },
      ],
      '@typescript-eslint/no-unused-vars': [
         'error',
         {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
         },
      ],
      '@typescript-eslint/no-unsafe-optional-chaining': 'error',
   },
})
