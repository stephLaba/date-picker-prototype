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

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-white group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
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
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "flex gap-4 flex-col md:flex-row relative",
          defaultClassNames.months
        ),
        month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--juno-neutral-40)] transition-colors hover:bg-[var(--juno-neutral-40)]/80 aria-disabled:opacity-50 p-0 select-none [&_svg]:text-[var(--juno-text-subtext)]",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--juno-primary)] transition-colors hover:bg-[var(--juno-primary)]/90 p-0 select-none [&_svg]:text-white aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute bg-popover inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-medium text-[var(--juno-text-header)]",
          captionLayout === "label"
            ? "text-base"
            : "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-[var(--juno-text-subtext)] rounded-md flex-1 font-normal text-[0.8rem] select-none",
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
          "relative w-full h-full p-0 text-center [&:last-child[data-selected=true]_button]:rounded-r-[14px] group/day aspect-square select-none",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-[14px]"
            : "[&:first-child[data-selected=true]_button]:rounded-l-[14px]",
          defaultClassNames.day
        ),
        range_start: cn(
          "rounded-l-[14px] bg-[var(--juno-neutral-20)]",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none bg-[var(--juno-neutral-20)]", defaultClassNames.range_middle),
        range_end: cn("rounded-r-[14px] bg-[var(--juno-neutral-20)]", defaultClassNames.range_end),
        today: cn(
          "bg-[var(--juno-neutral-20)] text-[var(--juno-text-header)] rounded-[14px] data-[selected=true]:rounded-[14px]",
          defaultClassNames.today
        ),
        outside: cn(
          "text-[var(--juno-text-subtext)] aria-selected:text-[var(--juno-text-subtext)]",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
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
        DayButton: CalendarDayButton,
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
      className={cn(
        "data-[selected-single=true]:bg-[var(--juno-primary)] data-[selected-single=true]:text-white data-[range-middle=true]:bg-[var(--juno-neutral-20)] data-[range-middle=true]:text-[var(--juno-text-header)] data-[range-start=true]:bg-[var(--juno-primary)] data-[range-start=true]:text-white data-[range-end=true]:bg-[var(--juno-primary)] data-[range-end=true]:text-white text-[var(--juno-text-header)] hover:bg-[var(--juno-neutral-20)] group-data-[focused=true]/day:border-[var(--juno-primary)] group-data-[focused=true]/day:ring-[var(--juno-primary)]/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-[14px] data-[range-end=true]:rounded-r-[14px] data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-[14px] data-[range-start=true]:rounded-l-[14px] rounded-[14px] [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
