import type { ReactNode } from "react";

import { webTokens } from "@avora/ui-web/tokens";

export default function MarketingPage(): ReactNode {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: webTokens.space.lg,
        background: webTokens.surface.base,
        color: webTokens.text.primary,
      }}
    >
      <section
        aria-labelledby="avora-shell-title"
        style={{
          width: "100%",
          maxWidth: "760px",
          padding: webTokens.space.xl,
          border: `${webTokens.layout.divider} solid ${webTokens.border.subtle}`,
          borderRadius: webTokens.radius.xl,
          background: webTokens.surface.raised,
        }}
      >
        <p
          style={{
            margin: 0,
            color: webTokens.accent.default,
            fontSize: webTokens.type.caption.size,
            lineHeight: webTokens.type.caption.lineHeight,
            fontWeight: webTokens.type.caption.weight,
          }}
        >
          Avora
        </p>
        <h1
          id="avora-shell-title"
          style={{
            marginBlockStart: webTokens.space.sm,
            marginBlockEnd: 0,
            color: webTokens.text.primary,
            fontSize: webTokens.type.titleLg.size,
            lineHeight: webTokens.type.titleLg.lineHeight,
            fontWeight: webTokens.type.titleLg.weight,
          }}
        >
          Bring us your semester. We will make sense of it.
        </h1>
        <p
          style={{
            marginBlockStart: webTokens.space.md,
            marginBlockEnd: 0,
            color: webTokens.text.secondary,
            fontSize: webTokens.type.body.size,
            lineHeight: webTokens.type.body.lineHeight,
            fontWeight: webTokens.type.body.weight,
          }}
        >
          The Avora web composition root is running.
        </p>
      </section>
    </main>
  );
}