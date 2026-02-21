import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface DateTileProps {
  date: Date
  selected?: boolean
  available?: boolean
  onClick?: () => void
  className?: string
}

export function DateTile({ date, selected, available = true, onClick, className }: DateTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-[68px] w-[58px] shrink-0 flex-col items-center justify-center rounded-[14px] border px-4 pb-[18px] pt-4 text-center transition-colors",
        selected
          ? "border-[var(--juno-primary)] bg-[var(--juno-primary)] text-white"
          : available
            ? "border-[var(--juno-border)] bg-white text-[var(--juno-primary)] hover:border-[var(--juno-primary-subdued)]"
            : "cursor-pointer border-[var(--juno-border)] bg-[var(--juno-neutral-20)] text-[var(--juno-text-subtext)] opacity-60 hover:opacity-80",
        className
      )}
      style={{ fontFamily: "var(--font-basetica)" }}
      aria-pressed={selected}
    >
      <span className={cn("text-lg font-bold", selected ? "text-white" : "text-[var(--juno-primary)]")}>{format(date, "d")}</span>
      <span className={cn("text-xs uppercase", selected ? "text-white/90" : "text-[var(--juno-primary-subdued)]")}>
        {format(date, "EEE")}
      </span>
    </button>
  )
}
