import type {
  EmbedTextsInput,
  EmbedTextsResult,
  EmbeddedText,
  EmbeddingPort,
} from "../../embeddings/index.js";
import {
  authorizeAiProviderInvocation,
} from "../../gateway/budget-gate/index.js";
import type {
  AiProviderInvocationGateState,
} from "../../gateway/budget-gate/index.js";

import {
  GeminiEmbeddingAdapterError,
} from "./GeminiEmbeddingAdapter.errors.js";
import type {
  GeminiEmbeddingClient,
} from "./GeminiEmbeddingClient.js";
import {
  geminiEmbeddingModelId,
  geminiEmbeddingOutputDimensions,
  geminiEmbeddingStrategyVersion,
} from "./GeminiEmbeddingModel.js";

export type CreateGeminiEmbeddingPortInput = Readonly<{
  client: GeminiEmbeddingClient;
  invocationGateState: AiProviderInvocationGateState | undefined;
}>;

export function createGeminiEmbeddingPort(
  input: CreateGeminiEmbeddingPortInput,
): EmbeddingPort {
  return {
    embedTexts: async (request: EmbedTextsInput): Promise<EmbedTextsResult> => {
      const invocationAuthorization = authorizeAiProviderInvocation({
        state: input.invocationGateState,
      });

      if (!invocationAuthorization.authorized) {
        throw new GeminiEmbeddingAdapterError(
          "gemini_embedding_adapter_invocation_not_authorized",
          invocationAuthorization.message,
        );
      }

      assertValidEmbedTextsRequest(request);

      let providerResult;

      try {
        providerResult = await input.client.embedContent({
          model: geminiEmbeddingModelId,
          contents: request.inputs.map((textInput) => textInput.text),
          outputDimensionality: geminiEmbeddingOutputDimensions,
        });
      } catch (error) {
        throw new GeminiEmbeddingAdapterError(
          "gemini_embedding_adapter_provider_call_failed",
          "Gemini embedding provider call failed.",
          { cause: error },
        );
      }

      if (providerResult.embeddings.length !== request.inputs.length) {
        throw new GeminiEmbeddingAdapterError(
          "gemini_embedding_adapter_result_count_mismatch",
          "Gemini embedding result count did not match the requested input count.",
        );
      }

      const embeddings = request.inputs.map(
        (textInput, index): EmbeddedText => {
          const values = providerResult.embeddings[index]?.values;

          if (values === undefined || values.length === 0) {
            throw new GeminiEmbeddingAdapterError(
              "gemini_embedding_adapter_missing_vector",
              "Gemini embedding provider returned no vector for a requested input.",
            );
          }

          return {
            id: textInput.id,
            vector: values,
            dimensions: values.length,
            contentHash: textInput.contentHash,
            embeddingStrategyVersion: geminiEmbeddingStrategyVersion,
          };
        },
      );

      return {
        strategyVersion: geminiEmbeddingStrategyVersion,
        embeddings,
      };
    },
  };
}

function assertValidEmbedTextsRequest(request: EmbedTextsInput): void {
  if (request.inputs.length === 0) {
    throw new GeminiEmbeddingAdapterError(
      "gemini_embedding_adapter_empty_input",
      "Gemini embedding adapter requires at least one text input.",
    );
  }

  if (request.strategyVersion !== geminiEmbeddingStrategyVersion) {
    throw new GeminiEmbeddingAdapterError(
      "gemini_embedding_adapter_unsupported_strategy_version",
      `Gemini embedding adapter only supports strategy version "${geminiEmbeddingStrategyVersion}".`,
    );
  }
}
