<script setup lang="ts">
import { cn } from '~/lib/utils'

interface Props {
   class?: string
   modelValue?: string | number
   type?: string
   placeholder?: string
   disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
   class: '',
   type: 'text',
   placeholder: '',
   disabled: false,
})

const emit = defineEmits<{
   'update:modelValue': [value: string]
}>()

function handleInput(event: Event): void {
   const target = event.target as HTMLInputElement
   emit('update:modelValue', target.value)
}
</script>

<template>
   <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="cn(
         'flex h-11 w-full rounded-lg border border-input bg-secondary px-4 py-2 text-sm text-foreground transition-all duration-200',
         'placeholder:text-muted-foreground',
         'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
         'disabled:cursor-not-allowed disabled:opacity-50',
         props.class
      )"
      @input="handleInput"
   />
</template>
