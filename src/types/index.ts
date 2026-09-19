export type DeliveryOutcome =
  | "played"
  | "middle"
  | "edge"
  | "miss"
  | "wide"
  | "out";

export type OutType = "bowled" | "caught" | "lbw" | "runout" | "other";

export interface Player {
  id: string;
  username: string;
  createdAt: string;
}

export interface Session {
  id: string;
  playerId: string;
  startedAt: string;
  endedAt: string | null;
  totalDeliveries: number;
  legalBalls: number;
  played: number;
  middle: number;
  edges: number;
  misses: number;
  wides: number;
  outs: number;
}

export interface Delivery {
  id: string;
  sessionId: string;
  outcome: DeliveryOutcome;
  outType?: OutType;
  timestamp: string;
  ballNumber: number;
}

export interface PlayerStats {
  playerId: string;
  sessions: number;
  ballsPlayed: number;
  legalBalls: number;
  played: number;
  middle: number;
  edges: number;
  misses: number;
  wides: number;
  outs: number;
}
