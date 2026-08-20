export const capabilities = [
  "article.create",
  "article.review",
  "article.publish",
  "event.manage",
  "homepage.curate",
  "submission.read",
  "submission.export",
  "user.manage",
  "audit.read",
] as const;

export type Capability = (typeof capabilities)[number];
export type Role = "SYSTEM_ADMIN" | "CONTENT_MANAGER" | "EDITOR" | "PUBLISHER" | "FORM_REVIEWER" | "AUDITOR";

const grants: Record<Role, readonly Capability[]> = {
  SYSTEM_ADMIN: capabilities,
  CONTENT_MANAGER: ["article.create", "article.review", "article.publish", "event.manage", "homepage.curate"],
  EDITOR: ["article.create"],
  PUBLISHER: ["article.review", "article.publish"],
  FORM_REVIEWER: ["submission.read", "submission.export"],
  AUDITOR: ["audit.read"],
};

export function can(role: Role, capability: Capability) {
  return grants[role].includes(capability);
}
