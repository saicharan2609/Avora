import type { Tier2Tokens } from "@avora/design-tokens/tier-2";

import type { PrimitiveIntent } from "./PrimitiveIntent.contract.js";
import type { PrimitiveState } from "./PrimitiveState.contract.js";

export type PrimitiveContract = Readonly<{
  state: PrimitiveState;
  intent: PrimitiveIntent;
  tokenRole: keyof Tier2Tokens;
}>;