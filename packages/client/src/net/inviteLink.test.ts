import { describe, expect, it } from "vitest";
import { buildInviteLink, readInviteCode } from "./inviteLink";

describe("invite link", () => {
  it("carries the lobby code", () => {
    const link = buildInviteLink("https://play.example", "KXQR");
    expect(link).toBe("https://play.example/?join=KXQR");
    expect(readInviteCode(new URL(link).search)).toBe("KXQR");
  });

  it("accepts lowercase codes typed by hand", () => {
    expect(readInviteCode("?join=kxqr")).toBe("KXQR");
  });

  it("ignores missing or malformed codes", () => {
    expect(readInviteCode("")).toBeNull();
    expect(readInviteCode("?other=1")).toBeNull();
    expect(readInviteCode("?join=KX1R")).toBeNull();
    expect(readInviteCode("?join=TOOLONG")).toBeNull();
  });
});
