"use client";

import type { DeliveryOutcome } from "@/types";
import { OUTCOME_LABELS } from "@/constants/outcomes";

const OUTCOME_STYLES: Record<DeliveryOutcome, string> = {
  played: "bg-emerald-400/90 text-black hover:bg-emerald-400",
  middle: "bg-lime-400/90 text-black hover:bg-lime-400",
  edge: "bg-amber-400/90 text-black hover:bg-amber-400",
  miss: "bg-white/10 text-white hover:bg-white/15",
  wide: "bg-sky-400/90 text-black hover:bg-sky-400",
  out: "bg-red-500/90 text-white hover:bg-red-500",
};

interface Props {
  outcome: DeliveryOutcome;
  count: number;
  onTap: (outcome: DeliveryOutcome) => void;
  className?: string;
}

export function BallActionButton({
  outcome,
  count,
  onTap,
  className = "",
}: Readonly<Props>) {
  return (
    <button
      type="button"
      onClick={() => onTap(outcome)}
      className={`flex min-h-[104px] flex-col items-center justify-center gap-1 rounded-3xl font-bold transition-transform duration-100 active:scale-95 ${OUTCOME_STYLES[outcome]} ${className}`}
    >
      <span className="text-3xl tabular-nums">{count}</span>
      <span className="text-xs uppercase tracking-widest opacity-80">
        {OUTCOME_LABELS[outcome]}
      </span>
    </button>
  );
}
