// Socket.IO event contracts shared by client and server. See docs/architecture.md.

import type { ErrorCode } from "./errors.js";
import type { GameSettings } from "./rules.js";
import type { LobbySnapshot, Session } from "./state.js";

export type Result<T extends object = object> =
  ({ ok: true } & T) | { ok: false; error: ErrorCode };

export type Ack<T extends object = object> = (result: Result<T>) => void;

export interface ServerToClientEvents {
  state: (snapshot: LobbySnapshot) => void;
}

export interface ClientToServerEvents {
  "time:sync": (ack: (payload: { serverTime: number }) => void) => void;
  "lobby:create": (payload: { nickname: string }, ack: Ack<{ session: Session }>) => void;
  "lobby:join": (
    payload: { code: string; nickname: string },
    ack: Ack<{ session: Session }>,
  ) => void;
  "session:resume": (payload: Session, ack: Ack) => void;
  "lobby:leave": (ack: Ack) => void;
  "lobby:settings": (payload: GameSettings, ack: Ack) => void;
  "game:start": (ack: Ack) => void;
}
