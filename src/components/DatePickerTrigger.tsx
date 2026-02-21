"use client"

import * as React from "react"
import { format } from "date-fns"
import { CaretDown } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerTriggerProps {
  weekStart: Date
  onWeekChange: (date: Date) => void
  className?: string
}

export function DatePickerTrigger({
  weekStart,
  onWeekChange,
  className,
}: DatePickerTriggerProps) {
  const [open, setOpen] = React.useState(false)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onWeekChange(date)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!weekStart}
          className={cn(
            "data-[empty=true]:text-muted-foreground min-w-[200px] justify-between text-left font-normal sm:min-w-[240px]",
            className
          )}
        >
          {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}
          <CaretDown className="ml-2 size-4 opacity-50" weight="bold" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={weekStart}
          onSelect={handleSelect}
          defaultMonth={weekStart}
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  )
}
