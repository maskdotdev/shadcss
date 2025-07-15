import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import styles from './button.module.css'

const buttonVariants = cva(
  styles.button,
  {
    variants: {
      variant: {
        default: styles.default,
        destructive: styles.destructive,
        outline: styles.outline,
        secondary: styles.secondary,
        ghost: styles.ghost,
        link: styles.link,
      },
      size: {
        default: styles.sizeDefault,
        sm: styles.sm,
        lg: styles.lg,
        icon: styles.icon,
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }