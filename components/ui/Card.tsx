import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-surface p-5 shadow-sm border border-black/5",
        className
      )}
    >
      {children}
    </div>
  );
}
