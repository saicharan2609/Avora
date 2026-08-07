export const resourceSourceLocatorKinds = [
  "document_page",
  "slide",
  "image_region",
  "audio_time_range",
  "video_time_range",
  "text_span",
  "unknown",
] as const;

export type ResourceSourceLocatorKind =
  (typeof resourceSourceLocatorKinds)[number];

export type ResourceBoundingBox = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
  unit: "ratio" | "point" | "pixel";
}>;

export type ResourceTextSpan = Readonly<{
  startOffset: number;
  endOffset: number;
}>;

export type ResourceTimeRange = Readonly<{
  startSeconds: number;
  endSeconds: number;
}>;

export type ResourceSourceLocator = Readonly<{
  kind: ResourceSourceLocatorKind;
  pageNumber: number | null;
  slideNumber: number | null;
  boundingBox: ResourceBoundingBox | null;
  textSpan: ResourceTextSpan | null;
  timeRange: ResourceTimeRange | null;
  label: string | null;
}>;