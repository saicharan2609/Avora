import type { ReactNode } from "react";

import { webTokens } from "@avora/ui-web/tokens";

export default function CheckEmailPage(): ReactNode {
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
        aria-labelledby="check-email-title"
        style={{
          width: "100%",
          maxWidth: "560px",
          padding: webTokens.space.xl,
          border: `${webTokens.layout.divider} solid ${webTokens.border.subtle}`,
          borderRadius: webTokens.radius.xl,
          background: webTokens.surface.raised,
        }}
      >
        <h1
          id="check-email-title"
          style={{
            margin: 0,
            color: webTokens.text.primary,
            fontSize: webTokens.type.titleMd.size,
            lineHeight: webTokens.type.titleMd.lineHeight,
            fontWeight: webTokens.type.titleMd.weight,
          }}
        >
          Check your email
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
          Avora sent a sign-in link if that address can be used for this environment.
        </p>
      </section>
    </main>
  );
}