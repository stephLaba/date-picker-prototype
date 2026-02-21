import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface DateTileProps {
  date: Date
  selected?: boolean
  onClick?: () => void
  className?: string
}

export function DateTile({ date, selected, onClick, className }: DateTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-[68px] w-[58px] shrink-0 flex-col items-center justify-center rounded-[14px] border px-4 pb-[18px] pt-4 text-center transition-colors",
        selected
          ? "border-[var(--juno-primary)] bg-[var(--juno-primary)] text-white"
          : "border-[var(--juno-border)] bg-white text-[var(--juno-primary)] hover:border-[var(--juno-primary-subdued)]",
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
