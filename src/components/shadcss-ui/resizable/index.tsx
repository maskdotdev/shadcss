"use client"

import * as React from "react"
import { GripVerticalIcon } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"
import { cn } from "@/lib/utils"
import styles from './resizable.module.css'

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn(
        styles.panelGroup,
        props.direction === "vertical" && styles.panelGroupVertical,
        className
      )}
      {...props}
    />
  )
}

function ResizablePanel({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return (
    <ResizablePrimitive.Panel 
      data-slot="resizable-panel" 
      className={cn(styles.panel, className)}
      {...props} 
    />
  )
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        styles.handle,
        props.direction === "vertical" && styles.handleVertical,
        withHandle && styles.handleWithGrip,
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className={cn(
          styles.gripIcon,
          props.direction === "vertical" && styles.gripIconVertical
        )}>
          <GripVerticalIcon className={styles.gripIconSvg} />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }