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
      role="switch"
      :aria-checked="modelValue"
      :disabled="disabled"
      :class="cn(
         'relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300',
         'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
         'disabled:cursor-not-allowed disabled:opacity-50',
         modelValue ? 'bg-primary' : 'bg-muted'
      )"
      @click="toggle(modelValue)"
   >
      <span
         :class="cn(
            'pointer-events-none block h-6 w-6 rounded-full bg-white shadow-lg ring-0 transition-transform duration-300',
            modelValue ? 'translate-x-5' : 'translate-x-0'
         )"
      ></span>
   </button>
</template>
