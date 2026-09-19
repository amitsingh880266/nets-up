import type {
  Delivery,
  DeliveryOutcome,
  OutType,
  Player,
  PlayerStats,
  Session,
} from "@/types";
import { createId } from "@/lib/utils/id";
import {
  applyDeliveryToSession,
  reverseDeliveryFromSession,
} from "@/lib/stats/calculations";
import type { StorageService } from "./types";

const KEYS = {
  players: "netsup:players",
  sessions: "netsup:sessions",
  deliveries: "netsup:deliveries",
} as const;

function readList<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    console.warn(`NetsUp: corrupted data for "${key}", resetting.`);
    return [];
  }
}

function writeList<T>(key: string, value: T[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error("Unable to save data. Your device storage may be full.");
  }
}

class LocalStorageService implements StorageService {
  async createPlayer(username: string): Promise<Player> {
    const trimmed = username.trim();
    if (!trimmed) throw new Error("Enter a username to continue.");

    const players = readList<Player>(KEYS.players);
    const exists = players.some(
      (p) => p.username.toLowerCase() === trimmed.toLowerCase(),
    );
    if (exists) throw new Error("That username is already taken.");

    const player: Player = {
      id: createId("player"),
      username: trimmed,
      createdAt: new Date().toISOString(),
    };
    writeList(KEYS.players, [...players, player]);
    return player;
  }

  async getPlayers(): Promise<Player[]> {
    return readList<Player>(KEYS.players);
  }

  async getPlayer(id: string): Promise<Player | null> {
    return readList<Player>(KEYS.players).find((p) => p.id === id) ?? null;
  }

  async createSession(playerId: string, startedAt: string): Promise<Session> {
    const player = await this.getPlayer(playerId);
    if (!player) throw new Error("Select a valid player before starting.");

    const session: Session = {
      id: createId("session"),
      playerId,
      startedAt,
      endedAt: null,
      totalDeliveries: 0,
      legalBalls: 0,
      played: 0,
      middle: 0,
      edges: 0,
      misses: 0,
      wides: 0,
      outs: 0,
    };
    const sessions = readList<Session>(KEYS.sessions);
    writeList(KEYS.sessions, [...sessions, session]);
    return session;
  }

  async getSession(id: string): Promise<Session | null> {
    return readList<Session>(KEYS.sessions).find((s) => s.id === id) ?? null;
  }

  async getSessions(playerId?: string): Promise<Session[]> {
    const sessions = readList<Session>(KEYS.sessions);
    const filtered = playerId
      ? sessions.filter((s) => s.playerId === playerId)
      : sessions;
    return [...filtered].sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    );
  }

  async endSession(id: string): Promise<Session> {
    const sessions = readList<Session>(KEYS.sessions);
    const index = sessions.findIndex((s) => s.id === id);
    if (index === -1) throw new Error("Session not found.");

    const updated: Session = {
      ...sessions[index],
      endedAt: new Date().toISOString(),
    };
    sessions[index] = updated;
    writeList(KEYS.sessions, sessions);
    return updated;
  }

  async recordDelivery(
    sessionId: string,
    outcome: DeliveryOutcome,
  ): Promise<{ session: Session; delivery: Delivery }> {
    const sessions = readList<Session>(KEYS.sessions);
    const index = sessions.findIndex((s) => s.id === sessionId);
    if (index === -1) throw new Error("Session not found.");

    const deliveries = readList<Delivery>(KEYS.deliveries);
    const legalCount = deliveries.filter(
      (d) => d.sessionId === sessionId && d.outcome !== "wide",
    ).length;

    const delivery: Delivery = {
      id: createId("delivery"),
      sessionId,
      outcome,
      timestamp: new Date().toISOString(),
      ballNumber: outcome === "wide" ? 0 : legalCount + 1,
    };

    const updatedSession = applyDeliveryToSession(sessions[index], outcome);
    sessions[index] = updatedSession;

    writeList(KEYS.sessions, sessions);
    writeList(KEYS.deliveries, [...deliveries, delivery]);

    return { session: updatedSession, delivery };
  }

  async undoLastDelivery(sessionId: string): Promise<Session> {
    const deliveries = readList<Delivery>(KEYS.deliveries);
    const sessionDeliveries = deliveries
      .filter((d) => d.sessionId === sessionId)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
    const last = sessionDeliveries.at(-1);
    if (!last) throw new Error("No deliveries to undo.");

    const sessions = readList<Session>(KEYS.sessions);
    const index = sessions.findIndex((s) => s.id === sessionId);
    if (index === -1) throw new Error("Session not found.");

    const updatedSession = reverseDeliveryFromSession(
      sessions[index],
      last.outcome,
    );
    sessions[index] = updatedSession;

    writeList(KEYS.sessions, sessions);
    writeList(
      KEYS.deliveries,
      deliveries.filter((d) => d.id !== last.id),
    );

    return updatedSession;
  }

  async setOutType(
    sessionId: string,
    deliveryId: string,
    outType: OutType | undefined,
  ): Promise<void> {
    const deliveries = readList<Delivery>(KEYS.deliveries);
    const index = deliveries.findIndex(
      (d) => d.id === deliveryId && d.sessionId === sessionId,
    );
    if (index === -1) return;
    deliveries[index] = { ...deliveries[index], outType };
    writeList(KEYS.deliveries, deliveries);
  }

  async getDeliveries(sessionId: string): Promise<Delivery[]> {
    return readList<Delivery>(KEYS.deliveries)
      .filter((d) => d.sessionId === sessionId)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
  }

  async getPlayerStats(playerId: string): Promise<PlayerStats> {
    const sessions = await this.getSessions(playerId);
    return sessions.reduce<PlayerStats>(
      (acc, s) => ({
        playerId,
        sessions: acc.sessions + 1,
        ballsPlayed: acc.ballsPlayed + s.totalDeliveries,
        legalBalls: acc.legalBalls + s.legalBalls,
        played: acc.played + s.played,
        middle: acc.middle + s.middle,
        edges: acc.edges + s.edges,
        misses: acc.misses + s.misses,
        wides: acc.wides + s.wides,
        outs: acc.outs + s.outs,
      }),
      {
        playerId,
        sessions: 0,
        ballsPlayed: 0,
        legalBalls: 0,
        played: 0,
        middle: 0,
        edges: 0,
        misses: 0,
        wides: 0,
        outs: 0,
      },
    );
  }
}

export const storageService: StorageService = new LocalStorageService();
