import type { StructureUnitId } from "@avora/core/identity";
import type {
  AcademicApiStructureTree,
  AcademicApiStructureUnitKind,
  AcademicApiStructureUnitNode,
  AcademicApiTermStructureTree,
} from "@avora/core/api/academic";
import type { StructureTreeNodeContract } from "@avora/ui-mobile/domain-components";

/**
 * Display words for each `unitKind` the academic API can return (NN-01:
 * every label the student sees is derived from the structure data itself —
 * never a hard-coded "Unit" and never assumed by a prompt, schema or fixed
 * level name). Onboarding's structure step
 * (`apps/mobile/app/(onboarding)/structure.tsx`) writes every unit with
 * `unitKind: "custom"` today, so a subject whose units are all "Custom" is
 * the expected common case here, not a fallback path.
 */
const STRUCTURE_UNIT_KIND_DISPLAY_LABEL: Record<AcademicApiStructureUnitKind, string> = {
  module: "Module",
  topic: "Topic",
  week: "Week",
  lecture: "Lecture",
  assignment_group: "Assignment group",
  exam_area: "Exam area",
  custom: "Custom",
};

export function structureTypeDisplayLabel(unitKind: AcademicApiStructureUnitKind): string {
  return STRUCTURE_UNIT_KIND_DISPLAY_LABEL[unitKind];
}

/**
 * Maps the academic API's raw tree shape (`{ unit, children }`, plain
 * string ids) onto the `StructureTree` domain component's contract
 * (`packages/ui-mobile/domain-components/StructureTree.contract.ts`):
 * branded ids, a `structureTypeLabel` word, and an explicit render `depth`.
 * This is the one place on this screen a raw string is asserted as a
 * `StructureUnitId` — the identifier itself is unchanged, matching the cast
 * pattern used at other API/repository boundary mappers (for example
 * `packages/db/repositories/academic/mapper.ts`).
 */
export function mapStructureUnitNodesToTreeContractNodes(
  nodes: readonly AcademicApiStructureUnitNode[],
  depth = 0,
): readonly StructureTreeNodeContract[] {
  return nodes.map((node) => ({
    structureUnitId: node.unit.structureUnitId as StructureUnitId,
    structureTypeLabel: structureTypeDisplayLabel(node.unit.unitKind),
    title: node.unit.title,
    depth,
    children: mapStructureUnitNodesToTreeContractNodes(node.children, depth + 1),
  }));
}

export function countStructureUnitNodes(nodes: readonly AcademicApiStructureUnitNode[]): number {
  return nodes.reduce(
    (total, node) => total + 1 + countStructureUnitNodes(node.children),
    0,
  );
}

/**
 * A real, working filter over the real structure-unit titles the subject
 * already has — never a search over fabricated note content. A node whose
 * own title matches keeps its full, unfiltered subtree (matching the
 * reference's whole-node search results); a node that only has a matching
 * descendant keeps just that descendant.
 */
export function filterStructureTreeNodesByTitleQuery(
  nodes: readonly StructureTreeNodeContract[],
  query: string,
): readonly StructureTreeNodeContract[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.length === 0) {
    return nodes;
  }

  const filtered: StructureTreeNodeContract[] = [];

  for (const node of nodes) {
    if (node.title.toLowerCase().includes(normalizedQuery)) {
      filtered.push(node);
      continue;
    }

    const filteredChildren = filterStructureTreeNodesByTitleQuery(node.children, normalizedQuery);

    if (filteredChildren.length > 0) {
      filtered.push({ ...node, children: filteredChildren });
    }
  }

  return filtered;
}

/**
 * Mirrors `AcademicSetupService.readProgress`'s own definition of "active"
 * (`planned` or `active` lifecycle state, packages/domain/academic/services/
 * AcademicSetupService.ts) rather than inventing a second one for this
 * screen. Falls back to the first term so a tree with only completed or
 * archived terms still shows something instead of silently rendering empty.
 */
export function findActiveTermStructureTree(
  tree: AcademicApiStructureTree,
): AcademicApiTermStructureTree | null {
  const activeTerm = tree.terms.find(
    (termTree) => termTree.term.lifecycleState === "active" || termTree.term.lifecycleState === "planned",
  );

  return activeTerm ?? tree.terms[0] ?? null;
}
