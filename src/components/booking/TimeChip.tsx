import { Check } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

interface TimeChipProps {
  time: string
  selected?: boolean
  onClick?: () => void
  disabled?: boolean
}

export function TimeChip({ time, selected, onClick, disabled }: TimeChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-[41px] min-h-[41px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-[24px] border-2 border-transparent px-6 py-2 transition-colors lg:justify-start lg:h-8 lg:min-h-[32px] lg:px-4 lg:py-1.5",
        selected
          ? "bg-[var(--juno-surface-tertiary)] border-dashed border-[var(--juno-selection-border)] text-[var(--juno-primary)] lg:border-transparent lg:bg-[var(--juno-surface-contrast)] lg:pl-4 lg:pr-1"
          : "bg-[var(--juno-surface-tertiary)] text-[var(--juno-primary)] hover:bg-[var(--juno-surface-contrast)]/80",
        disabled && "cursor-not-allowed opacity-60"
      )}
      style={{ fontFamily: "var(--font-basetica)" }}
      aria-pressed={selected}
    >
      <span className="text-sm font-medium">{time}</span>
      {selected && <Check className="size-5 shrink-0" weight="bold" />}
    </button>
  )
}
