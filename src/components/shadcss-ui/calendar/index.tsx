"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/shadcss-ui/button"
import styles from './calendar.module.css'

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(styles.calendar, className)}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn(styles.root, defaultClassNames.root),
        months: cn(styles.months, defaultClassNames.months),
        month: cn(styles.month, defaultClassNames.month),
        nav: cn(styles.nav, defaultClassNames.nav),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          styles.buttonPrevious,
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          styles.buttonNext,
          defaultClassNames.button_next
        ),
        month_caption: cn(styles.monthCaption, defaultClassNames.month_caption),
        dropdowns: cn(styles.dropdowns, defaultClassNames.dropdowns),
        dropdown_root: cn(styles.dropdownRoot, defaultClassNames.dropdown_root),
        dropdown: cn(styles.dropdown, defaultClassNames.dropdown),
        caption_label: cn(
          styles.captionLabel,
          captionLayout === "label" ? styles.captionLabelText : styles.captionLabelButton,
          defaultClassNames.caption_label
        ),
        table: styles.table,
        weekdays: cn(styles.weekdays, defaultClassNames.weekdays),
        weekday: cn(styles.weekday, defaultClassNames.weekday),
        week: cn(styles.week, defaultClassNames.week),
        week_number_header: cn(styles.weekNumberHeader, defaultClassNames.week_number_header),
        week_number: cn(styles.weekNumber, defaultClassNames.week_number),
        day: cn(styles.day, defaultClassNames.day),
        range_start: cn(styles.rangeStart, defaultClassNames.range_start),
        range_middle: cn(styles.rangeMiddle, defaultClassNames.range_middle),
        range_end: cn(styles.rangeEnd, defaultClassNames.range_end),
        today: cn(styles.today, defaultClassNames.today),
        outside: cn(styles.outside, defaultClassNames.outside),
        disabled: cn(styles.disabled, defaultClassNames.disabled),
        hidden: cn(styles.hidden, defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn(styles.chevron, className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn(styles.chevron, className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn(styles.chevron, className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className={styles.weekNumberCell}>
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(styles.dayButton, defaultClassNames.day, className)}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }