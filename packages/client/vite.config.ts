import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// host: true exposes the dev server on the LAN so phones in the same room can join.
// /socket.io is proxied to the game server so the client only needs one origin.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/socket.io": { target: "http://localhost:3001", ws: true },
    },
  },
});
