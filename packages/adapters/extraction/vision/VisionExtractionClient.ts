import type { ResourceExtractedContentBlockKind } from "@avora/domain/resources";

export type VisionExtractedBlock = Readonly<{
  kind: ResourceExtractedContentBlockKind;
  text: string;
  pageNumber: number;
  confidence?: number;
}>;

export type VisionExtractionClientInput = Readonly<{
  model?: string;
  mimeType: string;
  imageBytesBase64?: string;
  prompt?: string;
}>;

export type VisionExtractionClientResult = Readonly<{
  blocks: readonly VisionExtractedBlock[];
  pageCount: number;
  rawText?: string;
}>;

export type VisionExtractionClient = Readonly<{
  extractVisionContent: (
    input: VisionExtractionClientInput,
  ) => Promise<VisionExtractionClientResult>;
}>;
