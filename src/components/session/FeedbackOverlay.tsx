"use client";

import { useEffect, useState } from "react";
import type { DeliveryOutcome } from "@/types";
import { OUTCOME_FEEDBACK } from "@/constants/outcomes";

interface Props {
  outcome: DeliveryOutcome | null;
  feedbackKey: number;
}

const OUTCOME_COLOR: Record<DeliveryOutcome, string> = {
  played: "text-emerald-400",
  middle: "text-lime-400",
  edge: "text-amber-400",
  miss: "text-white/70",
  wide: "text-sky-400",
  out: "text-red-500",
};

export function FeedbackOverlay({ outcome, feedbackKey }: Readonly<Props>) {
  const [visible, setVisible] = useState(false);
  const [shownKey, setShownKey] = useState(feedbackKey);

  if (outcome && feedbackKey !== shownKey) {
    setShownKey(feedbackKey);
    setVisible(true);
  }

  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(
      () => setVisible(false),
      outcome === "out" ? 900 : 650,
    );
    return () => window.clearTimeout(timer);
  }, [visible, outcome]);

  if (!outcome || !visible) return null;

  return (
    <div
      aria-live="polite"
      className={`pointer-events-none fixed inset-0 z-50 flex items-center justify-center ${
        outcome === "out" ? "animate-[screen-shake_0.4s_ease-in-out]" : ""
      }`}
    >
      <span
        key={feedbackKey}
        className={`animate-[ball-feedback_0.6s_ease-out] text-6xl font-black tracking-tight drop-shadow-lg ${OUTCOME_COLOR[outcome]}`}
      >
        {OUTCOME_FEEDBACK[outcome]}
      </span>
    </div>
  );
}
