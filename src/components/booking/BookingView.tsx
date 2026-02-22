import * as React from "react";
import { createPortal } from "react-dom";
import { addWeeks, format, startOfWeek, subWeeks } from "date-fns";
import { ArrowLeft, CaretLeft, CaretRight } from "@phosphor-icons/react";

import { DateTile } from "@/components/booking/DateTile";
import { LocationDropdown } from "@/components/booking/LocationDropdown";
import { TimeChip } from "@/components/booking/TimeChip";
import { useGridKeyboardNav } from "@/components/booking/useGridKeyboardNav";
import {
  generateTimeSlotsForDay,
  getFirstAvailableDate,
  getNextAvailableDate,
  hasAvailableSlots,
} from "@/lib/mockSlots";
import { cn } from "@/lib/utils";

const STEPS = [
  "Select location",
  "Select reason",
  "Book appointment",
  "Pet details",
  "Create account",
  "Payment info",
];
const CURRENT_STEP_INDEX = 2;

export function BookingView() {
  const firstAvailable = React.useMemo(() => getFirstAvailableDate(), []);
  const [weekStart, setWeekStart] = React.useState(() =>
    startOfWeek(firstAvailable, { weekStartsOn: 0 }),
  );
  const [selectedDate, setSelectedDate] = React.useState<Date>(
    () => firstAvailable,
  );
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);

  const weekDates = React.useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [weekStart]);

  const timeSlots = React.useMemo(
    () => generateTimeSlotsForDay(selectedDate),
    [selectedDate],
  );

  const handlePrevWeek = () => setWeekStart((d) => subWeeks(d, 1));
  const handleNextWeek = () => setWeekStart((d) => addWeeks(d, 1));

  const handleJumpToNextAvailable = () => {
    const next = getNextAvailableDate(selectedDate);
    if (next) {
      setWeekStart(startOfWeek(next, { weekStartsOn: 0 }));
      setSelectedDate(next);
      setSelectedTime(null);
    }
  };

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const dateGridRef = React.useRef<HTMLDivElement>(null);
  const timeGridRef = React.useRef<HTMLDivElement>(null);
  const dateGridNav = useGridKeyboardNav(dateGridRef, { columns: 7, vertical: false });
  const timeGridNav = useGridKeyboardNav(timeGridRef, { vertical: false });

  return (
    <div className="flex h-full min-h-screen flex-col bg-white">
      <div
        aria-live="polite"
        aria-atomic
        className="sr-only"
        role="status"
      >
        {selectedDate &&
          (selectedTime
            ? `Appointment selected: ${format(selectedDate, "EEEE, MMMM d")} at ${selectedTime}`
            : `Date selected: ${format(selectedDate, "EEEE, MMMM d")}`)}
      </div>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[10000] focus:m-0 focus:h-auto focus:w-auto focus:overflow-visible focus:rounded-md focus:bg-[var(--juno-primary)] focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
      >
        Skip to main content
      </a>
      {/* Nav */}
      <nav className="relative z-10 shrink-0">
        <div className="flex h-[116px] items-center px-10">
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-full border border-transparent hover:bg-[var(--juno-neutral-20)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--juno-primary)] focus-visible:ring-offset-2"
            aria-label="Go back"
          >
            <ArrowLeft
              className="size-6 text-[var(--juno-primary)]"
              weight="bold"
              aria-hidden
            />
          </button>
          <img
            src="/logo.svg"
            alt="Juno Veterinary"
            className="absolute left-1/2 h-11 w-[110px] -translate-x-1/2 object-contain"
          />
        </div>
        {/* Progress bar */}
        <div
          className="relative"
          role="progressbar"
          aria-valuenow={CURRENT_STEP_INDEX + 1}
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-label={`Step ${CURRENT_STEP_INDEX + 1} of ${STEPS.length}: ${STEPS[CURRENT_STEP_INDEX]}`}
        >
          <div className="flex justify-between border-b border-[var(--juno-neutral-40)] px-10 pb-4 pt-1">
            {STEPS.map((label, i) => (
              <span
                key={label}
                className={cn(
                  "text-sm italic",
                  i <= CURRENT_STEP_INDEX
                    ? "text-[var(--juno-text-header)]"
                    : "text-[var(--juno-text-subtext)]",
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

      {/* Main content */}
      <main
        id="main-content"
        role="main"
        className="relative flex flex-1 overflow-auto"
        aria-label="Book an appointment"
      >
        {/* Left: Booking form */}
        <div className="relative z-10 flex w-[732px] shrink-0 flex-col bg-white pb-24">
          <div className="flex flex-col gap-10 px-40 pt-12">
            <h1 className="text-center text-[32px] font-normal italic text-[var(--juno-primary)]">
              Book an appointment
            </h1>
            <LocationDropdown />
          </div>

          {/* Calendar */}
          <div className="flex flex-col gap-4 px-40 pt-[40px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[40px] rounded-full border border-[var(--juno-border)] bg-white px-3 py-2">
                <button
                  type="button"
                  onClick={handlePrevWeek}
                  aria-label="Previous week"
                  className="flex size-6 items-center justify-center rounded-full border border-transparent hover:bg-[var(--juno-neutral-20)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--juno-primary)] focus-visible:ring-offset-2 disabled:opacity-40"
                >
                  <CaretLeft
                    className="size-6 text-[var(--juno-text-header)]"
                    weight="bold"
                    aria-hidden
                  />
                </button>
                <span className="min-w-[140px] text-center text-base font-medium text-[var(--juno-primary)]">
                  {format(weekStart, "MMMM d")} – {format(weekEnd, "d")}
                </span>
                <button
                  type="button"
                  onClick={handleNextWeek}
                  aria-label="Next week"
                  className="flex size-6 items-center justify-center rounded-full border border-transparent hover:bg-[var(--juno-neutral-20)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--juno-primary)] focus-visible:ring-offset-2"
                >
                  <CaretRight
                    className="size-6 text-[var(--juno-primary)]"
                    weight="bold"
                    aria-hidden
                  />
                </button>
              </div>
            </div>

            <div
              ref={dateGridRef}
              onKeyDown={dateGridNav.onKeyDown}
              role="group"
              aria-label="Select a day of the week. Use left and right arrow keys to move between dates."
              className="grid w-full grid-cols-7 gap-2"
            >
              {weekDates.map((date) => (
                <DateTile
                  key={date.toISOString()}
                  date={date}
                  selected={selectedDate.toDateString() === date.toDateString()}
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
              );
              if (availableSlots.length === 0) {
                const nextAvailable = getNextAvailableDate(selectedDate);
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
                        aria-label={`Jump to next available date: ${format(nextAvailable, "EEEE, MMMM d")}`}
                        className="rounded-full border border-[var(--juno-primary)] bg-[var(--juno-primary)] px-6 py-2.5 text-sm font-bold tracking-[0.7px] text-white transition-colors hover:bg-[#1a4030]"
                      >
                        Jump to next available
                      </button>
                    )}
                  </div>
                );
              }
              return (
                <div
                  ref={timeGridRef}
                  onKeyDown={timeGridNav.onKeyDown}
                  role="group"
                  aria-label="Available appointment times. Use arrow keys to move between times."
                  className="flex w-full flex-wrap justify-start gap-[11px]"
                >
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
              );
            })()}
          </div>
        </div>

        {/* Right: Hero image */}
        <div className="absolute right-0 top-0 flex h-full min-w-[400px] items-center justify-center flex-1 overflow-hidden lg:w-[calc(100%-732px)]">
          <img
            src="/hero-dog.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-top"
            aria-hidden
          />
        </div>
      </main>

      {/* Footer */}
      {createPortal(
          <footer
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--juno-neutral-40)] bg-[var(--juno-neutral-20)] px-6 py-4"
            role="contentinfo"
            aria-label="Booking actions"
          >
            <div className="mx-auto flex w-full max-w-[732px] items-center gap-3">
              <button
                type="button"
                aria-label="Book appointment later"
                className="flex-1 rounded-full border-2 border-[var(--juno-primary)] bg-transparent py-3 text-sm font-bold tracking-wide text-[var(--juno-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--juno-primary)] focus-visible:ring-offset-2 hover:bg-[var(--juno-primary-subdued)]/20"
              >
                Book later
              </button>
              <button
                type="button"
                aria-label="Continue to next step"
                className="flex-1 rounded-full border border-[var(--juno-primary)] bg-[var(--juno-primary)] py-3 text-sm font-bold tracking-wide text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--juno-primary)] focus-visible:ring-offset-2 hover:bg-[#1a4030]"
              >
                Next
              </button>
            </div>
          </footer>,
          document.body,
        )}
    </div>
  );
}
