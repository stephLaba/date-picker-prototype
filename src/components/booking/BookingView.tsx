import * as React from "react"
import { addWeeks, format, startOfWeek, subWeeks } from "date-fns"
import { ArrowLeft, CaretLeft, CaretRight } from "@phosphor-icons/react"

import { DateTile } from "@/components/booking/DateTile"
import { LocationDropdown } from "@/components/booking/LocationDropdown"
import { TimeChip } from "@/components/booking/TimeChip"
import {
  generateTimeSlotsForDay,
  getFirstAvailableDate,
  getNextAvailableDate,
  hasAvailableSlots,
} from "@/lib/mockSlots"
import { cn } from "@/lib/utils"

const STEPS = [
  "Select location",
  "Select reason",
  "Book appointment",
  "Pet details",
  "Create account",
  "Payment info",
]
const CURRENT_STEP_INDEX = 2

export function BookingView() {
  const firstAvailable = React.useMemo(() => getFirstAvailableDate(), [])
  const [weekStart, setWeekStart] = React.useState(() =>
    startOfWeek(firstAvailable, { weekStartsOn: 0 }),
  )
  const [selectedDate, setSelectedDate] = React.useState<Date>(() => firstAvailable)
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null)

  const weekDates = React.useMemo(() => {
    const dates: Date[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + i)
      dates.push(d)
    }
    return dates
  }, [weekStart])

  const timeSlots = React.useMemo(
    () => generateTimeSlotsForDay(selectedDate),
    [selectedDate]
  )

  const handlePrevWeek = () => setWeekStart((d) => subWeeks(d, 1))
  const handleNextWeek = () => setWeekStart((d) => addWeeks(d, 1))

  const handleJumpToNextAvailable = () => {
    const next = getNextAvailableDate(selectedDate)
    if (next) {
      setWeekStart(startOfWeek(next, { weekStartsOn: 0 }))
      setSelectedDate(next)
      setSelectedTime(null)
    }
  }

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  return (
    <div className="flex h-full min-h-screen flex-col bg-white">
      {/* Nav */}
      <nav className="relative z-10 shrink-0">
        <div className="flex h-[116px] items-center px-10">
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-full hover:bg-[var(--juno-neutral-20)]"
            aria-label="Go back"
          >
            <ArrowLeft className="size-6 text-[var(--juno-primary)]" weight="bold" />
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 text-xl font-bold tracking-wide text-[var(--juno-primary)]">
            JUNO VETERINARY
          </div>
        </div>
        {/* Progress bar */}
        <div className="relative">
          <div className="flex justify-between border-b border-[var(--juno-neutral-40)] px-10 pb-4 pt-1">
            {STEPS.map((label, i) => (
              <span
                key={label}
                className={cn(
                  "text-sm italic",
                  i <= CURRENT_STEP_INDEX
                    ? "text-[var(--juno-text-header)]"
                    : "text-[var(--juno-text-subtext)]"
                )}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="h-1.5 bg-[var(--juno-surface-tertiary)]" />
          <div
            className="absolute left-0 top-0 h-1.5 bg-[var(--juno-accent)]"
            style={{
              width: `${((CURRENT_STEP_INDEX + 1) / STEPS.length) * 100}%`,
            }}
          />
        </div>
      </nav>

      {/* Two-column layout */}
      <div className="relative flex flex-1 overflow-auto">
        {/* Left: Booking form */}
        <div className="relative z-10 flex w-[732px] shrink-0 flex-col bg-white pb-24">
          <div className="flex flex-col gap-10 px-40 pt-12">
            <h1 className="text-center text-[32px] font-normal italic text-[var(--juno-primary)]">
              Book an appointment
            </h1>
            <LocationDropdown />
          </div>

          {/* Calendar */}
          <div className="flex flex-col gap-4 px-40 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 rounded-full border border-[var(--juno-border)] bg-white px-3 py-2">
                <button
                  type="button"
                  onClick={handlePrevWeek}
                  className="flex size-6 items-center justify-center rounded-full hover:bg-[var(--juno-neutral-20)] disabled:opacity-40"
                  aria-label="Previous week"
                >
                  <CaretLeft className="size-6 text-[var(--juno-text-header)]" weight="bold" />
                </button>
                <span className="min-w-[140px] text-center text-base font-medium text-[var(--juno-primary)]">
                  {format(weekStart, "MMMM d")} – {format(weekEnd, "d")}
                </span>
                <button
                  type="button"
                  onClick={handleNextWeek}
                  className="flex size-6 items-center justify-center rounded-full hover:bg-[var(--juno-neutral-20)]"
                  aria-label="Next week"
                >
                  <CaretRight className="size-6 text-[var(--juno-primary)]" weight="bold" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              {weekDates.map((date) => (
                <DateTile
                  key={date.toISOString()}
                  date={date}
                  selected={
                    selectedDate.toDateString() === date.toDateString()
                  }
                  available={hasAvailableSlots(date)}
                  onClick={() => setSelectedDate(date)}
                />
              ))}
            </div>
          </div>

          {/* Time slots */}
          <div className="mt-6 flex flex-col gap-4 px-40">
            <h2 className="text-left text-base font-medium text-[var(--juno-primary)]">
              {format(selectedDate, "MMMM d, yyyy")}
            </h2>
            {(() => {
              const availableSlots = timeSlots.filter(
                (slot) => slot.status === "available",
              )
              if (availableSlots.length === 0) {
                const nextAvailable = getNextAvailableDate(selectedDate)
                return (
                  <div className="flex w-full flex-col items-center justify-center gap-4 rounded-[14px] border border-[var(--juno-border)] bg-[var(--juno-neutral-20)] px-6 py-10">
                    <p className="text-center text-base font-medium text-[var(--juno-text-subtext)]">
                      No availability
                    </p>
                    <p className="text-center text-sm text-[var(--juno-text-subtext)]">
                      There are no appointments available on this date. Please
                      select another day.
                    </p>
                    {nextAvailable && (
                      <button
                        type="button"
                        onClick={handleJumpToNextAvailable}
                        className="rounded-full border-2 border-[var(--juno-primary)] bg-[var(--juno-primary)] px-6 py-2.5 text-sm font-bold tracking-[0.7px] text-white transition-colors hover:bg-[#1a4030]"
                      >
                        Jump to next available
                      </button>
                    )}
                  </div>
                )
              }
              return (
                <div className="flex w-full flex-wrap justify-start gap-[11px]">
                  {availableSlots.map((slot) => (
                    <TimeChip
                      key={slot.time24}
                      time={slot.time}
                      selected={selectedTime === slot.time24}
                      onClick={() =>
                        setSelectedTime((t) =>
                          t === slot.time24 ? null : slot.time24,
                        )
                      }
                    />
                  ))}
                </div>
              )
            })()}
          </div>
        </div>

        {/* Right: Hero image */}
        <div className="absolute right-0 top-0 h-full min-w-[400px] flex-1 overflow-hidden lg:w-[calc(100%-732px)]">
          <img
            src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden
          />
          <div className="absolute inset-0 bg-[var(--juno-primary)]/40" />
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-10 border-t border-[var(--juno-neutral-40)] bg-[var(--juno-neutral-20)] px-6 py-4">
        <div className="mx-auto flex max-w-[732px] flex-col items-center gap-3">
          <button
            type="button"
            className="w-full rounded-full border-2 border-[var(--juno-primary)] bg-[var(--juno-primary)] px-16 py-3 text-sm font-bold tracking-wide text-white transition-colors hover:bg-[#1a4030]"
          >
            Next
          </button>
          <button
            type="button"
            className="text-sm font-bold text-[var(--juno-primary)] hover:underline"
          >
            Book appointment later
          </button>
        </div>
      </footer>
    </div>
  )
}
