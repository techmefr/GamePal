<script setup lang="ts">
import { cn } from '~/lib/utils'

interface Props {
   class?: string
   hoverable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
   class: '',
   hoverable: false,
})
</script>

<template>
   <div
      :class="cn(
         'rounded-xl border border-border bg-card text-card-foreground shadow-lg transition-all duration-200',
         hoverable && 'hover:bg-card/80 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer active:scale-[0.98]',
         props.class
      )"
   >
      <slot></slot>
   </div>
</template>
