import { Card } from "./Card";

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}

export function StatCard({
  label,
  value,
  sub,
  accent = "text-white",
}: Readonly<Props>) {
  return (
    <Card className="flex flex-col items-center justify-center gap-1 px-4 py-6 text-center">
      <span className={`text-4xl font-bold tabular-nums ${accent}`}>
        {value}
      </span>
      <span className="text-xs font-medium uppercase tracking-wider text-white/50">
        {label}
      </span>
      {sub ? <span className="text-xs text-white/40">{sub}</span> : null}
    </Card>
  );
}
