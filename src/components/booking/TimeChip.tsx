import { cn } from "@/lib/utils";

interface TimeChipProps {
  time: string;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export function TimeChip({ time, selected, onClick, disabled }: TimeChipProps) {
  const ariaLabel = selected ? `${time}, selected` : time;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={selected}
      className={cn(
        "inline-flex h-[41px] min-h-[41px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-[24px] border border-transparent px-6 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--juno-primary)] focus-visible:ring-offset-2 lg:h-8 lg:min-h-[32px] lg:px-4 lg:py-1.5",
        selected
          ? "bg-[var(--juno-surface-contrast)] border-transparent text-[var(--juno-primary)]"
          : "bg-[var(--juno-surface-tertiary)] text-[var(--juno-primary)] hover:bg-[var(--juno-surface-contrast)]/80",
        disabled && "cursor-not-allowed opacity-60",
      )}
      style={{ fontFamily: "var(--font-basetica)" }}
    >
      <span className="text-sm font-medium">{time}</span>
    </button>
  );
}
