"use client"

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"
import { cn } from "@/lib/utils"
import styles from './aspect-ratio.module.css'

function AspectRatio({
  className,
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return (
    <AspectRatioPrimitive.Root 
      data-slot="aspect-ratio" 
      className={cn(styles.aspectRatio, className)}
      {...props} 
    />
  )
}

export { AspectRatio }