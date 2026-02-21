import * as React from "react"
import { CaretDown, Check, MapPin } from "@phosphor-icons/react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface Location {
  id: string
  name: string
  address: string
  nextAvailable: string
  imageUrl?: string | null
}

const LOCATIONS: Location[] = [
  {
    id: "bloor-west",
    name: "Bloor West",
    address: "Bloor St W & Jane St",
    nextAvailable: "Today",
    imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=112",
  },
  {
    id: "king-west",
    name: "King West",
    address: "Portland St & Richmond St",
    nextAvailable: "Thurs Jun 3",
    imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=112",
  },
  {
    id: "leaside",
    name: "Leaside",
    address: "Laird Dr & Industrial St",
    nextAvailable: "Thurs Jun 3",
    imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=112",
  },
  {
    id: "leslieville",
    name: "Leslieville",
    address: "Queen St E & Carlaw Ave",
    nextAvailable: "Fri Jun 4",
    imageUrl: null, // Uses placeholder
  },
  {
    id: "summerhill",
    name: "Summerhill",
    address: "Yonge St & Roxborough St",
    nextAvailable: "Thurs Jun 3",
    imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=112",
  },
]

interface LocationDropdownProps {
  value?: string | null
  onValueChange?: (id: string) => void
  className?: string
  size?: "desktop" | "mobile"
}

export function LocationDropdown({
  value,
  onValueChange,
  className,
  size = "desktop",
}: LocationDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const selectedLocation = value
    ? LOCATIONS.find((l) => l.id === value) ?? LOCATIONS[4]
    : LOCATIONS[4] // Default Summerhill
  const imgSize = size === "mobile" ? 40 : 56

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-between rounded-[14px] border bg-white text-left transition-colors",
            size === "mobile"
              ? "h-[76px] px-4 py-3"
              : "w-[456px] max-w-full px-6 py-4",
            open
              ? "border-2 border-[var(--juno-primary)] rounded-b-none"
              : "border border-[var(--juno-border)] hover:border-[var(--juno-primary-subdued)]",
            className
          )}
          style={{ fontFamily: "var(--font-basetica)" }}
          aria-label="Select location"
          aria-expanded={open}
        >
          <div className="flex flex-1 min-w-0 items-center gap-3">
            <LocationImage
              location={selectedLocation}
              size={imgSize}
            />
            <div className="flex min-w-0 flex-col">
              <span className="text-base font-medium leading-6 text-[var(--juno-text-header)]">
                {selectedLocation.name}
              </span>
              <span className="text-sm leading-5 text-[var(--juno-text-subtext)]">
                {selectedLocation.address}
              </span>
            </div>
          </div>
          <div className="shrink-0">
            <CaretDown
              className={cn("size-4 text-[var(--juno-text-subtext)]", open && "rotate-180")}
              weight="bold"
            />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] rounded-t-none border-t-0 p-0 shadow-[0px_4px_2px_0px_rgba(16,24,40,0.06),0px_4px_8px_0px_rgba(16,24,41,0.1)]"
        align="start"
        sideOffset={0}
      >
        <div className="max-h-[280px] overflow-y-auto">
          {LOCATIONS.map((loc) => {
            const isSelected = loc.id === (value ?? selectedLocation.id)
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => {
                  onValueChange?.(loc.id)
                  setOpen(false)
                }}
                className={cn(
                  "flex w-full items-start gap-3 border-b border-[var(--juno-neutral-40)] px-6 py-4 text-left last:border-b-0 transition-colors hover:bg-[var(--juno-neutral-20)]",
                  size === "mobile" && "px-4 py-3",
                  isSelected && "bg-white"
                )}
                style={{ fontFamily: "var(--font-basetica)" }}
              >
                <LocationImage location={loc} size={imgSize} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span
                    className={cn(
                      "text-base leading-6",
                      isSelected ? "font-bold text-[#153524]" : "font-medium text-[var(--juno-text-header)]"
                    )}
                  >
                    {loc.name}
                  </span>
                  <span className="text-sm leading-5 text-[var(--juno-text-subtext)]">
                    {loc.address}
                  </span>
                  <span className="text-sm leading-5 text-[var(--juno-primary-subdued)]">
                    Next available: {loc.nextAvailable}
                  </span>
                </div>
                {isSelected && (
                  <Check
                    className="size-5 shrink-0 text-[var(--juno-primary)]"
                    weight="bold"
                  />
                )}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function LocationImage({
  location,
  size,
}: {
  location: Location
  size: number
}) {
  const isPlaceholder = !location.imageUrl

  return (
    <div
      className="shrink-0 overflow-hidden rounded-full bg-[#e7e3ef]"
      style={{ width: size, height: size }}
    >
      {isPlaceholder ? (
        <div className="flex size-full items-center justify-center">
          <MapPin className="size-4 text-[var(--juno-text-subtext)]" weight="bold" />
        </div>
      ) : (
        <img
          src={location.imageUrl!}
          alt=""
          className="size-full object-cover"
        />
      )}
    </div>
  )
}
