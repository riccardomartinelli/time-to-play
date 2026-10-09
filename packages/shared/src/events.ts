// Socket.IO event contracts shared by client and server.

export interface ServerToClientEvents {
  hello: (payload: { serverTime: number }) => void;
}

export interface ClientToServerEvents {
  ping: (ack: (payload: { serverTime: number }) => void) => void;
}
