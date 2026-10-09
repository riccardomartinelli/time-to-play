import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import type { ClientState, GameClient } from "./GameClient";

const GameClientContext = createContext<GameClient | null>(null);

export function GameClientProvider({
  client,
  children,
}: {
  client: GameClient;
  children: ReactNode;
}) {
  return <GameClientContext.Provider value={client}>{children}</GameClientContext.Provider>;
}

export function useGameClient(): GameClient {
  const client = useContext(GameClientContext);
  if (!client) throw new Error("useGameClient outside GameClientProvider");
  return client;
}

export function useClientState(): ClientState {
  const client = useGameClient();
  return useSyncExternalStore(client.subscribe, client.getState);
}
