import React, { type ReactElement } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ChevronRight } from "lucide-react-native";

import { Text } from "../primitives/Typography";
import { mobileTokens } from "../tokens/index";
import type { StructureTreeContract, StructureTreeNodeContract } from "./StructureTree.contract";
import type { StructureUnitId } from "@avora/core/identity";

type StructureTreeProps = StructureTreeContract & {
  onSelectNode: (structureUnitId: StructureUnitId) => void;
};

const CHEVRON_SIZE_DP = 16;
// Reproduces the reference's `active:scale-[0.985]` press feedback — a
// structural interaction constant, not a themeable design value (same
// precedent as Button.tsx's own PRESSED_SCALE).
const PRESSED_SCALE = 0.985;
const DEPTH_INDENT_DP = parseInt(mobileTokens.space.lg, 10);

/**
 * NN-01: renders whatever depth and labels a student's structure actually
 * has — zero, one, three or five levels, heterogeneous labels across
 * subjects — because every label comes from `structureTypeLabel` on the
 * node itself. Nothing here assumes "Unit"; a subject with zero structure
 * renders an empty `nodes` array, which is a valid, first-class state.
 */
export function StructureTree({ nodes, onSelectNode }: StructureTreeProps): ReactElement {
  return (
    <View>
      {nodes.map((node) => (
        <StructureTreeRow key={node.structureUnitId} node={node} onSelectNode={onSelectNode} />
      ))}
    </View>
  );
}

function StructureTreeRow({
  node,
  onSelectNode,
}: {
  node: StructureTreeNodeContract;
  onSelectNode: (structureUnitId: StructureUnitId) => void;
}): ReactElement {
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        onPress={() => onSelectNode(node.structureUnitId)}
        style={({ pressed }) => [
          styles.row,
          { marginLeft: node.depth * DEPTH_INDENT_DP },
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.textBlock}>
          <Text variant="eyebrow" color="tertiary" style={styles.typeLabel}>
            {node.structureTypeLabel}
          </Text>
          <Text variant="bodyLg" color="primary" numberOfLines={2}>
            {node.title}
          </Text>
        </View>
        <ChevronRight size={CHEVRON_SIZE_DP} color={mobileTokens.text.tertiary} />
      </Pressable>

      {node.children.map((child) => (
        <StructureTreeRow key={child.structureUnitId} node={child} onSelectNode={onSelectNode} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: parseInt(mobileTokens.space.sm, 10),
    borderRadius: parseInt(mobileTokens.radius.lg, 10),
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderColor: mobileTokens.border.subtle,
    backgroundColor: mobileTokens.surface.overlay,
    paddingHorizontal: parseInt(mobileTokens.space.md, 10),
    paddingVertical: parseInt(mobileTokens.space.md, 10),
    marginBottom: parseInt(mobileTokens.space.sm, 10),
  },
  pressed: {
    opacity: parseFloat(mobileTokens.state.mutedOpacity),
    transform: [{ scale: PRESSED_SCALE }],
  },
  textBlock: {
    flex: 1,
  },
  typeLabel: {
    marginBottom: parseInt(mobileTokens.space.xs, 10) / 2,
  },
});
