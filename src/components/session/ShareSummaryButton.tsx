"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { generateSessionShareImage } from "@/lib/share/generateSessionImage";
import type { Player, Session } from "@/types";

interface Props {
  session: Session;
  player: Player | null;
}

export function ShareSummaryButton({ session, player }: Readonly<Props>) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShare = async () => {
    setBusy(true);
    setError(null);
    try {
      const blob = await generateSessionShareImage(session, player);
      const fileName = `netsy-session-${session.id}.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      if (
        typeof navigator !== "undefined" &&
        navigator.canShare?.({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: "My Netsy session",
          text: "Check out my cricket net session on Netsy.in",
        });
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError("Could not create the share image. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleShare}
        disabled={busy}
        variant="secondary"
        className="w-full"
      >
        {busy ? "Preparing…" : "📸 Share to Story"}
      </Button>
      {error ? (
        <p className="text-center text-sm text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
