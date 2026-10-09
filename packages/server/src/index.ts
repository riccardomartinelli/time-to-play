import { createGameServer } from "./server.js";

const port = Number(process.env.SERVER_PORT ?? 3001);
const server = createGameServer({ corsOrigin: process.env.CLIENT_ORIGIN ?? true });

server.listen(port).then((actual) => {
  console.log(`server listening on :${actual}`);
});

// Containers stop with SIGTERM: close sockets and timers instead of being killed.
for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.once(signal, () => {
    console.log(`${signal} received, shutting down`);
    void server.close().then(() => process.exit(0));
  });
}
