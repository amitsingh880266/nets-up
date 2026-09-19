import type { Delivery, DeliveryOutcome, Session } from "@/types";

// Cricket overs use base-6 notation, not decimal division (e.g. 25 balls = "4.1").
export function formatOvers(legalBalls: number): string {
  const completedOvers = Math.floor(legalBalls / 6);
  const remainingBalls = legalBalls % 6;
  return `${completedOvers}.${remainingBalls}`;
}

export function percentage(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}

export function applyDeliveryToSession(
  session: Session,
  outcome: DeliveryOutcome,
): Session {
  const next = { ...session };
  next.totalDeliveries += 1;
  if (outcome !== "wide") next.legalBalls += 1;
  if (outcome === "played") next.played += 1;
  if (outcome === "middle") next.middle += 1;
  if (outcome === "edge") next.edges += 1;
  if (outcome === "miss") next.misses += 1;
  if (outcome === "wide") next.wides += 1;
  if (outcome === "out") next.outs += 1;
  return next;
}

export function reverseDeliveryFromSession(
  session: Session,
  outcome: DeliveryOutcome,
): Session {
  const next = { ...session };
  next.totalDeliveries = Math.max(0, next.totalDeliveries - 1);
  if (outcome !== "wide") next.legalBalls = Math.max(0, next.legalBalls - 1);
  if (outcome === "played") next.played = Math.max(0, next.played - 1);
  if (outcome === "middle") next.middle = Math.max(0, next.middle - 1);
  if (outcome === "edge") next.edges = Math.max(0, next.edges - 1);
  if (outcome === "miss") next.misses = Math.max(0, next.misses - 1);
  if (outcome === "wide") next.wides = Math.max(0, next.wides - 1);
  if (outcome === "out") next.outs = Math.max(0, next.outs - 1);
  return next;
}

export function legalBallNumber(deliveries: Delivery[]): number {
  return deliveries.filter((d) => d.outcome !== "wide").length;
}
