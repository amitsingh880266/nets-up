"use client";

import { useState, type SubmitEvent } from "react";
import { Button } from "@/components/ui/Button";

interface Props {
  onCreate: (username: string) => Promise<void>;
}

export function CreatePlayerForm({ onCreate }: Readonly<Props>) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onCreate(username);
      setUsername("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create player.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label
        htmlFor="new-player-username"
        className="text-xs font-medium uppercase tracking-wider text-white/50"
      >
        Username
      </label>
      <input
        id="new-player-username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        placeholder="e.g. Amit"
        maxLength={24}
        className="min-h-[48px] rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-lg text-white placeholder:text-white/30 focus:border-lime-400 focus:outline-none"
      />
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <Button type="submit" disabled={submitting || !username.trim()}>
        {submitting ? "Creating…" : "Create Profile"}
      </Button>
    </form>
  );
}
