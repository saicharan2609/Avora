export type {
  EmbedTextsInput,
  EmbedTextsResult,
  EmbeddedText,
  EmbeddingInputId,
  EmbeddingPort,
  EmbeddingStrategyVersion,
  EmbeddingTextInput,
  EmbeddingVector,
} from "./EmbeddingPort.js";

export type {
  EmbeddingCacheEntry,
  EmbeddingCacheLookupKey,
  EmbeddingCachePort,
  GetCachedEmbeddingsInput,
  GetCachedEmbeddingsResult,
  PutCachedEmbeddingsInput,
} from "./EmbeddingCachePort.js";

export type {
  CreateContentAddressedEmbeddingPortInput,
} from "./ContentAddressedEmbeddingPort.js";
export {
  createContentAddressedEmbeddingPort,
} from "./ContentAddressedEmbeddingPort.js";

export type {
  ContentAddressedEmbeddingPortErrorCode,
} from "./ContentAddressedEmbeddingPort.errors.js";
export {
  ContentAddressedEmbeddingPortError,
} from "./ContentAddressedEmbeddingPort.errors.js";