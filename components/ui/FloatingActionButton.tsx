"use client";

import Link from "next/link";
import { Plus } from "phosphor-react";

interface FloatingActionButtonProps {
  href: string;
  label: string;
  offset?: number;
}

export function FloatingActionButton({ href, label, offset = 0 }: FloatingActionButtonProps) {
  return (
    <Link
      href={href}
      style={{ bottom: `${96 + offset}px` }}
      className="fixed right-6 z-40 flex items-center gap-2 rounded-full bg-accent px-5 py-3.5 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
    >
      <Plus size={22} weight="bold" />
      <span className="font-medium">{label}</span>
    </Link>
  );
}
