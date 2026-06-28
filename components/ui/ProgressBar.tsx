import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  barClassName,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      className={cn(
        "h-3 w-full overflow-hidden rounded-full bg-cream",
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full bg-accent transition-all duration-500",
          barClassName
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
