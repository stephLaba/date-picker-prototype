import * as React from "react";
import { createPortal } from "react-dom";
import { addWeeks, format, startOfWeek, subWeeks } from "date-fns";
import {
  ArrowLeft,
  CalendarBlank,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";

import { DateTile } from "@/components/booking/DateTile";
import { LocationDropdown } from "@/components/booking/LocationDropdown";
import { TimeChip } from "@/components/booking/TimeChip";
import { useGridKeyboardNav } from "@/components/booking/useGridKeyboardNav";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

function BookingContent() {
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

  const hasSlots = React.useMemo(
    () => timeSlots.some((s) => s.status === "available"),
    [timeSlots],
  );

  React.useEffect(() => {
    if (!hasSlots) setSelectedTime(null);
  }, [hasSlots]);

  const handlePrevWeek = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextWeekStart = subWeeks(weekStart, 1);
    setWeekStart(nextWeekStart);
    const nextWeekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(nextWeekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
    const isSelectedInNextWeek = nextWeekDates.some(
      (d) => d.toDateString() === selectedDate.toDateString(),
    );
    if (!isSelectedInNextWeek) {
      const firstInWeek = nextWeekDates.find((d) => hasAvailableSlots(d));
      setSelectedDate(firstInWeek ?? nextWeekDates[0]);
    }
  };
  const handleNextWeek = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextWeekStart = addWeeks(weekStart, 1);
    setWeekStart(nextWeekStart);
    const nextWeekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(nextWeekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
    const isSelectedInNextWeek = nextWeekDates.some(
      (d) => d.toDateString() === selectedDate.toDateString(),
    );
    if (!isSelectedInNextWeek) {
      const firstInWeek = nextWeekDates.find((d) => hasAvailableSlots(d));
      setSelectedDate(firstInWeek ?? nextWeekDates[0]);
    }
  };

  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const dateGridRef = React.useRef<HTMLDivElement>(null);
  const timeGridRef = React.useRef<HTMLDivElement>(null);
  const dateGridNav = useGridKeyboardNav(dateGridRef, { columns: 7, vertical: false });
  const timeGridNav = useGridKeyboardNav(timeGridRef, { columns: 3, vertical: true });

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      setWeekStart(startOfWeek(date, { weekStartsOn: 0 }));
      setSelectedDate(date);
      setCalendarOpen(false);
    }
  };

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

  const todayWeekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const isPrevDisabled = weekStart.getTime() <= todayWeekStart.getTime();
  const isNextDisabled = false;

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
        style={{ fontFamily: "var(--font-basetica)" }}
      >
        Skip to main content
      </a>

      {/* Nav */}
      <nav className="relative z-10 shrink-0">
        {/* Mobile nav */}
        <div className="flex min-h-[61px] items-center justify-between px-4 py-6 lg:hidden">
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full bg-[var(--juno-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--juno-primary)]"
            aria-label="Go back"
          >
            <ArrowLeft className="size-6 text-white" weight="bold" aria-hidden />
          </button>
          <img
            src="/logo.svg"
            alt="Juno Veterinary"
            className="h-9 w-[88px] object-contain"
          />
          <div className="size-10" aria-hidden />
        </div>
        <div
          className="relative h-1.5 w-full bg-[var(--juno-surface-tertiary)] lg:hidden"
          role="progressbar"
          aria-valuenow={CURRENT_STEP_INDEX + 1}
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-label={`Step ${CURRENT_STEP_INDEX + 1} of ${STEPS.length}: ${STEPS[CURRENT_STEP_INDEX]}`}
        >
          <div
            className="absolute inset-y-0 left-0 h-full bg-[var(--juno-accent)]"
            style={{
              width: `${((CURRENT_STEP_INDEX + 1) / STEPS.length) * 100}%`,
            }}
          />
        </div>
        {/* Desktop nav */}
        <div className="hidden h-[116px] items-center px-10 lg:flex">
          <button
            type="button"
            className="flex size-[45px] items-center justify-center rounded-full bg-[var(--juno-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--juno-primary)]"
            aria-label="Go back"
          >
            <ArrowLeft
              className="size-6 text-white"
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
        <div className="hidden lg:block">
          {/* Progress bar */}
          <div
            className="relative h-[5px] w-full bg-[var(--juno-surface-tertiary)]"
            role="progressbar"
            aria-valuenow={CURRENT_STEP_INDEX + 1}
            aria-valuemin={1}
            aria-valuemax={STEPS.length}
            aria-label={`Step ${CURRENT_STEP_INDEX + 1} of ${STEPS.length}: ${STEPS[CURRENT_STEP_INDEX]}`}
          >
            <div
              className="absolute inset-y-0 left-0 h-full bg-[var(--juno-accent)]"
              style={{
                width: `${((CURRENT_STEP_INDEX + 1) / STEPS.length) * 100}%`,
              }}
            />
          </div>
          <div
            className="flex justify-between border-b border-[var(--juno-neutral-40)] px-10 py-4"
            style={{ fontFamily: "var(--font-tiempos)" }}
          >
            {STEPS.map((label, i) => (
              <span
                key={label}
                className={cn(
                  "text-sm italic",
                  i === CURRENT_STEP_INDEX
                    ? "text-[var(--juno-text-header)]"
                    : "text-[var(--juno-text-subtext)]",
                )}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </nav>

      {/* Two-column layout */}
      <main
        id="main-content"
        role="main"
        className="relative flex min-h-0 flex-1 overflow-hidden lg:h-[calc(100vh-154px)]"
        aria-label="Book an appointment"
      >
        {/* Left: Booking form */}
        <div className="relative z-10 flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-y-auto bg-white pb-28 lg:w-1/2 lg:flex-none">
          <div className="flex w-full flex-col items-center gap-6 px-4 pt-6 lg:gap-10 lg:pt-12 lg:px-12">
            <h1
              className="animate-fade-slide-up w-full max-w-[458px] text-center text-2xl font-normal italic text-[var(--juno-primary)] lg:text-[32px]"
              style={{ fontFamily: "var(--font-tiempos)" }}
            >
              Book an appointment
            </h1>
            <div className="flex w-full max-w-[458px] flex-col gap-6 items-center lg:gap-10">
              <div className="animate-fade-slide-up-delay-1 w-full lg:hidden">
                <LocationDropdown className="w-full" size="mobile" />
              </div>
              <div className="animate-fade-slide-up-delay-1 hidden w-full lg:block">
                <LocationDropdown className="w-full" size="desktop" />
              </div>

              {/* Calendar - same style for all screen sizes */}
              <section
                className="animate-fade-slide-up-delay-2 flex w-full flex-col gap-4 items-center pt-[24px]"
                aria-label="Select date"
              >
                <div
                  className="flex w-full items-center justify-center gap-[16px]"
                  style={{ fontFamily: "var(--font-basetica)" }}
                  role="group"
                  aria-label="Week navigation"
                >
<button
                        type="button"
                        onClick={handlePrevWeek}
                        disabled={isPrevDisabled}
                        aria-disabled={isPrevDisabled}
                        className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--juno-primary)] focus-visible:ring-offset-2",
                      isPrevDisabled
                        ? "bg-[var(--juno-neutral-40)] opacity-60 cursor-not-allowed"
                        : "border border-transparent bg-[var(--juno-primary)] hover:bg-[var(--juno-primary)]/90",
                    )}
                    aria-label="Previous week"
                  >
                    <CaretLeft
                      aria-hidden
                      className={cn(
                        "size-3.5",
                        isPrevDisabled
                          ? "text-[var(--juno-text-subtext)]"
                          : "text-white",
                      )}
                      weight="bold"
                    />
                  </button>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex w-[220px] min-w-[220px] items-center justify-center gap-2 rounded-full border border-[var(--juno-border)] bg-white px-3 py-2 text-base font-medium text-[var(--juno-primary)] transition-colors hover:bg-[var(--juno-neutral-20)] focus:outline-none focus:ring-2 focus:ring-[var(--juno-primary)] focus:ring-offset-1"
                        aria-label={`Selected week: ${format(weekStart, "MMMM d")} to ${format(weekEnd, "d")}. Press Enter to open calendar and pick a date.`}
                      >
                        <CalendarBlank
                          className="size-5 shrink-0"
                          weight="bold"
                          aria-hidden
                        />
                        <span>
                          {format(weekStart, "MMMM d")} – {format(weekEnd, "d")}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[336px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[14px] border-[var(--juno-border)] p-0 data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100 data-[state=open]:slide-in-from-top-2 data-[state=closed]:slide-out-to-top-2 duration-200 origin-top"
                      align="center"
                      aria-describedby="calendar-instructions"
                    >
                      <p id="calendar-instructions" className="sr-only">
                        Use arrow keys to navigate dates. Press Enter to select.
                        Press Escape to close.
                      </p>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleCalendarSelect}
                        defaultMonth={weekStart}
                        disabled={(date) => !hasAvailableSlots(date)}
                        style={{ fontFamily: "var(--font-basetica)" }}
                      />
                    </PopoverContent>
                  </Popover>
                  <button
                    type="button"
                    onClick={handleNextWeek}
                    disabled={isNextDisabled}
                    aria-disabled={isNextDisabled}
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--juno-primary)] focus-visible:ring-offset-2",
                      isNextDisabled
                        ? "bg-[var(--juno-neutral-40)] opacity-60 cursor-not-allowed"
                        : "border border-transparent bg-[var(--juno-primary)] hover:bg-[var(--juno-primary)]/90",
                    )}
                    aria-label="Next week"
                  >
                    <CaretRight
                      aria-hidden
                      className={cn(
                        "size-3.5",
                        isNextDisabled
                          ? "text-[var(--juno-text-subtext)]"
                          : "text-white",
                      )}
                      weight="bold"
                    />
                  </button>
                </div>

<div
                className="w-full"
                role="group"
                aria-label="Select a day of the week. Use left and right arrow keys to move between dates."
              >
                <div
                  ref={dateGridRef}
                  onKeyDown={dateGridNav.onKeyDown}
                  className="grid w-full grid-cols-7 gap-2"
                >
                    {weekDates.map((date, i) => (
                      <div
                        key={date.toISOString()}
                        className="animate-fade-slide-up min-w-0"
                        style={{ animationDelay: `${i * 45}ms` }}
                      >
                        <DateTile
                          date={date}
                          selected={
                            selectedDate.toDateString() === date.toDateString()
                          }
                          available={hasAvailableSlots(date)}
                          onClick={() => setSelectedDate(date)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Time slots */}
              <section
                className="mt-3 flex w-full flex-col items-start gap-4 pb-5"
                aria-label="Available times"
              >
                <h2
                  className="animate-fade-slide-up-delay-3 w-full text-left text-base font-medium text-[var(--juno-primary)]"
                  style={{ fontFamily: "var(--font-basetica)" }}
                >
                  {format(selectedDate, "MMMM d, yyyy")}
                </h2>
                <div
                  key={selectedDate.toDateString()}
                  className="animate-fade-slide-up w-full"
                >
                  {(() => {
                    const availableSlots = timeSlots.filter(
                      (slot) => slot.status === "available",
                    );
                    if (availableSlots.length === 0) {
                      const nextAvailable = getNextAvailableDate(selectedDate);
                      return (
                        <div
                          className="flex w-full flex-col items-center justify-center gap-4 rounded-[14px] border border-[var(--juno-border)] bg-[var(--juno-neutral-20)] px-6 py-10"
                          style={{ fontFamily: "var(--font-basetica)" }}
                        >
                          <p className="text-center text-base font-medium text-[var(--juno-text-subtext)]">
                            No availability
                          </p>
                          <p className="text-center text-sm text-[var(--juno-text-subtext)]">
                            There are no appointments available on this date.
                            Please select another day.
                          </p>
                          {nextAvailable && (
                            <button
                              type="button"
                              onClick={handleJumpToNextAvailable}
                              aria-label={`Jump to next available date: ${format(nextAvailable, "EEEE, MMMM d")}`}
                              className="rounded-full border border-[var(--juno-primary)] bg-[var(--juno-primary)] px-6 py-2.5 text-sm font-bold tracking-[0.7px] text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--juno-primary)] focus-visible:ring-offset-2 hover:bg-[#1a4030]"
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
                        className="grid w-full grid-cols-3 gap-[11px] sm:gap-4 [&>div]:flex [&>div]:justify-center [&>div>button]:w-full"
                      >
                        {availableSlots.map((slot) => (
                          <div key={slot.time24} className="w-full">
                            <TimeChip
                              time={slot.time}
                              selected={selectedTime === slot.time24}
                              onClick={() =>
                                setSelectedTime((t) =>
                                  t === slot.time24 ? null : slot.time24,
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Right: Hero image */}
        <div className="animate-fade-in pointer-events-none relative hidden min-h-0 min-w-0 flex-1 overflow-hidden lg:flex lg:w-1/2 lg:flex-none lg:items-center lg:justify-center">
          <img
            src="/hero-dog.jpg"
            alt=""
            className="h-full min-h-0 w-full object-cover object-top"
            aria-hidden
          />
        </div>
      </main>

      {/* Footer */}
      {createPortal(
          <footer
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--juno-neutral-40)] bg-[var(--juno-neutral-20)] px-6 py-4 lg:right-auto lg:w-1/2"
            role="contentinfo"
            aria-label="Booking actions"
          >
            <div className="mx-auto flex w-full max-w-[458px] items-center gap-3">
              <button
                type="button"
                aria-label="Book appointment later"
                className="flex-1 rounded-full border-2 border-[var(--juno-primary)] bg-transparent py-3 text-sm font-bold tracking-[0.7px] text-[var(--juno-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--juno-primary)] focus-visible:ring-offset-2 hover:bg-[var(--juno-primary-subdued)]/20"
                style={{ fontFamily: "var(--font-basetica)" }}
              >
                Book later
              </button>
              <button
                type="button"
                aria-label="Continue to next step"
                className="flex-1 rounded-full border border-[var(--juno-primary)] bg-[var(--juno-primary)] py-3 text-sm font-bold tracking-[0.7px] text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--juno-primary)] focus-visible:ring-offset-2 hover:bg-[#1a4030]"
                style={{ fontFamily: "var(--font-basetica)" }}
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

export function VersionedBookingView() {
  return <BookingContent />;
}
