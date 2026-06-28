"use client";

import { Warning } from "phosphor-react";

interface AlertBannerProps {
  message: string;
}

export function AlertBanner({ message }: AlertBannerProps) {
  return (
    <div
      className="flex items-start gap-3 rounded-xl border border-yellow/30 bg-yellow/10 p-4"
      role="alert"
    >
      <Warning
        size={22}
        className="mt-0.5 shrink-0 text-yellow"
        weight="fill"
      />
      <p className="text-sm leading-relaxed text-text-main">{message}</p>
    </div>
  );
}
