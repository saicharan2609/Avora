import type { Provenance } from "@avora/core/domain-types";

export type AIGeneratedBadgeContract = Readonly<{
  provenance: Extract<Provenance, "ai">;
}>;