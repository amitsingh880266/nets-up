"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CreatePlayerForm } from "@/components/player/CreatePlayerForm";
import { storageService } from "@/lib/storage";
import type { Player } from "@/types";

const CURRENT_PLAYER_KEY = "netsup:currentPlayerId";
const ACTIVE_SESSION_KEY = "netsup:activeSessionId";

export function HomeView() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    storageService
      .getPlayers()
      .then((list) => {
        setPlayers(list);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load players. Please refresh the page.");
        setLoading(false);
      });
  }, []);

  const startSessionFor = async (player: Player) => {
    setError(null);
    setStartingId(player.id);
    try {
      const session = await storageService.createSession(
        player.id,
        new Date().toISOString(),
      );
      window.localStorage.setItem(CURRENT_PLAYER_KEY, player.id);
      window.localStorage.setItem(ACTIVE_SESSION_KEY, session.id);
      router.push(`/session/${session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start session.");
      setStartingId(null);
    }
  };

  const createPlayerAndStart = async (username: string) => {
    const player = await storageService.createPlayer(username);
    setPlayers((prev) => [...prev, player]);
    setShowCreate(false);
    await startSessionFor(player);
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-6 py-14 text-white">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-5xl font-black tracking-tight">
          Netsy<span className="text-lime-400">.in</span>
        </h1>
        <p className="text-white/60">Your net. Your balls. Your stats.</p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
          Who&apos;s batting?
        </h2>

        {loading ? (
          <p className="text-sm text-white/40">Loading players…</p>
        ) : null}

        {!loading && players.length === 0 ? (
          <p className="text-sm text-white/40">
            No players yet. Create one below to start your first session.
          </p>
        ) : null}

        <div className="flex flex-col gap-3">
          {players.map((player) => (
            <Card
              key={player.id}
              className="flex items-center justify-between gap-3 p-4"
            >
              <div>
                <p className="font-semibold">{player.username}</p>
                <Link
                  href={`/players/${player.id}`}
                  className="text-xs text-white/40 hover:text-white/70"
                >
                  View stats
                </Link>
              </div>
              <Button
                onClick={() => startSessionFor(player)}
                disabled={startingId !== null}
                className="px-4 py-2 text-sm"
              >
                {startingId === player.id ? "Starting…" : "Start Session"}
              </Button>
            </Card>
          ))}
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        {!showCreate ? (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="min-h-[56px] rounded-2xl border border-dashed border-white/20 text-white/60 hover:border-white/40 hover:text-white"
          >
            + New Player
          </button>
        ) : (
          <Card className="p-5">
            <h3 className="mb-4 text-lg font-semibold">Create your profile</h3>
            <CreatePlayerForm onCreate={createPlayerAndStart} />
          </Card>
        )}
      </div>

      <Link href="/history" className="w-full">
        <Button variant="ghost" className="w-full">
          Session History
        </Button>
      </Link>
    </div>
  );
}
