"use client";

import { useEffect, useState } from "react";
import type { OutType } from "@/types";
import { OUT_TYPE_LABELS } from "@/constants/outcomes";

interface Props {
  deliveryId: string | null;
  onSelect: (outType: OutType) => void;
  onDismiss: () => void;
}

const OUT_TYPES: OutType[] = ["bowled", "caught", "lbw", "runout", "other"];

export function OutTypePrompt({
  deliveryId,
  onSelect,
  onDismiss,
}: Readonly<Props>) {
  const [visible, setVisible] = useState(false);
  const [shownId, setShownId] = useState(deliveryId);

  if (deliveryId && deliveryId !== shownId) {
    setShownId(deliveryId);
    setVisible(true);
  }

  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [visible, onDismiss]);

  if (!deliveryId || !visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-24 z-40 flex justify-center px-4">
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/80 p-3 backdrop-blur">
        <span className="w-full text-center text-xs text-white/50">
          How was the batter out?
        </span>
        {OUT_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setVisible(false);
              onSelect(type);
            }}
            className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
          >
            {OUT_TYPE_LABELS[type]}
          </button>
        ))}
      </div>
    </div>
  );
}
