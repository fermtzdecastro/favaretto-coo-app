import { LogoutButton } from "@/components/ui/LogoutButton";

interface DashboardHeaderProps {
  mesLabel: string;
  roleLabel: string;
}

export function DashboardHeader({ mesLabel, roleLabel }: DashboardHeaderProps) {
  return (
    <header className="border-b border-cream-dark bg-surface overflow-hidden">
      <div className="relative flex items-center justify-center px-4 -my-12 md:-my-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/Logo_Favaretto.jpg"
          alt="Favaretto"
          style={{ height: "260px", width: "auto", objectFit: "contain" }}
          className="md:h-[360px]"
        />

        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <span className="rounded-full bg-cream px-3 py-1 text-xs font-medium text-text-main">
            {roleLabel}
          </span>
          <LogoutButton />
        </div>
      </div>

      <p className="pb-2 text-center text-sm capitalize text-text-muted">
        {mesLabel}
      </p>
    </header>
  );
}