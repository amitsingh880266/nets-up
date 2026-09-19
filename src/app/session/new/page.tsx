"use client";

import { useEffect, useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { BackLink } from "@/components/ui/BackLink";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { storageService } from "@/lib/storage";
import { toDateInputValue, toTimeInputValue } from "@/lib/utils/date";
import type { Player } from "@/types";

const CURRENT_PLAYER_KEY = "netsup:currentPlayerId";
const ACTIVE_SESSION_KEY = "netsup:activeSessionId";

export default function NewSessionPage() {
  const router = useRouter();
  const now = new Date().toISOString();

  const [players, setPlayers] = useState<Player[]>([]);
  const [playerId, setPlayerId] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [date, setDate] = useState(toDateInputValue(now));
  const [time, setTime] = useState(toTimeInputValue(now));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    storageService.getPlayers().then((list) => {
      setPlayers(list);
      const currentId = window.localStorage.getItem(CURRENT_PLAYER_KEY);
      if (currentId && list.some((p) => p.id === currentId)) {
        setPlayerId(currentId);
      } else if (list.length > 0) {
        setPlayerId(list[0].id);
      }
    });
  }, []);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      let resolvedPlayerId = playerId;
      if (!resolvedPlayerId && newUsername.trim()) {
        const player = await storageService.createPlayer(newUsername);
        resolvedPlayerId = player.id;
      }
      if (!resolvedPlayerId) {
        throw new Error("Select or create a player to continue.");
      }

      const startedAt = new Date(`${date}T${time}:00`).toISOString();
      const session = await storageService.createSession(
        resolvedPlayerId,
        startedAt,
      );

      window.localStorage.setItem(CURRENT_PLAYER_KEY, resolvedPlayerId);
      window.localStorage.setItem(ACTIVE_SESSION_KEY, session.id);
      router.push(`/session/${session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start session.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-12 text-white">
      <BackLink href="/" label="Home" />
      <h1 className="text-2xl font-bold">Start New Net Session</h1>

      <Card className="p-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="session-player"
              className="text-xs font-medium uppercase tracking-wider text-white/50"
            >
              Player
            </label>
            {players.length > 0 ? (
              <select
                id="session-player"
                value={playerId}
                onChange={(event) => setPlayerId(event.target.value)}
                className="min-h-[48px] rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white focus:border-lime-400 focus:outline-none"
              >
                {players.map((player) => (
                  <option
                    key={player.id}
                    value={player.id}
                    className="bg-black"
                  >
                    {player.username}
                  </option>
                ))}
              </select>
            ) : null}
            <input
              aria-label="New player username"
              value={newUsername}
              onChange={(event) => {
                setNewUsername(event.target.value);
                setPlayerId("");
              }}
              placeholder={
                players.length > 0
                  ? "Or create a new player"
                  : "Enter your username"
              }
              maxLength={24}
              className="min-h-[48px] rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white placeholder:text-white/30 focus:border-lime-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="session-date"
                className="text-xs font-medium uppercase tracking-wider text-white/50"
              >
                Date
              </label>
              <input
                id="session-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="min-h-[48px] rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-white focus:border-lime-400 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="session-time"
                className="text-xs font-medium uppercase tracking-wider text-white/50"
              >
                Start Time
              </label>
              <input
                id="session-time"
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className="min-h-[48px] rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-white focus:border-lime-400 focus:outline-none"
              />
            </div>
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Starting…" : "Start Session"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
