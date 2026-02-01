<script setup lang="ts">
import { cn } from '~/lib/utils'

interface Props {
   modelValue?: boolean
   disabled?: boolean
}

withDefaults(defineProps<Props>(), {
   modelValue: false,
   disabled: false,
})

const emit = defineEmits<{
   'update:modelValue': [value: boolean]
}>()

function toggle(currentValue: boolean): void {
   emit('update:modelValue', !currentValue)
}
</script>

<template>
   <button
      type="button"
      role="checkbox"
      :aria-checked="modelValue"
      :disabled="disabled"
      :class="cn(
         'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200',
         'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
         'disabled:cursor-not-allowed disabled:opacity-50',
         modelValue ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground bg-transparent'
      )"
      @click="toggle(modelValue)"
   >
      <svg
         v-if="modelValue"
         class="h-4 w-4"
         fill="none"
         viewBox="0 0 24 24"
         stroke="currentColor"
         stroke-width="3"
      >
         <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
   </button>
</template>
