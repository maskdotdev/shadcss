"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import styles from './table.module.css'

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className={styles.tableContainer}
    >
      <table
        data-slot="table"
        className={cn(styles.table, className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn(styles.tableHeader, className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn(styles.tableBody, className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(styles.tableFooter, className)}
      {...props}
    />
  )
}

interface TableRowProps extends React.ComponentProps<"tr"> {
  striped?: boolean;
}

function TableRow({ className, striped = false, ...props }: TableRowProps) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        styles.tableRow,
        striped && styles.tableRowStriped,
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(styles.tableHead, className)}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(styles.tableCell, className)}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn(styles.tableCaption, className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}