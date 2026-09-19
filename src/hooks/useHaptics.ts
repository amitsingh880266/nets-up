"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "netsup:hapticEnabled";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) !== "false";
}

function getServerSnapshot() {
  return true;
}

export function useHaptics() {
  const enabled = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const toggle = useCallback((value: boolean) => {
    window.localStorage.setItem(STORAGE_KEY, String(value));
    window.dispatchEvent(new StorageEvent("storage"));
  }, []);

  const vibrate = useCallback(
    (pattern: number | number[]) => {
      if (!enabled) return;
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(pattern);
      }
    },
    [enabled],
  );

  return { enabled, toggle, vibrate };
}
