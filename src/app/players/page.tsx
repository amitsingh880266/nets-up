"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BackLink } from "@/components/ui/BackLink";
import { Card } from "@/components/ui/Card";
import { CreatePlayerForm } from "@/components/player/CreatePlayerForm";
import { PlayerListItem } from "@/components/player/PlayerListItem";
import { storageService } from "@/lib/storage";
import type { Player } from "@/types";

const CURRENT_PLAYER_KEY = "netsup:currentPlayerId";

export default function PlayersPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    storageService.getPlayers().then((list) => {
      setPlayers(list);
      setLoading(false);
      setShowCreate(list.length === 0);
    });
  }, []);

  const selectPlayer = (player: Player) => {
    window.localStorage.setItem(CURRENT_PLAYER_KEY, player.id);
    router.push(`/players/${player.id}`);
  };

  const createPlayer = async (username: string) => {
    const player = await storageService.createPlayer(username);
    setPlayers((prev) => [...prev, player]);
    window.localStorage.setItem(CURRENT_PLAYER_KEY, player.id);
    router.push(`/players/${player.id}`);
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-12 text-white">
      <BackLink href="/" label="Home" />
      <h1 className="text-2xl font-bold">Who&apos;s batting?</h1>

      {!loading && players.length > 0 ? (
        <div className="flex flex-col gap-3">
          {players.map((player) => (
            <PlayerListItem
              key={player.id}
              player={player}
              onSelect={selectPlayer}
            />
          ))}
        </div>
      ) : null}

      {!loading && !showCreate ? (
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="min-h-[56px] rounded-2xl border border-dashed border-white/20 text-white/60 hover:border-white/40 hover:text-white"
        >
          + Create New Player
        </button>
      ) : null}

      {showCreate ? (
        <Card className="p-5">
          <h2 className="mb-4 text-lg font-semibold">Create your profile</h2>
          <CreatePlayerForm onCreate={createPlayer} />
        </Card>
      ) : null}
    </div>
  );
}
