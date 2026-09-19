"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BackLink } from "@/components/ui/BackLink";
import { Card } from "@/components/ui/Card";
import { storageService } from "@/lib/storage";
import { formatDate, formatTime } from "@/lib/utils/date";
import type { Player, Session } from "@/types";

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      storageService.getSessions(),
      storageService.getPlayers(),
    ]).then(([sessionList, playerList]) => {
      setSessions(sessionList.filter((s) => s.endedAt));
      setPlayers(Object.fromEntries(playerList.map((p) => [p.id, p])));
      setLoading(false);
    });
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-12 text-white">
      <BackLink href="/" label="Home" />
      <h1 className="text-2xl font-bold">Session History</h1>

      {!loading && sessions.length === 0 ? (
        <p className="text-white/50">No completed sessions yet.</p>
      ) : null}

      <div className="flex flex-col gap-3">
        {sessions.map((session) => (
          <Link key={session.id} href={`/session/${session.id}/summary`}>
            <Card className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold">
                  {players[session.playerId]?.username ?? "Unknown"}
                </p>
                <p className="text-xs text-white/40">
                  {formatDate(session.startedAt)} ·{" "}
                  {formatTime(session.startedAt)}
                </p>
                <p className="mt-1 text-xs text-white/50">
                  {session.totalDeliveries} balls · {session.middle} Middle ·{" "}
                  {session.edges} Edge · {session.misses} Miss · {session.outs}{" "}
                  Out
                </p>
              </div>
              <span className="text-white/30">→</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
