type Theme = 'dark' | 'light'

const STORAGE_KEY = 'gamepal-theme'

export function useTheme() {
   const theme = ref<Theme>('dark')

   function load(): void {
      if (import.meta.client) {
         const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
         if (stored === 'light' || stored === 'dark') {
            theme.value = stored
         }
         applyTheme()
      }
   }

   function setTheme(newTheme: Theme): void {
      theme.value = newTheme
      if (import.meta.client) {
         localStorage.setItem(STORAGE_KEY, newTheme)
         applyTheme()
      }
   }

   function toggleTheme(): void {
      setTheme(theme.value === 'dark' ? 'light' : 'dark')
   }

   function applyTheme(): void {
      if (import.meta.client) {
         if (theme.value === 'light') {
            document.documentElement.classList.add('light')
         } else {
            document.documentElement.classList.remove('light')
         }
      }
   }

   onMounted(load)

   return {
      theme,
      setTheme,
      toggleTheme,
   }
}
