import { useEffect, useState } from "react";
import { useGameClient } from "../state/GameClientContext";

/** Milliseconds left until `endsAt` (server time), refreshed several times per second. */
export function useRemaining(endsAt: number | null, refreshMs = 100): number | null {
  const client = useGameClient();
  const [now, setNow] = useState(() => client.serverNow());

  useEffect(() => {
    if (endsAt === null) return;
    const timer = setInterval(() => setNow(client.serverNow()), refreshMs);
    return () => clearInterval(timer);
  }, [client, endsAt, refreshMs]);

  return endsAt === null ? null : Math.max(0, endsAt - now);
}
