import {
  ContentAddressedEmbeddingPortError,
} from "./ContentAddressedEmbeddingPort.errors.js";
import type { EmbeddingCachePort } from "./EmbeddingCachePort.js";
import type {
  EmbedTextsInput,
  EmbedTextsResult,
  EmbeddedText,
  EmbeddingPort,
  EmbeddingTextInput,
} from "./EmbeddingPort.js";

export type CreateContentAddressedEmbeddingPortInput = Readonly<{
  inner: EmbeddingPort;
  cache: EmbeddingCachePort;
}>;

// Implements AD-30 / ENG-238 / SEC-322: identical chunk text at the same
// embedding strategy version is embedded once, never once per student. This
// wraps any EmbeddingPort with a cache-aside read-through/write-through
// layer keyed by (contentHash, strategyVersion) only, so the cache boundary
// never sees a studentId, resourceId, or chunkId (EmbeddingCachePort.ts).
//
// Cache failures are not swallowed (ENG-253): like every other provider-
// boundary failure in this package, they surface as a typed thrown error
// rather than silently degrading to uncached inference.
export function createContentAddressedEmbeddingPort(
  input: CreateContentAddressedEmbeddingPortInput,
): EmbeddingPort {
  return {
    embedTexts: async (request: EmbedTextsInput): Promise<EmbedTextsResult> => {
      const cacheLookup = await getCachedEmbeddingsOrThrow(input, request);
      const cacheByContentHash = new Map(
        cacheLookup.entries.map((entry) => [entry.contentHash, entry]),
      );

      const cachedEmbeddings: EmbeddedText[] = [];
      const cacheMisses: EmbeddingTextInput[] = [];

      for (const textInput of request.inputs) {
        const cached = cacheByContentHash.get(textInput.contentHash);

        if (cached === undefined) {
          cacheMisses.push(textInput);
          continue;
        }

        cachedEmbeddings.push({
          id: textInput.id,
          vector: cached.vector,
          dimensions: cached.dimensions,
          contentHash: textInput.contentHash,
          embeddingStrategyVersion: request.strategyVersion,
        });
      }

      let freshlyEmbedded: readonly EmbeddedText[] = [];

      if (cacheMisses.length > 0) {
        const innerResult = await input.inner.embedTexts({
          strategyVersion: request.strategyVersion,
          inputs: cacheMisses,
        });

        freshlyEmbedded = innerResult.embeddings;

        await putCachedEmbeddingsOrThrow(input, request, freshlyEmbedded);
      }

      return {
        strategyVersion: request.strategyVersion,
        embeddings: orderEmbeddingsByRequestedInputs(
          request.inputs,
          cachedEmbeddings,
          freshlyEmbedded,
        ),
      };
    },
  };
}

async function getCachedEmbeddingsOrThrow(
  input: CreateContentAddressedEmbeddingPortInput,
  request: EmbedTextsInput,
) {
  try {
    return await input.cache.getCachedEmbeddings({
      keys: request.inputs.map((textInput) => ({
        contentHash: textInput.contentHash,
        embeddingStrategyVersion: request.strategyVersion,
      })),
    });
  } catch (error) {
    throw new ContentAddressedEmbeddingPortError(
      "content_addressed_embedding_port_cache_read_failed",
      "Content-addressed embedding cache read failed.",
      { cause: error },
    );
  }
}

async function putCachedEmbeddingsOrThrow(
  input: CreateContentAddressedEmbeddingPortInput,
  request: EmbedTextsInput,
  freshlyEmbedded: readonly EmbeddedText[],
): Promise<void> {
  try {
    await input.cache.putCachedEmbeddings({
      entries: freshlyEmbedded.map((embedded) => ({
        contentHash: embedded.contentHash,
        embeddingStrategyVersion: request.strategyVersion,
        vector: embedded.vector,
        dimensions: embedded.dimensions,
      })),
    });
  } catch (error) {
    throw new ContentAddressedEmbeddingPortError(
      "content_addressed_embedding_port_cache_write_failed",
      "Content-addressed embedding cache write failed.",
      { cause: error },
    );
  }
}

function orderEmbeddingsByRequestedInputs(
  requestedInputs: EmbedTextsInput["inputs"],
  cachedEmbeddings: readonly EmbeddedText[],
  freshlyEmbedded: readonly EmbeddedText[],
): readonly EmbeddedText[] {
  const embeddingsById = new Map<string, EmbeddedText>();

  for (const embedded of [...cachedEmbeddings, ...freshlyEmbedded]) {
    embeddingsById.set(String(embedded.id), embedded);
  }

  return requestedInputs.map((textInput) => {
    const embedded = embeddingsById.get(String(textInput.id));

    if (embedded === undefined) {
      throw new ContentAddressedEmbeddingPortError(
        "content_addressed_embedding_port_missing_embedding",
        "Content-addressed embedding port produced no embedding for a requested input.",
      );
    }

    return embedded;
  });
}
