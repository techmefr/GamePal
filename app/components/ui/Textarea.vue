<script setup lang="ts">
import { cn } from '~/lib/utils'

interface Props {
    class?: string
    modelValue?: string
    placeholder?: string
    disabled?: boolean
    rows?: number
}

const props = withDefaults(defineProps<Props>(), {
    class: '',
    placeholder: '',
    disabled: false,
    rows: 4,
})

const emit = defineEmits<{
    'update:modelValue': [value: string]
}>()

function handleInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement
    emit('update:modelValue', target.value)
}
</script>

<template>
    <textarea
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :rows="rows"
        :class="cn(
            'flex w-full rounded-lg border border-input bg-secondary px-4 py-3 text-sm text-foreground transition-all duration-200',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'resize-y',
            props.class
        )"
        @input="handleInput"
    ></textarea>
</template>
