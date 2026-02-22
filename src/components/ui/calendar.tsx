"use client"

import * as React from "react"
import { CaretDown, CaretLeft, CaretRight } from "@phosphor-icons/react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  /** When provided, dates for which this returns true show an event indicator dot. */
  dayHasEvent?: (date: Date) => boolean
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  formatters,
  components,
  dayHasEvent,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "rounded-[14px] bg-[var(--juno-neutral-20)] group/calendar w-full p-4 [--cell-size:calc((100%-2rem)/7)] [[data-slot=card-content]_&]:[--cell-size:--spacing(8)] [[data-slot=card-content]_&]:w-fit [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-full [[data-slot=card-content]_&]:w-fit", defaultClassNames.root),
        months: cn(
          "flex gap-4 flex-col md:flex-row relative",
          defaultClassNames.months
        ),
        month: cn("flex flex-col w-full gap-6", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-6 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--juno-primary)] transition-colors hover:bg-[var(--juno-primary)]/90 p-0 select-none [&_svg]:text-white aria-disabled:bg-[var(--juno-surface-disabled)] aria-disabled:hover:bg-[var(--juno-surface-disabled)]/80 aria-disabled:opacity-50 aria-disabled:[&_svg]:text-[var(--juno-primary-subdued)]",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--juno-primary)] transition-colors hover:bg-[var(--juno-primary)]/90 p-0 select-none [&_svg]:text-white aria-disabled:bg-[var(--juno-surface-disabled)] aria-disabled:hover:bg-[var(--juno-surface-disabled)]/80 aria-disabled:opacity-50 aria-disabled:[&_svg]:text-[var(--juno-primary-subdued)]",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-(--cell-size) w-full",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative has-focus:border-ring border border-[var(--juno-border)] shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute bg-popover inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-medium text-[var(--juno-primary)]",
          captionLayout === "label"
            ? "text-base"
            : "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse table-fixed",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-[var(--juno-primary-subdued)] rounded-md flex-1 font-medium text-[14px] select-none",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-2", defaultClassNames.week),
        week_number_header: cn(
          "select-none w-(--cell-size)",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[0.8rem] select-none text-muted-foreground",
          defaultClassNames.week_number
        ),
        day: cn(
          "relative w-full h-full p-0 text-center group/day aspect-square select-none",
          defaultClassNames.day
        ),
        range_start: cn(
          "rounded-l-[14px] bg-[var(--juno-neutral-20)]",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none bg-[var(--juno-neutral-20)]", defaultClassNames.range_middle),
        range_end: cn("rounded-r-[14px] bg-[var(--juno-neutral-20)]", defaultClassNames.range_end),
        today: cn(
          "bg-[var(--juno-neutral-20)] text-[var(--juno-text-header)] rounded-full data-[selected=true]:rounded-full",
          defaultClassNames.today
        ),
        outside: cn(
          "text-[var(--juno-text-disabled)] aria-selected:text-[var(--juno-text-disabled)]",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-[var(--juno-text-disabled)] line-through",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
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
              <CaretLeft className={cn("size-3.5", className)} weight="bold" {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <CaretRight
                className={cn("size-3.5", className)}
                weight="bold"
                {...props}
              />
            )
          }

          return (
            <CaretDown className={cn("size-4", className)} weight="bold" {...props} />
          )
        },
        DayButton: (dayProps) => (
          <CalendarDayButton
            {...dayProps}
            hasEvent={dayHasEvent?.(dayProps.day.date)}
          />
        ),
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
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
  hasEvent,
  children,
  ...props
}: React.ComponentProps<typeof DayButton> & { hasEvent?: boolean }) {
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
      className={cn(
        "data-[selected-single=true]:bg-[var(--juno-primary)] data-[selected-single=true]:text-white data-[selected-single=true]:font-medium data-[selected-single=true]:rounded-full data-[range-middle=true]:bg-[var(--juno-neutral-20)] data-[range-middle=true]:text-[var(--juno-text-header)] data-[range-start=true]:bg-[var(--juno-primary)] data-[range-start=true]:text-white data-[range-end=true]:bg-[var(--juno-primary)] data-[range-end=true]:text-white text-[14px] text-[var(--juno-text-header)] hover:bg-[var(--juno-neutral-20)] hover:rounded-full rounded-full group-data-[focused=true]/day:border-[var(--juno-primary)] group-data-[focused=true]/day:ring-[var(--juno-primary)]/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-0.5 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-[14px] data-[range-end=true]:rounded-r-[14px] data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-[14px] data-[range-start=true]:rounded-l-[14px] data-[selected-single=true]:[&_.calendar-event-dot]:bg-white data-[selected-single=true]:[&_.calendar-event-dot]:opacity-100 [&_.calendar-event-dot]:bg-[var(--juno-primary)] [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    >
      <span className="relative inline-block">
        {children}
        {hasEvent && (
          <span
            className="calendar-event-dot absolute left-1/2 top-full mt-0.5 size-1 -translate-x-1/2 rounded-full opacity-70"
            aria-hidden
          />
        )}
      </span>
    </Button>
  )
}

export { Calendar, CalendarDayButton }
