<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '~/lib/utils'

const badgeVariants = cva(
   'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
   {
      variants: {
         variant: {
            default: 'bg-primary text-primary-foreground',
            secondary: 'bg-secondary text-secondary-foreground',
            destructive: 'bg-destructive text-destructive-foreground',
            outline: 'border border-border text-foreground',
            success: 'bg-green-500/20 text-green-400',
            warning: 'bg-yellow-500/20 text-yellow-400',
         },
      },
      defaultVariants: {
         variant: 'default',
      },
   }
)

type BadgeVariants = VariantProps<typeof badgeVariants>

interface Props {
   variant?: BadgeVariants['variant']
   class?: string
}

const props = withDefaults(defineProps<Props>(), {
   variant: 'default',
   class: '',
})
</script>

<template>
   <span :class="cn(badgeVariants({ variant: props.variant }), props.class)">
      <slot></slot>
   </span>
</template>
