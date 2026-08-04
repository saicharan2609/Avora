import type { StructureUnitId } from "@avora/core/identity";

export type StructureTreeNodeContract = Readonly<{
  structureUnitId: StructureUnitId;
  structureTypeLabel: string;
  title: string;
  depth: number;
  children: readonly StructureTreeNodeContract[];
}>;

export type StructureTreeContract = Readonly<{
  nodes: readonly StructureTreeNodeContract[];
}>;