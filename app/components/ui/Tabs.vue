<script setup lang="ts">
import { cn } from '~/lib/utils'

interface Tab {
   value: string
   label: string
}

interface Props {
   tabs: Tab[]
   modelValue: string
   testId?: string
}

defineProps<Props>()

const emit = defineEmits<{
   'update:modelValue': [value: string]
}>()

function selectTab(value: string): void {
   emit('update:modelValue', value)
}
</script>

<template>
   <div class="flex gap-1 rounded-lg bg-muted p-1">
      <button
         v-for="tab in tabs"
         :key="tab.value"
         :data-test-id="testId ? `${testId}-${tab.value}` : undefined"
         :data-test-class="testId ? `${testId}-btn` : undefined"
         :data-active="modelValue === tab.value ? 'true' : undefined"
         :class="cn(
            'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200',
            modelValue === tab.value
               ? 'bg-primary text-primary-foreground shadow-md'
               : 'text-muted-foreground hover:text-foreground'
         )"
         @click="selectTab(tab.value)"
      >
         {{ tab.label }}
      </button>
   </div>
</template>
