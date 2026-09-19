"use client";

import { use } from "react";
import { SessionSummary } from "@/components/session/SessionSummary";

export default function SessionSummaryPage(
  props: PageProps<"/session/[id]/summary">,
) {
  const { id } = use(props.params);
  return <SessionSummary sessionId={id} />;
}
