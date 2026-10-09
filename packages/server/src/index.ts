import { createServer } from "node:http";
import { Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "@ttp/shared";

const PORT = Number(process.env.SERVER_PORT ?? 3001);

const httpServer = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "text/plain" }).end("ok");
    return;
  }
  res.writeHead(404).end();
});

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: process.env.CLIENT_ORIGIN ?? true },
});

io.on("connection", (socket) => {
  socket.emit("hello", { serverTime: Date.now() });
  socket.on("ping", (ack) => ack({ serverTime: Date.now() }));
});

httpServer.listen(PORT, () => {
  console.log(`server listening on :${PORT}`);
});
