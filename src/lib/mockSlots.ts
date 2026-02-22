import {
  addDays,
  format,
  setHours,
  setMinutes,
  startOfDay,
  startOfWeek,
} from "date-fns"

import { formatTime24to12 } from "./formatTime"

export type SlotStatus = "available" | "booked" | "unavailable"

export interface TimeSlot {
  time: string
  status: SlotStatus
}

export interface DaySlots {
  date: string
  dateObj: Date
  slots: TimeSlot[]
}

const VET_HOURS = { start: 9, end: 17 }
const SLOT_INTERVAL_MINUTES = 30

function generateTimes(): string[] {
  const times: string[] = []
  for (let h = VET_HOURS.start; h < VET_HOURS.end; h++) {
    for (let m = 0; m < 60; m += SLOT_INTERVAL_MINUTES) {
      times.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`)
    }
  }
  return times
}

const SLOT_TIMES = generateTimes()

/** Dates with no availability (e.g. holidays, closed days). */
function isNoAvailabilityDate(date: Date): boolean {
  const d = new Date(date)
  return d.getMonth() === 1 && d.getDate() === 18 // Feb 18
}

function getSlotStatus(date: Date, time: string): SlotStatus {
  if (isNoAvailabilityDate(date)) return "unavailable"

  const [hours, minutes] = time.split(":").map(Number)
  const slotDate = setMinutes(setHours(new Date(date), hours), minutes)

  if (slotDate < new Date()) return "unavailable"

  const random = (date.getTime() + time.charCodeAt(0)) % 100
  if (random < 25) return "booked"
  if (random < 90) return "available"
  return "unavailable"
}

/** Returns true if the date has at least one available time slot. */
export function hasAvailableSlots(date: Date): boolean {
  return generateTimeSlotsForDay(date).some((s) => s.status === "available")
}

/** Finds the first date (from startFrom, or today) that has at least one available slot. */
export function getFirstAvailableDate(startFrom?: Date): Date {
  const start = startFrom ? startOfDay(new Date(startFrom)) : startOfDay(new Date())
  for (let i = 0; i < 60; i++) {
    const candidate = addDays(start, i)
    if (hasAvailableSlots(candidate)) return candidate
  }
  return addDays(start, 1)
}

/** Finds the first date after the given date that has at least one available slot. */
export function getNextAvailableDate(afterDate: Date): Date | null {
  const start = addDays(startOfDay(new Date(afterDate)), 1)
  for (let i = 0; i < 60; i++) {
    const candidate = addDays(start, i)
    if (hasAvailableSlots(candidate)) return candidate
  }
  return null
}

/** Generate time slots for a single day in 12h format (e.g. "9:30 am") */
export function generateTimeSlotsForDay(date: Date): { time: string; time24: string; status: SlotStatus }[] {
  return SLOT_TIMES.map((time24) => ({
    time: formatTime24to12(time24),
    time24,
    status: getSlotStatus(date, time24),
  }))
}

export function generateMockSlots(weekStart: Date): DaySlots[] {
  const start = startOfWeek(weekStart, { weekStartsOn: 1 })
  const days: DaySlots[] = []

  for (let i = 0; i < 7; i++) {
    const date = addDays(start, i)
    const slots: TimeSlot[] = SLOT_TIMES.map((time) => ({
      time,
      status: getSlotStatus(date, time),
    }))
    days.push({
      date: format(date, "yyyy-MM-dd"),
      dateObj: date,
      slots,
    })
  }

  return days
}
