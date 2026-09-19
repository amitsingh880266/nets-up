"use client";

import { use } from "react";
import { ActiveSession } from "@/components/session/ActiveSession";

export default function SessionPage(props: PageProps<"/session/[id]">) {
  const { id } = use(props.params);
  return <ActiveSession sessionId={id} />;
}
