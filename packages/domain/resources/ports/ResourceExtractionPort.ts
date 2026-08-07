import type {
  ResourceExtractionRequest,
  ResourceExtractionResult,
} from "../contracts/index.js";

export type ResourceExtractionPort = Readonly<{
  extractResourceContent: (
    input: ResourceExtractionRequest,
  ) => Promise<ResourceExtractionResult>;
}>;