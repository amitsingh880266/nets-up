"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BallActionButton } from "@/components/session/BallActionButton";
import { DeliveryHistoryStrip } from "@/components/session/DeliveryHistoryStrip";
import { FeedbackOverlay } from "@/components/session/FeedbackOverlay";
import { OutTypePrompt } from "@/components/session/OutTypePrompt";
import { Button } from "@/components/ui/Button";
import { useHaptics } from "@/hooks/useHaptics";
import { storageService } from "@/lib/storage";
import { applyDeliveryToSession, formatOvers } from "@/lib/stats/calculations";
import { formatTime } from "@/lib/utils/date";
import type {
  Delivery,
  DeliveryOutcome,
  OutType,
  Player,
  Session,
} from "@/types";

const ACTIVE_SESSION_KEY = "netsup:activeSessionId";

const HAPTIC_PATTERNS: Record<DeliveryOutcome, number | number[]> = {
  played: 15,
  middle: 20,
  edge: 15,
  miss: 10,
  wide: [10, 30, 10],
  out: [40, 60, 40],
};

export function ActiveSession({ sessionId }: Readonly<{ sessionId: string }>) {
  const router = useRouter();
  const { vibrate } = useHaptics();

  const [session, setSession] = useState<Session | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    outcome: DeliveryOutcome;
    key: number;
  } | null>(null);
  const [pendingOut, setPendingOut] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const feedbackCounter = useRef(0);

  useEffect(() => {
    let active = true;
    storageService.getSession(sessionId).then(async (found) => {
      if (!active) return;
      if (!found) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const [p, d] = await Promise.all([
        storageService.getPlayer(found.playerId),
        storageService.getDeliveries(sessionId),
      ]);
      if (!active) return;
      setSession(found);
      setPlayer(p);
      setDeliveries(d);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [sessionId]);

  const handleTap = useCallback(
    async (outcome: DeliveryOutcome) => {
      if (!session || busy) return;
      setBusy(true);
      setError(null);

      const previousSession = session;
      const optimisticSession = applyDeliveryToSession(session, outcome);
      const optimisticDelivery: Delivery = {
        id: `pending-${Date.now()}`,
        sessionId,
        outcome,
        timestamp: new Date().toISOString(),
        ballNumber: outcome === "wide" ? 0 : optimisticSession.legalBalls,
      };

      setSession(optimisticSession);
      setDeliveries((prev) => [...prev, optimisticDelivery]);
      feedbackCounter.current += 1;
      setFeedback({ outcome, key: feedbackCounter.current });
      vibrate(HAPTIC_PATTERNS[outcome]);

      try {
        const { session: confirmedSession, delivery: confirmedDelivery } =
          await storageService.recordDelivery(sessionId, outcome);
        setSession(confirmedSession);
        setDeliveries((prev) =>
          prev.map((d) =>
            d.id === optimisticDelivery.id ? confirmedDelivery : d,
          ),
        );
        if (outcome === "out") {
          setPendingOut(confirmedDelivery.id);
        }
      } catch {
        setError("Could not save that delivery. Please try again.");
        setSession(previousSession);
        setDeliveries((prev) =>
          prev.filter((d) => d.id !== optimisticDelivery.id),
        );
      } finally {
        setBusy(false);
      }
    },
    [session, sessionId, busy, vibrate],
  );

  const handleUndo = useCallback(async () => {
    if (!session || deliveries.length === 0 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await storageService.undoLastDelivery(sessionId);
      const remaining = await storageService.getDeliveries(sessionId);
      setSession(updated);
      setDeliveries(remaining);
      setPendingOut(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nothing to undo.");
    } finally {
      setBusy(false);
    }
  }, [session, deliveries.length, sessionId, busy]);

  const handleSelectOutType = useCallback(
    async (outType: OutType) => {
      if (!pendingOut) return;
      await storageService.setOutType(sessionId, pendingOut, outType);
      setDeliveries((prev) =>
        prev.map((d) => (d.id === pendingOut ? { ...d, outType } : d)),
      );
      setPendingOut(null);
    },
    [pendingOut, sessionId],
  );

  const handleEnd = useCallback(async () => {
    await storageService.endSession(sessionId);
    window.localStorage.removeItem(ACTIVE_SESSION_KEY);
    router.push(`/session/${sessionId}/summary`);
  }, [sessionId, router]);

  if (loading) {
    return (
      <div className="flex-1 px-6 py-12 text-white/50">Loading session…</div>
    );
  }

  if (notFound || !session) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center text-white">
        <p className="text-white/60">Session not found.</p>
        <Link href="/session/new">
          <Button variant="secondary">Start a new session</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 py-8 text-white">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleEnd}
          className="text-sm text-white/50 hover:text-white"
        >
          ← Exit Session
        </button>
        <button
          type="button"
          onClick={handleUndo}
          disabled={deliveries.length === 0 || busy}
          className="text-sm font-medium text-white/70 hover:text-white disabled:opacity-30"
        >
          ↶ Undo
        </button>
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-lime-400">
          {player?.username}
        </p>
        <p className="text-xs text-white/40">
          Session: {formatTime(session.startedAt)}
        </p>
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-7xl font-black tabular-nums">
          {session.totalDeliveries}
        </span>
        <span className="text-xs font-semibold uppercase tracking-widest text-white/40">
          Balls Faced
        </span>
        <span className="mt-1 text-lg font-semibold text-white/70">
          {formatOvers(session.legalBalls)} Overs
        </span>
      </div>

      <BallActionButton
        outcome="played"
        count={session.played}
        onTap={handleTap}
        className="w-full"
      />

      <div className="grid grid-cols-2 gap-3">
        <BallActionButton
          outcome="middle"
          count={session.middle}
          onTap={handleTap}
        />
        <BallActionButton
          outcome="edge"
          count={session.edges}
          onTap={handleTap}
        />
        <BallActionButton
          outcome="miss"
          count={session.misses}
          onTap={handleTap}
        />
        <BallActionButton
          outcome="out"
          count={session.outs}
          onTap={handleTap}
        />
      </div>

      <BallActionButton
        outcome="wide"
        count={session.wides}
        onTap={handleTap}
        className="w-full"
      />

      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
          Last 12 Balls
        </h2>
        <DeliveryHistoryStrip deliveries={deliveries} />
      </div>

      {error ? (
        <p className="text-center text-sm text-red-400">{error}</p>
      ) : null}

      <Button
        onClick={handleEnd}
        variant="secondary"
        className="mt-auto w-full"
      >
        End Session
      </Button>

      <FeedbackOverlay
        outcome={feedback?.outcome ?? null}
        feedbackKey={feedback?.key ?? 0}
      />
      <OutTypePrompt
        deliveryId={pendingOut}
        onSelect={handleSelectOutType}
        onDismiss={() => setPendingOut(null)}
      />
    </div>
  );
}
