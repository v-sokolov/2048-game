import { newId } from "@/services/engine/id";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("newId", () => {
  it("returns a unique UUID string on every call", () => {
    const ids = Array.from({ length: 100 }, () => newId());
    expect(ids.every((id) => UUID.test(id))).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
