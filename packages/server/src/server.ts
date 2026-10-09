import { createServer, type Server as HttpServer } from "node:http";
import type { AddressInfo } from "node:net";
import { mathRandom, type Random } from "@ttp/shared";
import { Server } from "socket.io";
import { cryptoIds, type IdGenerator } from "./lobby/ids.js";
import { LobbyStore } from "./lobby/LobbyStore.js";
import { registerHandlers, type GameIo } from "./net/handlers.js";

export interface GameServerOptions {
  rng?: Random;
  ids?: IdGenerator;
  corsOrigin?: string | boolean;
  log?: (...args: unknown[]) => void;
}

export interface GameServer {
  httpServer: HttpServer;
  io: GameIo;
  store: LobbyStore;
  listen(port: number): Promise<number>;
  close(): Promise<void>;
}

export function createGameServer(options: GameServerOptions = {}): GameServer {
  const httpServer = createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "content-type": "text/plain" }).end("ok");
      return;
    }
    res.writeHead(404).end();
  });

  const io: GameIo = new Server(httpServer, { cors: { origin: options.corsOrigin ?? true } });
  const store = new LobbyStore(options.rng ?? mathRandom, options.ids ?? cryptoIds);
  registerHandlers(io, store, options.log ?? console.error);

  return {
    httpServer,
    io,
    store,
    listen: (port) =>
      new Promise((resolve) => {
        httpServer.listen(port, () => resolve((httpServer.address() as AddressInfo).port));
      }),
    close: () => new Promise((resolve) => io.close(() => resolve())),
  };
}
