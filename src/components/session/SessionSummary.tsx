"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BackLink } from "@/components/ui/BackLink";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { storageService } from "@/lib/storage";
import { formatOvers, percentage } from "@/lib/stats/calculations";
import type { Player, Session } from "@/types";

export function SessionSummary({ sessionId }: Readonly<{ sessionId: string }>) {
  const [session, setSession] = useState<Session | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    storageService.getSession(sessionId).then(async (found) => {
      if (!active) return;
      if (!found) {
        setLoading(false);
        return;
      }
      const p = await storageService.getPlayer(found.playerId);
      if (!active) return;
      setSession(found);
      setPlayer(p);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [sessionId]);

  if (loading) {
    return <div className="flex-1 px-6 py-12 text-white/50">Loading…</div>;
  }

  if (!session) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center text-white">
        <p className="text-white/60">Session not found.</p>
        <Link href="/">
          <Button variant="secondary">Go home</Button>
        </Link>
      </div>
    );
  }

  const playedPct = percentage(session.played, session.legalBalls);
  const middlePct = percentage(session.middle, session.legalBalls);
  const edgePct = percentage(session.edges, session.legalBalls);
  const missPct = percentage(session.misses, session.legalBalls);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-12 text-white">
      <BackLink href="/" label="Home" />
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-lime-400">
          Session Complete
        </p>
        <h1 className="text-2xl font-bold">{player?.username}</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Balls Faced" value={session.totalDeliveries} />
        <StatCard label="Overs" value={formatOvers(session.legalBalls)} />
      </div>

      <Card className="flex flex-col gap-4 p-5">
        <SummaryRow
          label="Played"
          value={session.played}
          pct={playedPct}
          color="bg-emerald-400"
        />
        <SummaryRow
          label="Middle"
          value={session.middle}
          pct={middlePct}
          color="bg-lime-400"
        />
        <SummaryRow
          label="Edges"
          value={session.edges}
          pct={edgePct}
          color="bg-amber-400"
        />
        <SummaryRow
          label="Misses"
          value={session.misses}
          pct={missPct}
          color="bg-white/40"
        />
        <div className="flex items-center justify-between border-t border-white/10 pt-3 text-sm">
          <span className="text-white/70">Wides</span>
          <span className="font-semibold">{session.wides}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/70">Outs</span>
          <span className="font-semibold text-red-400">{session.outs}</span>
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        <Link href={player ? `/players/${player.id}` : "/players"}>
          <Button className="w-full">View My Stats</Button>
        </Link>
        <Link href="/session/new">
          <Button variant="secondary" className="w-full">
            Start Another Session
          </Button>
        </Link>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  pct,
  color,
}: Readonly<{
  label: string;
  value: number;
  pct: number;
  color: string;
}>) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/70">{label}</span>
        <span className="font-semibold">
          {value} <span className="text-white/40">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
