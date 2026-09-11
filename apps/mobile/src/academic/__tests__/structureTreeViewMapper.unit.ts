import type { StructureUnitId } from "@avora/core/identity";
import type { AcademicApiStructureUnit, AcademicApiStructureUnitNode, AcademicApiTermStructureTree } from "@avora/core/api/academic";
import type { StructureTreeNodeContract } from "@avora/ui-mobile/domain-components";

import {
  countStructureUnitNodes,
  filterStructureTreeNodesByTitleQuery,
  findActiveTermStructureTree,
  mapStructureUnitNodesToTreeContractNodes,
  structureTypeDisplayLabel,
} from "../structureTreeViewMapper.js";

class StructureTreeViewMapperUnitFailure extends Error {
  public constructor(caseId: string, reason: string) {
    super(`${caseId}: ${reason}`);
    this.name = "StructureTreeViewMapperUnitFailure";
  }
}

function assert(condition: boolean, caseId: string, reason: string): asserts condition {
  if (!condition) {
    throw new StructureTreeViewMapperUnitFailure(caseId, reason);
  }
}

function unit(overrides: Partial<AcademicApiStructureUnit> & Pick<AcademicApiStructureUnit, "structureUnitId" | "title">): AcademicApiStructureUnit {
  return {
    termId: "term-1",
    subjectId: "subject-1",
    parentUnitId: null,
    description: null,
    unitKind: "custom",
    source: "student_declared",
    sortOrder: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function node(unitValue: AcademicApiStructureUnit, children: readonly AcademicApiStructureUnitNode[] = []): AcademicApiStructureUnitNode {
  return { unit: unitValue, children };
}

function runStructureTypeDisplayLabelMapsCustomKindCase(): void {
  const caseId = "structureTypeDisplayLabel maps the onboarding-written 'custom' kind";

  assert(
    structureTypeDisplayLabel("custom") === "Custom",
    caseId,
    `unexpected label: ${structureTypeDisplayLabel("custom")}`,
  );
}

function runMapStructureUnitNodesHandlesZeroStructureCase(): void {
  const caseId = "mapStructureUnitNodesToTreeContractNodes returns an empty tree for a subject with no structure (FR-015)";

  const result = mapStructureUnitNodesToTreeContractNodes([]);

  assert(result.length === 0, caseId, `expected an empty array, got ${result.length} nodes`);
}

function runMapStructureUnitNodesPreservesDepthAndBrandedIdCase(): void {
  const caseId = "mapStructureUnitNodesToTreeContractNodes assigns render depth per level and preserves ids";

  const tree = [
    node(unit({ structureUnitId: "root-1", title: "Root", unitKind: "module" }), [
      node(unit({ structureUnitId: "child-1", title: "Child", unitKind: "topic", parentUnitId: "root-1" })),
    ]),
  ];

  const result = mapStructureUnitNodesToTreeContractNodes(tree);

  assert(result.length === 1, caseId, "expected exactly one root node");
  assert(result[0]?.depth === 0, caseId, "expected the root node at depth 0");
  assert(result[0]?.structureUnitId === ("root-1" as StructureUnitId), caseId, "expected the root id preserved");
  assert(result[0]?.structureTypeLabel === "Module", caseId, "expected the root's unitKind label");
  assert(result[0]?.children.length === 1, caseId, "expected one child node");
  assert(result[0]?.children[0]?.depth === 1, caseId, "expected the child node at depth 1");
  assert(result[0]?.children[0]?.structureTypeLabel === "Topic", caseId, "expected the child's unitKind label");
}

function runCountStructureUnitNodesCountsRecursivelyCase(): void {
  const caseId = "countStructureUnitNodes counts every node across levels, including zero for an empty tree";

  assert(countStructureUnitNodes([]) === 0, caseId, "expected 0 for a subject with no structure");

  const tree = [
    node(unit({ structureUnitId: "root-1", title: "Root" }), [
      node(unit({ structureUnitId: "child-1", title: "Child 1" })),
      node(unit({ structureUnitId: "child-2", title: "Child 2" }), [
        node(unit({ structureUnitId: "grandchild-1", title: "Grandchild" })),
      ]),
    ]),
  ];

  assert(countStructureUnitNodes(tree) === 4, caseId, `expected 4 total nodes, got ${countStructureUnitNodes(tree)}`);
}

function contractNode(overrides: Partial<StructureTreeNodeContract> & Pick<StructureTreeNodeContract, "structureUnitId" | "title">): StructureTreeNodeContract {
  return {
    structureTypeLabel: "Custom",
    depth: 0,
    children: [],
    ...overrides,
  };
}

function runFilterStructureTreeNodesByTitleQueryCase(): void {
  const caseId = "filterStructureTreeNodesByTitleQuery keeps a matching node's full subtree and prunes non-matches";

  const tree: readonly StructureTreeNodeContract[] = [
    contractNode({
      structureUnitId: "root-1" as StructureUnitId,
      title: "Graphs",
      children: [contractNode({ structureUnitId: "child-1" as StructureUnitId, title: "Traversal", depth: 1 })],
    }),
    contractNode({ structureUnitId: "root-2" as StructureUnitId, title: "Sorting" }),
  ];

  const emptyQueryResult = filterStructureTreeNodesByTitleQuery(tree, "");
  assert(emptyQueryResult === tree, caseId, "an empty query must return the tree unfiltered");

  const rootMatch = filterStructureTreeNodesByTitleQuery(tree, "graph");
  assert(rootMatch.length === 1, caseId, "expected only the matching root");
  assert(rootMatch[0]?.children.length === 1, caseId, "a matching root keeps its full subtree unfiltered");

  const descendantMatch = filterStructureTreeNodesByTitleQuery(tree, "traversal");
  assert(descendantMatch.length === 1, caseId, "expected the ancestor of the matching descendant");
  assert(descendantMatch[0]?.children.length === 1, caseId, "expected only the matching descendant to survive");

  const noMatch = filterStructureTreeNodesByTitleQuery(tree, "nonexistent");
  assert(noMatch.length === 0, caseId, "expected no results for a query matching nothing");
}

function termTree(termId: string, lifecycleState: AcademicApiTermStructureTree["term"]["lifecycleState"]): AcademicApiTermStructureTree {
  return {
    term: {
      termId,
      label: `Term ${termId}`,
      institutionName: null,
      programmeName: null,
      branchName: null,
      startsOn: null,
      endsOn: null,
      lifecycleState,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    subjects: [],
  };
}

function runFindActiveTermStructureTreeCase(): void {
  const caseId = "findActiveTermStructureTree prefers an active/planned term, falls back to the first, and handles no terms";

  assert(findActiveTermStructureTree({ terms: [] }) === null, caseId, "expected null for a student with no terms yet");

  const onlyArchived = { terms: [termTree("t1", "archived"), termTree("t2", "completed")] };
  assert(
    findActiveTermStructureTree(onlyArchived)?.term.termId === "t1",
    caseId,
    "expected a fallback to the first term when none are active or planned",
  );

  const withActive = { terms: [termTree("t1", "archived"), termTree("t2", "active")] };
  assert(
    findActiveTermStructureTree(withActive)?.term.termId === "t2",
    caseId,
    "expected the active term to be preferred over an earlier archived one",
  );
}

function main(): void {
  runStructureTypeDisplayLabelMapsCustomKindCase();
  runMapStructureUnitNodesHandlesZeroStructureCase();
  runMapStructureUnitNodesPreservesDepthAndBrandedIdCase();
  runCountStructureUnitNodesCountsRecursivelyCase();
  runFilterStructureTreeNodesByTitleQueryCase();
  runFindActiveTermStructureTreeCase();
}

main();
