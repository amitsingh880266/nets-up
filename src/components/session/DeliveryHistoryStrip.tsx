import type { Delivery } from "@/types";
import { OUTCOME_SHORT } from "@/constants/outcomes";

const DOT_STYLES: Record<Delivery["outcome"], string> = {
  played: "bg-emerald-400 text-black",
  middle: "bg-lime-400 text-black",
  edge: "bg-amber-400 text-black",
  miss: "bg-white/20 text-white",
  wide: "bg-sky-400 text-black",
  out: "bg-red-500 text-white",
};

export function DeliveryHistoryStrip({
  deliveries,
}: Readonly<{ deliveries: Delivery[] }>) {
  const recent = deliveries.slice(-12);

  if (recent.length === 0) {
    return <p className="text-sm text-white/40">No deliveries recorded yet.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {recent.map((delivery) => (
        <span
          key={delivery.id}
          title={delivery.outcome}
          className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${DOT_STYLES[delivery.outcome]}`}
        >
          {OUTCOME_SHORT[delivery.outcome]}
        </span>
      ))}
    </div>
  );
}
