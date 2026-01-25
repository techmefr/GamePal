export function useLocalStorage<T>(key: string, defaultValue: T) {
   const data = ref<T>(defaultValue)
   const isLoaded = ref(false)

   function load(): void {
      if (import.meta.client) {
         try {
            const stored = localStorage.getItem(key)
            if (stored) {
               data.value = JSON.parse(stored)
            }
         } catch (_e) {
            data.value = defaultValue
         }
         isLoaded.value = true
      }
   }

   function save(): void {
      if (import.meta.client) {
         try {
            localStorage.setItem(key, JSON.stringify(data.value))
         } catch (_e) {
            console.warn('Failed to save to localStorage')
         }
      }
   }

   function clear(): void {
      if (import.meta.client) {
         localStorage.removeItem(key)
         data.value = defaultValue
      }
   }

   watch(data, save, { deep: true })

   onMounted(load)

   return {
      data,
      isLoaded,
      save,
      clear,
   }
}
