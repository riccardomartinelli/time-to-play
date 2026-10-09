import type { ClientToServerEvents, ServerToClientEvents } from "@ttp/shared";
import { io, type Socket } from "socket.io-client";

export type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/** Same origin: in development Vite proxies /socket.io to the game server. */
export function createSocket(): GameSocket {
  return io({ transports: ["websocket", "polling"] });
}
