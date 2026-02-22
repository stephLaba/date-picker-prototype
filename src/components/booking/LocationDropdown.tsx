import * as React from "react";
import { CaretDown, Check, MapPin } from "@phosphor-icons/react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getNextAvailableLabel } from "@/lib/mockSlots";
import { cn } from "@/lib/utils";

const LISTBOX_ID = "location-listbox";

export interface Location {
  id: string;
  name: string;
  address: string;
  imageUrl?: string | null;
}

const LOCATIONS: Location[] = [
  {
    id: "bloor-west",
    name: "Bloor West",
    address: "Bloor St W & Jane St",
    imageUrl:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=112",
  },
  {
    id: "king-west",
    name: "King West",
    address: "Portland St & Richmond St",
    imageUrl:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=112",
  },
  {
    id: "leaside",
    name: "Leaside",
    address: "Laird Dr & Industrial St",
    imageUrl:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=112",
  },
  {
    id: "leslieville",
    name: "Leslieville",
    address: "Queen St E & Carlaw Ave",
    imageUrl: null,
  },
  {
    id: "summerhill",
    name: "Summerhill",
    address: "Yonge St & Roxborough St",
    imageUrl:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=112",
  },
];

interface LocationDropdownProps {
  value?: string | null;
  onValueChange?: (id: string) => void;
  className?: string;
  size?: "desktop" | "mobile";
}

export function LocationDropdown({
  value,
  onValueChange,
  className,
  size = "desktop",
}: LocationDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState<string>(
    LOCATIONS[4].id,
  );
  const [activeIndex, setActiveIndex] = React.useState(0);
  const selectedId = value ?? internalValue;
  const selectedLocation =
    LOCATIONS.find((l) => l.id === selectedId) ?? LOCATIONS[4];
  const imgSize = size === "mobile" ? 40 : 56;
  const nextAvailable = React.useMemo(() => getNextAvailableLabel(), []);
  const optionRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const lastTriggerKey = React.useRef<string | null>(null);
  const closedViaTab = React.useRef(false);
  const ignoreNextArrowKey = React.useRef(false);

  React.useEffect(() => {
    if (open) {
      const focusIndex =
        lastTriggerKey.current === "ArrowUp"
          ? LOCATIONS.length - 1
          : 0;
      lastTriggerKey.current = null;
      setActiveIndex(focusIndex);
    }
  }, [open]);

  const handleSelect = (id: string) => {
    setInternalValue(id);
    onValueChange?.(id);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (open) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      lastTriggerKey.current = e.key;
      ignoreNextArrowKey.current = true;
      setOpen(true);
    }
  };

  const handleListboxKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (ignoreNextArrowKey.current) {
        ignoreNextArrowKey.current = false;
        e.preventDefault();
        return;
      }
    }

    const count = LOCATIONS.length;
    let next = activeIndex;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        next = Math.min(count - 1, activeIndex + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        next = Math.max(0, activeIndex - 1);
        break;
      case "Home":
        e.preventDefault();
        next = 0;
        break;
      case "End":
        e.preventDefault();
        next = count - 1;
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        return;
      case "Enter":
      case " ":
        e.preventDefault();
        handleSelect(LOCATIONS[activeIndex].id);
        return;
      case "Tab":
        closedViaTab.current = true;
        setOpen(false);
        return;
      default:
        return;
    }

    setActiveIndex(next);
    optionRefs.current[next]?.focus();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          aria-controls={open ? LISTBOX_ID : undefined}
          onKeyDown={handleTriggerKeyDown}
          className={cn(
            "flex w-full items-center justify-between rounded-[14px] border bg-white text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--juno-primary)] focus-visible:ring-offset-2",
            size === "mobile"
              ? "h-[76px] px-4 py-3"
              : "w-[456px] max-w-full px-6 py-4",
            open
              ? "border-2 border-[var(--juno-primary)]"
              : "border border-[var(--juno-border)]",
            className,
          )}
          style={{ fontFamily: "var(--font-basetica)" }}
          aria-label={`Select clinic location. Currently selected: ${selectedLocation.name}, ${selectedLocation.address}. Press Enter or Space to open.`}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <div className="flex flex-1 min-w-0 items-center gap-3">
            <LocationImage location={selectedLocation} size={imgSize} />
            <div className="flex min-w-0 flex-col">
              <span className="text-base font-medium leading-6 text-[var(--juno-text-header)]">
                {selectedLocation.name}
              </span>
              <span className="text-sm leading-5 text-[var(--juno-text-subtext)]">
                {selectedLocation.address}
              </span>
            </div>
          </div>
          <div className="shrink-0" aria-hidden>
            <CaretDown
              className={cn(
                "size-4 text-[var(--juno-primary)]",
                open && "rotate-180",
              )}
              weight="bold"
            />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-[14px] border border-[var(--juno-border)] p-0 shadow-[0px_4px_2px_0px_rgba(16,24,40,0.06),0px_4px_8px_0px_rgba(16,24,41,0.1)] duration-200"
        align="start"
        sideOffset={4}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          const focusIndex =
            lastTriggerKey.current === "ArrowUp"
              ? LOCATIONS.length - 1
              : 0;
          lastTriggerKey.current = null;
          setActiveIndex(focusIndex);
          requestAnimationFrame(() => {
            optionRefs.current[focusIndex]?.focus();
          });
        }}
        onCloseAutoFocus={(e) => {
          if (closedViaTab.current) {
            closedViaTab.current = false;
            e.preventDefault();
            return;
          }
          e.preventDefault();
          triggerRef.current?.focus();
        }}
      >
        <div
          id={LISTBOX_ID}
          className="max-h-[280px] overflow-y-auto"
          role="listbox"
          aria-label="Clinic locations. Use arrow keys to navigate, Enter to select."
          onKeyDown={handleListboxKeyDown}
        >
          {LOCATIONS.map((loc, i) => {
            const isSelected = loc.id === selectedId;
            return (
              <button
                key={loc.id}
                ref={(el) => {
                  optionRefs.current[i] = el;
                }}
                type="button"
                role="option"
                aria-selected={isSelected}
                tabIndex={i === activeIndex ? 0 : -1}
                onFocus={() => setActiveIndex(i)}
                onClick={() => handleSelect(loc.id)}
                className={cn(
                  "flex w-full items-center gap-3 border-b border-[var(--juno-neutral-40)] px-6 py-4 text-left last:border-b-0 last:rounded-b-[14px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--juno-primary)] hover:bg-[var(--juno-neutral-20)]",
                  size === "mobile" && "px-4 py-3",
                  isSelected && "bg-white",
                )}
                style={{ fontFamily: "var(--font-basetica)" }}
              >
                <LocationImage location={loc} size={imgSize} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span
                    className={cn(
                      "text-base leading-6",
                      isSelected
                        ? "font-bold text-[#153524]"
                        : "font-medium text-[var(--juno-text-header)]",
                    )}
                  >
                    {loc.name}
                  </span>
                  <span className="text-sm leading-5 text-[var(--juno-text-subtext)]">
                    {loc.address}
                  </span>
                  <span className="text-sm leading-5 text-[var(--juno-primary-subdued)]">
                    Next available: {nextAvailable}
                  </span>
                </div>
                {isSelected && (
                  <Check
                    className="size-5 shrink-0 text-[var(--juno-primary)]"
                    weight="bold"
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function LocationImage({
  location,
  size,
}: {
  location: Location;
  size: number;
}) {
  const isPlaceholder = !location.imageUrl;

  return (
    <div
      className="shrink-0 overflow-hidden rounded-full bg-[#e7e3ef]"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {isPlaceholder ? (
        <div className="flex size-full items-center justify-center">
          <MapPin
            className="size-4 text-[var(--juno-text-subtext)]"
            weight="bold"
          />
        </div>
      ) : (
        <img
          src={location.imageUrl!}
          alt=""
          className="size-full object-cover"
        />
      )}
    </div>
  );
}
