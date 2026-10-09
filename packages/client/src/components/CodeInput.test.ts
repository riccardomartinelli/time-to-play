import { describe, expect, it } from "vitest";
import { sanitizeCode } from "./sanitizeCode";

describe("sanitizeCode", () => {
  it("keeps the first 4 letters, uppercase", () => {
    expect(sanitizeCode("kx1qrz")).toBe("KXQR");
    expect(sanitizeCode(" k x q r ")).toBe("KXQR");
    expect(sanitizeCode("12")).toBe("");
  });
});
