"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BackLink } from "@/components/ui/BackLink";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { TrendBars } from "@/components/dashboard/TrendBars";
import { storageService } from "@/lib/storage";
import { formatOvers, percentage } from "@/lib/stats/calculations";
import { formatShortDate } from "@/lib/utils/date";
import type { Player, PlayerStats, Session } from "@/types";

export function PlayerDashboard({ playerId }: Readonly<{ playerId: string }>) {
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      storageService.getPlayer(playerId),
      storageService.getPlayerStats(playerId),
      storageService.getSessions(playerId),
    ]).then(([p, s, sess]) => {
      if (!active) return;
      setPlayer(p);
      setStats(s);
      setSessions(sess.filter((session) => session.endedAt));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [playerId]);

  if (loading) {
    return <div className="flex-1 px-6 py-12 text-white/50">Loading…</div>;
  }

  if (!player || !stats) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center text-white">
        <p className="text-white/60">Player not found.</p>
        <Link href="/players">
          <Button variant="secondary">Choose a player</Button>
        </Link>
      </div>
    );
  }

  const playedPct = percentage(stats.played, stats.legalBalls);
  const middlePct = percentage(stats.middle, stats.legalBalls);
  const edgePct = percentage(stats.edges, stats.legalBalls);
  const missPct = percentage(stats.misses, stats.legalBalls);

  const recentSessions = sessions.slice(0, 5);
  const trend = [...sessions]
    .reverse()
    .slice(-8)
    .map((s) => ({
      label: formatShortDate(s.startedAt),
      value: percentage(s.middle, s.legalBalls),
    }));

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-10 text-white">
      <BackLink href="/" label="Home" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Welcome back, {player.username}</h1>
        <Link
          href="/players"
          className="text-xs text-white/40 hover:text-white/70"
        >
          Switch
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Sessions" value={stats.sessions} />
        <StatCard label="Balls Played" value={stats.ballsPlayed} />
        <StatCard label="Overs" value={formatOvers(stats.legalBalls)} />
        <StatCard label="Dismissals" value={stats.outs} accent="text-red-400" />
      </div>

      <Card className="flex flex-col gap-4 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">
          Contact Quality
        </h2>
        <div className="flex flex-col gap-3">
          <StatRow
            label="Played"
            value={stats.played}
            pct={playedPct}
            color="bg-emerald-400"
          />
          <StatRow
            label="Middle"
            value={stats.middle}
            pct={middlePct}
            color="bg-lime-400"
          />
          <StatRow
            label="Edge"
            value={stats.edges}
            pct={edgePct}
            color="bg-amber-400"
          />
          <StatRow
            label="Miss"
            value={stats.misses}
            pct={missPct}
            color="bg-white/40"
          />
        </div>
      </Card>

      {trend.length > 1 ? (
        <Card className="flex flex-col gap-3 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">
            Middle Contact % Trend
          </h2>
          <TrendBars data={trend} />
        </Card>
      ) : null}

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">
          Recent Sessions
        </h2>
        {recentSessions.length === 0 ? (
          <p className="text-sm text-white/40">No completed sessions yet.</p>
        ) : (
          recentSessions.map((session) => (
            <Card
              key={session.id}
              className="flex items-center justify-between p-4"
            >
              <div>
                <p className="font-semibold">
                  {formatShortDate(session.startedAt)}
                </p>
                <p className="text-xs text-white/40">
                  {session.totalDeliveries} balls · {session.middle} Middle ·{" "}
                  {session.edges} Edge · {session.misses} Miss · {session.outs}{" "}
                  Out
                </p>
              </div>
              <Link
                href={`/session/${session.id}/summary`}
                className="text-xs font-medium text-lime-400"
              >
                View
              </Link>
            </Card>
          ))
        )}
      </div>

      <Button onClick={() => router.push("/session/new")} className="w-full">
        Start New Session
      </Button>
    </div>
  );
}

function StatRow({
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
          {value} · {pct}%
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
