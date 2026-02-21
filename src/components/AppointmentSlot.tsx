"use client"

import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SlotStatus } from "@/lib/mockSlots"

interface AppointmentSlotProps {
  date: Date
  time: string
  status: SlotStatus
  selected: boolean
  onSelect: (date: Date, time: string) => void
}

export function AppointmentSlot({
  date,
  time,
  status,
  selected,
  onSelect,
}: AppointmentSlotProps) {
  const [hours, minutes] = time.split(":").map(Number)
  const slotDateTime = new Date(date)
  slotDateTime.setHours(hours, minutes, 0, 0)

  const isDisabled = status !== "available"
  const handleClick = () => {
    if (!isDisabled) onSelect(date, time)
  }

  return (
    <Button
      variant={selected ? "default" : "outline"}
      size="sm"
      disabled={isDisabled}
      onClick={handleClick}
      className={cn(
        "h-9 w-full text-xs transition-colors",
        status === "booked" && "cursor-not-allowed opacity-60 line-through",
        status === "unavailable" && "cursor-not-allowed opacity-50"
      )}
      aria-label={`${format(date, "EEEE, MMM d")} at ${time} - ${status}`}
    >
      {time}
    </Button>
  )
}
