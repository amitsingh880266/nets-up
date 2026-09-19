import type {
  Delivery,
  DeliveryOutcome,
  OutType,
  Player,
  PlayerStats,
  Session,
} from "@/types";

// Abstraction so the app can later swap localStorage for Supabase without touching UI code.
export interface StorageService {
  createPlayer(username: string): Promise<Player>;
  getPlayers(): Promise<Player[]>;
  getPlayer(id: string): Promise<Player | null>;

  createSession(playerId: string, startedAt: string): Promise<Session>;
  getSession(id: string): Promise<Session | null>;
  getSessions(playerId?: string): Promise<Session[]>;
  endSession(id: string): Promise<Session>;

  recordDelivery(
    sessionId: string,
    outcome: DeliveryOutcome,
  ): Promise<{ session: Session; delivery: Delivery }>;
  undoLastDelivery(sessionId: string): Promise<Session>;
  setOutType(
    sessionId: string,
    deliveryId: string,
    outType: OutType | undefined,
  ): Promise<void>;
  getDeliveries(sessionId: string): Promise<Delivery[]>;

  getPlayerStats(playerId: string): Promise<PlayerStats>;
}
