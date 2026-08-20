import { describe, expect, it } from "vitest";
import { can } from "../lib/auth/rbac";

describe("role permissions", () => {
  it("prevents editors from publishing", () => {
    expect(can("EDITOR", "article.publish")).toBe(false);
  });

  it("keeps student submissions away from content roles", () => {
    expect(can("CONTENT_MANAGER", "submission.read")).toBe(false);
  });

  it("allows publishers to review and publish", () => {
    expect(can("PUBLISHER", "article.review")).toBe(true);
    expect(can("PUBLISHER", "article.publish")).toBe(true);
  });
});
