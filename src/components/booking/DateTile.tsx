import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DateTileProps {
  date: Date;
  selected?: boolean;
  available?: boolean;
  onClick?: () => void;
  className?: string;
}

export function DateTile({
  date,
  selected,
  available = true,
  onClick,
  className,
}: DateTileProps) {
  const formattedDate = format(date, "EEEE, MMMM d");
  const ariaLabel = selected
    ? `${formattedDate}, selected`
    : available
      ? formattedDate
      : `${formattedDate}, no availability`;

  return (
    <button
      type="button"
      onClick={available ? onClick : undefined}
      aria-label={ariaLabel}
      aria-pressed={selected}
      aria-disabled={!available}
      className={cn(
        "flex h-[68px] w-full min-w-0 flex-col items-center justify-center rounded-[14px] border px-4 pt-4 pb-[18px] text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--juno-primary)] focus-visible:ring-offset-2",
        selected
          ? "border border-[var(--juno-primary)] bg-[var(--juno-primary)] text-white"
          : available
            ? "border border-[var(--juno-border)] bg-white text-[var(--juno-primary)]"
            : "cursor-pointer border border-[var(--juno-border)] bg-[var(--juno-neutral-20)] text-[var(--juno-text-subtext)] opacity-60 hover:opacity-80",
        className,
      )}
      style={{ fontFamily: "var(--font-basetica)" }}
    >
      <span
        className={cn(
          "text-xs uppercase leading-tight",
          selected ? "text-white/90" : "text-[var(--juno-primary-subdued)]",
        )}
      >
        {format(date, "EEE")}
      </span>
      <span
        className={cn(
          "text-lg font-bold leading-tight",
          selected ? "text-white" : "text-[var(--juno-primary)]",
        )}
      >
        {format(date, "d")}
      </span>
    </button>
  );
}
