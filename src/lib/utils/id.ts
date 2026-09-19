export function createId(prefix: string): string {
  // Fallback only; not used for anything security-sensitive (just a local storage key).
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2); // NOSONAR
  return `${prefix}_${random}`;
}
