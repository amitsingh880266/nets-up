interface Point {
  label: string;
  value: number;
}

export function TrendBars({ data }: Readonly<{ data: Point[] }>) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-2">
      {data.map((point, index) => (
        <div
          key={`${point.label}-${index}`}
          className="flex flex-1 flex-col items-center gap-1"
        >
          <div className="flex h-24 w-full items-end overflow-hidden rounded-md bg-white/5">
            <div
              className="w-full rounded-md bg-lime-400/80 transition-all"
              style={{ height: `${(point.value / max) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-white/40">{point.label}</span>
          <span className="text-[10px] font-semibold text-white/70">
            {point.value}%
          </span>
        </div>
      ))}
    </div>
  );
}
