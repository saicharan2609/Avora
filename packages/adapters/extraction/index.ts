import type {
  ExtractionPort,
  ResourceExtractionRequest,
  ResourceExtractionResult,
} from "@avora/domain/resources";

export type DocumentExtractionProvider = Readonly<{
  extractDocumentResource: (
    input: ResourceExtractionRequest,
  ) => Promise<ResourceExtractionResult>;
}>;

export type ScanExtractionProvider = Readonly<{
  extractScanResource: (
    input: ResourceExtractionRequest,
  ) => Promise<ResourceExtractionResult>;
}>;

export type HandwritingExtractionProvider = Readonly<{
  extractHandwritingResource: (
    input: ResourceExtractionRequest,
  ) => Promise<ResourceExtractionResult>;
}>;

export type CreateDocumentExtractionAdapterInput = Readonly<{
  provider: DocumentExtractionProvider;
}>;

export type CreateScanExtractionAdapterInput = Readonly<{
  provider: ScanExtractionProvider;
}>;

export type CreateHandwritingExtractionAdapterInput = Readonly<{
  provider: HandwritingExtractionProvider;
}>;

export function createDocumentExtractionAdapter(
  input: CreateDocumentExtractionAdapterInput,
): ExtractionPort {
  return {
    extractResourceContent: (request) => (
      input.provider.extractDocumentResource(request)
    ),
  };
}

export function createScanExtractionAdapter(
  input: CreateScanExtractionAdapterInput,
): ExtractionPort {
  return {
    extractResourceContent: (request) => (
      input.provider.extractScanResource(request)
    ),
  };
}

export function createHandwritingExtractionAdapter(
  input: CreateHandwritingExtractionAdapterInput,
): ExtractionPort {
  return {
    extractResourceContent: (request) => (
      input.provider.extractHandwritingResource(request)
    ),
  };
}