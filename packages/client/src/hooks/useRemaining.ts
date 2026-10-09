import { useEffect, useState } from "react";
import { useGameClient } from "../state/GameClientContext";

/** Milliseconds left until `endsAt` (server time), refreshed several times per second. */
export function useRemaining(endsAt: number | null, refreshMs = 100): number | null {
  const client = useGameClient();
  const [now, setNow] = useState(() => client.serverNow());

  useEffect(() => {
    if (endsAt === null) return;
    const refresh = () => setNow(client.serverNow());
    // Refresh right away: the time saved before the phase changed is stale.
    const first = requestAnimationFrame(refresh);
    const timer = setInterval(refresh, refreshMs);
    return () => {
      cancelAnimationFrame(first);
      clearInterval(timer);
    };
  }, [client, endsAt, refreshMs]);

  return endsAt === null ? null : Math.max(0, endsAt - now);
}
