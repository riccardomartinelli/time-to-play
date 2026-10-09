import { randomBytes, randomUUID } from "node:crypto";

export interface IdGenerator {
  playerId(): string;
  secret(): string;
}

export const cryptoIds: IdGenerator = {
  playerId: () => randomUUID(),
  secret: () => randomBytes(18).toString("base64url"),
};
