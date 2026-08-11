export const retrievalChunkLocatorKinds = [
  "document_page",
  "slide",
  "image_region",
  "audio_time_range",
  "video_time_range",
  "text_span",
  "unknown",
] as const;

export type RetrievalChunkLocatorKind =
  (typeof retrievalChunkLocatorKinds)[number];

export type RetrievalChunkBoundingBox = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
  unit: "ratio" | "point" | "pixel";
}>;

export type RetrievalChunkTextSpan = Readonly<{
  startOffset: number;
  endOffset: number;
}>;

export type RetrievalChunkTimeRange = Readonly<{
  startSeconds: number;
  endSeconds: number;
}>;

export type RetrievalChunkLocator = Readonly<{
  kind: RetrievalChunkLocatorKind;
  pageNumber: number | null;
  slideNumber: number | null;
  boundingBox: RetrievalChunkBoundingBox | null;
  textSpan: RetrievalChunkTextSpan | null;
  timeRange: RetrievalChunkTimeRange | null;
  label: string | null;
}>;