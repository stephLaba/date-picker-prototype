import * as React from "react";
import { createPortal } from "react-dom";
import { addWeeks, format, startOfWeek, subWeeks } from "date-fns";
import {
  ArrowLeft,
  CalendarBlank,
  CaretLeft,
  CaretRight,
  ClockCounterClockwise,
} from "@phosphor-icons/react";

import { DateTile } from "@/components/booking/DateTile";
import { DesignVersionShelf } from "@/components/booking/DesignVersionShelf";
import { LocationDropdown } from "@/components/booking/LocationDropdown";
import { TimeChip } from "@/components/booking/TimeChip";
import {
  VersionProvider,
  useVersion,
} from "@/components/booking/VersionContext";
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

function toVersionState(
  weekStart: Date,
  selectedDate: Date,
  selectedTime: string | null,
) {
  return {
    weekStartIso: weekStart.toISOString(),
    selectedDateIso: selectedDate.toISOString(),
    selectedTime,
  };
}

function BookingContent() {
  const { shelfOpen, setShelfOpen } = useVersion();

  const firstAvailable = React.useMemo(() => getFirstAvailableDate(), []);
  const [weekStart, setWeekStart] = React.useState(() =>
    startOfWeek(firstAvailable, { weekStartsOn: 0 }),
  );
  const [selectedDate, setSelectedDate] = React.useState<Date>(() => firstAvailable);
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);

  const applyRevert = React.useCallback(
    (state: {
      weekStartIso: string;
      selectedDateIso: string;
      selectedTime: string | null;
    }) => {
      setWeekStart(new Date(state.weekStartIso));
      setSelectedDate(new Date(state.selectedDateIso));
      setSelectedTime(state.selectedTime);
    },
    [],
  );

  const getCurrentState = React.useCallback(
    () => toVersionState(weekStart, selectedDate, selectedTime),
    [weekStart, selectedDate, selectedTime],
  );

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
      {/* Timeline icon - portaled to body so it stays on top of backdrop and any parent overflow */}
      {typeof document !== "undefined" &&
        createPortal(
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShelfOpen(!shelfOpen);
            }}
            className="fixed right-6 top-6 z-[9999] flex size-10 items-center justify-center rounded-full border border-[var(--juno-border)] bg-white shadow-sm transition-colors hover:bg-[var(--juno-neutral-20)] hover:border-[var(--juno-primary-subdued)]"
            aria-label={
              shelfOpen ? "Close version history" : "Open version history"
            }
          >
            <ClockCounterClockwise
              className="size-5 text-[var(--juno-primary)]"
              weight="bold"
            />
          </button>,
          document.body,
        )}

      <DesignVersionShelf
        getCurrentState={getCurrentState}
        onRevert={applyRevert}
      />

      {/* Nav */}
      <nav className="relative z-10 shrink-0">
        {/* Mobile/tablet: compact nav */}
        <div className="flex h-[61px] items-center justify-between px-4 lg:hidden">
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full bg-[var(--juno-primary)]"
            aria-label="Go back"
          >
            <ArrowLeft className="size-6 text-white" weight="bold" />
          </button>
          <div
            className="flex flex-col items-center text-[var(--juno-primary)]"
            style={{ fontFamily: "var(--font-basetica)" }}
          >
            <span className="text-lg font-bold tracking-wide">JUNO</span>
            <span className="text-xs font-medium tracking-wide text-[var(--juno-primary-subdued)]">
              VETERINARY
            </span>
          </div>
          <div className="size-10" aria-hidden />
        </div>
        <div className="relative h-1.5 w-full bg-[var(--juno-surface-tertiary)] lg:hidden">
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
            className="flex size-11 items-center justify-center rounded-full hover:bg-[var(--juno-neutral-20)]"
            aria-label="Go back"
          >
            <ArrowLeft
              className="size-6 text-[var(--juno-primary)]"
              weight="bold"
            />
          </button>
          <div
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center text-[var(--juno-primary)]"
            style={{ fontFamily: "var(--font-basetica)" }}
          >
            <span className="text-xl font-bold tracking-wide">JUNO</span>
            <span className="text-sm font-medium tracking-wide text-[var(--juno-primary-subdued)]">
              VETERINARY
            </span>
          </div>
        </div>
        <div className="hidden border-b border-[var(--juno-neutral-40)] lg:block">
          <div
            className="flex justify-between px-10 py-4"
            style={{ fontFamily: "var(--font-tiempos)" }}
          >
            {STEPS.map((label, i) => (
              <span
                key={label}
                className={cn(
                  "text-sm italic",
                  i < CURRENT_STEP_INDEX && "text-[var(--juno-text-subtext)]",
                  i === CURRENT_STEP_INDEX &&
                    "font-medium text-[var(--juno-primary)]",
                  i > CURRENT_STEP_INDEX && "text-[var(--juno-text-subtext)]",
                )}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="relative h-1.5 w-full bg-[var(--juno-surface-tertiary)]">
            <div
              className="absolute inset-y-0 left-0 h-full bg-[var(--juno-accent)]"
              style={{
                width: `${((CURRENT_STEP_INDEX + 1) / STEPS.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </nav>

      {/* Two-column layout - 50/50 on desktop */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* Left: Booking form - 50% on desktop */}
        <div className="relative z-10 flex min-w-0 w-full flex-1 flex-col overflow-y-auto bg-white pb-28 lg:w-1/2 lg:flex-none">
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
              <div className="animate-fade-slide-up-delay-2 flex w-full flex-col gap-2 items-center lg:pt-5">
                <div
                  className="flex w-full items-center justify-center gap-4"
                  style={{ fontFamily: "var(--font-basetica)" }}
                >
                  <button
                    type="button"
                    onClick={handlePrevWeek}
                    disabled={isPrevDisabled}
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full transition-colors",
                      isPrevDisabled
                        ? "bg-[var(--juno-neutral-40)] opacity-60 cursor-not-allowed"
                        : "bg-[var(--juno-primary)] hover:bg-[var(--juno-primary)]/90",
                    )}
                    aria-label="Previous week"
                  >
                    <CaretLeft
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
                        className="flex w-[220px] min-w-[220px] items-center justify-center gap-2 rounded-full border border-[var(--juno-border)] bg-white px-6 py-2 text-base font-medium text-[var(--juno-primary)] transition-colors hover:bg-[var(--juno-neutral-20)] focus:outline-none focus:ring-2 focus:ring-[var(--juno-primary)] focus:ring-offset-1"
                        aria-label="Open calendar to pick date"
                      >
                        <CalendarBlank
                          className="size-5 shrink-0"
                          weight="bold"
                        />
                        <span>
                          {format(weekStart, "MMMM d")} – {format(weekEnd, "d")}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[458px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[14px] border-[var(--juno-border)] p-0 data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100 data-[state=open]:slide-in-from-top-2 data-[state=closed]:slide-out-to-top-2 duration-200 origin-top"
                      align="center"
                    >
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleCalendarSelect}
                        defaultMonth={weekStart}
                        dayHasEvent={hasAvailableSlots}
                        style={{ fontFamily: "var(--font-basetica)" }}
                      />
                    </PopoverContent>
                  </Popover>
                  <button
                    type="button"
                    onClick={handleNextWeek}
                    disabled={isNextDisabled}
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full transition-colors",
                      isNextDisabled
                        ? "bg-[var(--juno-neutral-40)] opacity-60 cursor-not-allowed"
                        : "bg-[var(--juno-primary)] hover:bg-[var(--juno-primary)]/90",
                    )}
                    aria-label="Next week"
                  >
                    <CaretRight
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

                <div className="relative w-full">
                  <div className="flex w-full justify-center overflow-x-auto gap-2 pb-2 px-1 [scrollbar-gutter:stable]">
                    <div className="flex shrink-0 gap-2 py-1">
                      {weekDates.map((date, i) => (
                        <div
                          key={date.toISOString()}
                          className="animate-fade-slide-up"
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
                  <div
                    className="pointer-events-none absolute right-0 top-0 bottom-2 w-5 bg-gradient-to-r from-transparent to-white lg:hidden"
                    aria-hidden
                  />
                </div>
              </div>

              {/* Time slots */}
              <div className="mt-3 flex w-full flex-col items-start gap-4 pb-5">
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
                  )
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
                            className="rounded-full border-2 border-[var(--juno-primary)] bg-[var(--juno-primary)] px-6 py-2.5 text-sm font-bold tracking-[0.7px] text-white transition-colors hover:bg-[#1a4030]"
                          >
                            Jump to next available
                          </button>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div className="grid w-full grid-cols-3 gap-[11px] sm:gap-4 lg:flex lg:flex-row lg:flex-wrap lg:justify-start lg:gap-[11px] [&>div]:flex [&>div]:justify-center [&>div>button]:w-full lg:[&>div]:w-auto lg:[&>div]:justify-start lg:[&>div>button]:w-auto">
                      {availableSlots.map((slot) => (
                        <div key={slot.time24} className="w-full lg:w-auto">
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
                  )
                })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Hero image - 50% on desktop; pointer-events-none so timeline button stays clickable */}
        <div className="animate-fade-in pointer-events-none relative hidden min-w-0 flex-1 overflow-hidden lg:block lg:w-1/2 lg:flex-none">
          <img
            src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800"
            alt=""
            className="h-full w-full object-cover"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[var(--juno-primary)]/40"
            aria-hidden
          />
        </div>
      </div>

      {/* Footer - full width on mobile, left 50% on desktop to match booking column */}
      <footer className="fixed bottom-0 left-0 right-0 z-10 border-t border-[var(--juno-neutral-40)] bg-[var(--juno-neutral-20)] px-6 py-4 lg:right-auto lg:w-1/2">
        <div className="mx-auto flex max-w-[458px] flex-col items-center gap-3">
          <button
            type="button"
            className="w-full rounded-full border-2 border-[var(--juno-primary)] bg-[var(--juno-primary)] px-16 py-3 text-sm font-bold tracking-[0.7px] text-white transition-colors hover:bg-[#1a4030]"
            style={{ fontFamily: "var(--font-basetica)" }}
          >
            Next
          </button>
          <button
            type="button"
            className="text-sm font-bold text-[var(--juno-primary)] hover:underline"
            style={{ fontFamily: "var(--font-basetica)" }}
          >
            Book appointment later
          </button>
        </div>
      </footer>
    </div>
  );
}

export function VersionedBookingView() {
  return (
    <VersionProvider>
      <BookingContent />
    </VersionProvider>
  );
}
