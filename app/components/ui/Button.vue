<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '~/lib/utils'

const buttonVariants = cva(
   'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
   {
      variants: {
         variant: {
            default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25',
            destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
            outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            ghost: 'hover:bg-muted hover:text-foreground',
            link: 'text-primary underline-offset-4 hover:underline',
         },
         size: {
            default: 'h-11 px-5 py-2',
            sm: 'h-9 px-3 text-xs',
            lg: 'h-12 px-8 text-base',
            icon: 'h-10 w-10',
         },
      },
      defaultVariants: {
         variant: 'default',
         size: 'default',
      },
   }
)

type ButtonVariants = VariantProps<typeof buttonVariants>

interface Props {
   variant?: ButtonVariants['variant']
   size?: ButtonVariants['size']
   disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
   variant: 'default',
   size: 'default',
   disabled: false,
})
</script>

<template>
   <button :class="cn(buttonVariants({ variant: props.variant, size: props.size }))" :disabled="disabled">
      <slot></slot>
   </button>
</template>
