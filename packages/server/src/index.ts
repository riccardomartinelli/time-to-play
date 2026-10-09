import { createGameServer } from "./server.js";

const port = Number(process.env.SERVER_PORT ?? 3001);
const server = createGameServer({ corsOrigin: process.env.CLIENT_ORIGIN ?? true });

server.listen(port).then((actual) => {
  console.log(`server listening on :${actual}`);
});
