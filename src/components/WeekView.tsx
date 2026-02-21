"use client"

import * as React from "react"
import { addWeeks, format, startOfWeek, subWeeks } from "date-fns"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { AppointmentSlot } from "@/components/AppointmentSlot"
import { DatePickerTrigger } from "@/components/DatePickerTrigger"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { generateMockSlots } from "@/lib/mockSlots"
import { cn } from "@/lib/utils"

export function WeekView() {
  const [weekStart, setWeekStart] = React.useState(() => {
    const today = new Date()
    return startOfWeek(today, { weekStartsOn: 1 })
  })
  const [selectedSlot, setSelectedSlot] = React.useState<{
    date: string
    time: string
  } | null>(null)

  const daySlots = React.useMemo(() => generateMockSlots(weekStart), [weekStart])

  const handlePrevWeek = () => setWeekStart((d) => subWeeks(d, 1))
  const handleNextWeek = () => setWeekStart((d) => addWeeks(d, 1))
  const handleDatePickerSelect = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 })
    setWeekStart(start)
  }
  const handleSlotSelect = (date: Date, time: string) => {
    setSelectedSlot({
      date: format(date, "yyyy-MM-dd"),
      time,
    })
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 p-4">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevWeek}
              className="inline-flex size-9 items-center justify-center rounded-md border bg-background hover:bg-accent"
              aria-label="Previous week"
            >
              <ChevronLeftIcon className="size-4" />
            </button>
            <DatePickerTrigger
              weekStart={weekStart}
              onWeekChange={handleDatePickerSelect}
            />
            <button
              type="button"
              onClick={handleNextWeek}
              className="inline-flex size-9 items-center justify-center rounded-md border bg-background hover:bg-accent"
              aria-label="Next week"
            >
              <ChevronRightIcon className="size-4" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            {selectedSlot
              ? `Selected: ${format(new Date(selectedSlot.date), "EEEE, MMM d")} at ${selectedSlot.time}`
              : "Select an appointment slot"}
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div
              className={cn(
                "grid min-w-[600px] gap-4",
                "grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7"
              )}
            >
              {daySlots.map((day) => (
                <div
                  key={day.date}
                  className="flex flex-col rounded-lg border p-3"
                >
                  <h3 className="mb-2 text-center text-sm font-medium">
                    {format(day.dateObj, "EEE")}
                  </h3>
                  <p className="mb-3 text-center text-xs text-muted-foreground">
                    {format(day.dateObj, "MMM d")}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {day.slots.map((slot) => (
                      <AppointmentSlot
                        key={`${day.date}-${slot.time}`}
                        date={day.dateObj}
                        time={slot.time}
                        status={slot.status}
                        selected={
                          selectedSlot?.date === day.date &&
                          selectedSlot?.time === slot.time
                        }
                        onSelect={handleSlotSelect}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
