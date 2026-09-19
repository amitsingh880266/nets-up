import type { Player } from "@/types";

interface Props {
  player: Player;
  onSelect: (player: Player) => void;
}

export function PlayerListItem({ player, onSelect }: Readonly<Props>) {
  return (
    <button
      type="button"
      onClick={() => onSelect(player)}
      className="flex min-h-[56px] w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-left text-lg font-semibold text-white transition-colors hover:bg-white/[0.08]"
    >
      {player.username}
      <span className="text-white/30">→</span>
    </button>
  );
}
