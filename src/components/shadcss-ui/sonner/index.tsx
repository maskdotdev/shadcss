"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps, toast } from "sonner"
import { cn } from "@/lib/utils"
import styles from './sonner.module.css'

const Toaster = ({ className, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className={cn(styles.toaster, className)}
      toastOptions={{
        classNames: {
          toast: styles.toast,
          title: styles.title,
          description: styles.description,
          actionButton: styles.actionButton,
          cancelButton: styles.cancelButton,
          closeButton: styles.closeButton,
          error: styles.error,
          success: styles.success,
          warning: styles.warning,
          info: styles.info,
          loading: styles.loading,
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }