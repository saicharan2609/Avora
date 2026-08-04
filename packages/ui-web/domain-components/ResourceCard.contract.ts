import type { ResourceId } from "@avora/core/identity";

export type ResourceCardContract = Readonly<{
  resourceId: ResourceId;
  title: string;
  classificationConfidenceRatio: number;
  correctionAction: Readonly<{
    label: string;
    action: string;
  }>;
}>;