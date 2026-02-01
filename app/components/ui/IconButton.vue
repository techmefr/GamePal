<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '~/lib/utils'

const iconButtonVariants = cva(
   'inline-flex items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-90',
   {
      variants: {
         variant: {
            default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25',
            ghost: 'text-muted-foreground hover:text-foreground hover:bg-muted',
            destructive: 'text-muted-foreground hover:text-destructive hover:bg-destructive/10',
            outline: 'border border-border text-foreground hover:bg-muted',
         },
         size: {
            default: 'h-10 w-10',
            sm: 'h-8 w-8',
            lg: 'h-12 w-12',
         },
      },
      defaultVariants: {
         variant: 'ghost',
         size: 'default',
      },
   }
)

type IconButtonVariants = VariantProps<typeof iconButtonVariants>

interface Props {
   variant?: IconButtonVariants['variant']
   size?: IconButtonVariants['size']
   disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
   variant: 'ghost',
   size: 'default',
   disabled: false,
})
</script>

<template>
   <button
      :class="cn(iconButtonVariants({ variant: props.variant, size: props.size }))"
      :disabled="disabled"
   >
      <slot></slot>
   </button>
</template>
