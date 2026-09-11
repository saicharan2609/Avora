import React, { type ReactElement } from "react";
import { StyleSheet, View } from "react-native";

import type { ChunkId } from "@avora/core/identity";

import { Text } from "../primitives/Typography";
import { mobileTokens } from "../tokens/index";
import { AIGeneratedBadge } from "./AIGeneratedBadge";
import { CitationChip } from "./CitationChip";
import type { ResourceSummaryCardContract } from "./ResourceSummaryCard.contract";

type ResourceSummaryCardProps = ResourceSummaryCardContract & {
  resourceTitle: string;
  onOpenCitation: (chunkId: ChunkId) => void;
};

/**
 * NN-08 + NN-11 together: the badge is mandatory on every AI-generated
 * summary, and every citation renders as a resolved `CitationChip` — this
 * component has no code path that can print a citation as a bare string.
 */
export function ResourceSummaryCard({
  resourceId,
  provenance,
  headings,
  citations,
  resourceTitle,
  onOpenCitation,
}: ResourceSummaryCardProps): ReactElement {
  return (
    <View style={styles.card}>
      <AIGeneratedBadge provenance={provenance} />

      <View style={styles.headings}>
        {headings.map((heading, index) => (
          <View key={index} style={styles.heading}>
            <Text variant="titleSm" color="primary">
              {heading.title}
            </Text>
            {heading.points.map((point, pointIndex) => (
              <View key={pointIndex} style={styles.pointRow}>
                <View style={styles.bullet} />
                <Text variant="body" color="secondary" style={styles.pointText}>
                  {point}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      {citations.length > 0 ? (
        <View style={styles.citations}>
          {citations.map((citation) => (
            <CitationChip
              key={citation.citationId}
              citation={{ ...citation, resourceId }}
              resourceTitle={resourceTitle}
              onPress={() => onOpenCitation(citation.chunkId)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: parseInt(mobileTokens.space.md, 10),
    borderRadius: parseInt(mobileTokens.radius.xl, 10),
    borderWidth: parseInt(mobileTokens.layout.divider, 10),
    borderColor: mobileTokens.border.subtle,
    backgroundColor: mobileTokens.surface.raised,
    padding: parseInt(mobileTokens.space.lg, 10),
  },
  headings: {
    gap: parseInt(mobileTokens.space.md, 10),
  },
  heading: {
    gap: parseInt(mobileTokens.space.xs, 10),
  },
  pointRow: {
    flexDirection: "row",
    gap: parseInt(mobileTokens.space.sm, 10),
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: mobileTokens.text.tertiary,
    marginTop: parseInt(mobileTokens.type.body.lineHeight, 10) / 2 - 2,
  },
  pointText: {
    flex: 1,
  },
  citations: {
    gap: parseInt(mobileTokens.space.sm, 10),
  },
});
