import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@ttp/shared";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();
