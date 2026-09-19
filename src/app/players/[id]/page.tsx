"use client";

import { use } from "react";
import { PlayerDashboard } from "@/components/dashboard/PlayerDashboard";

export default function PlayerPage(props: PageProps<"/players/[id]">) {
  const { id } = use(props.params);
  return <PlayerDashboard playerId={id} />;
}
