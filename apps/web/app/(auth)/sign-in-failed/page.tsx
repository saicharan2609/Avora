import type { ReactNode } from "react";

import { webTokens } from "@avora/ui-web/tokens";

export default function SignInFailedPage(): ReactNode {
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
        aria-labelledby="sign-in-failed-title"
        style={{
          width: "100%",
          maxWidth: webTokens.layout.containerSm,
          padding: webTokens.space.xl,
          border: `${webTokens.layout.divider} solid ${webTokens.border.subtle}`,
          borderRadius: webTokens.radius.xl,
          background: webTokens.surface.raised,
        }}
      >
        <h1
          id="sign-in-failed-title"
          style={{
            margin: 0,
            color: webTokens.text.primary,
            fontSize: webTokens.type.titleMd.size,
            lineHeight: webTokens.type.titleMd.lineHeight,
            fontWeight: webTokens.type.titleMd.weight,
          }}
        >
          We couldn't sign you in
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
          That sign-in link may have expired or already been used. Please try again.
        </p>
        <a
          href="/"
          style={{
            display: "inline-block",
            marginBlockStart: webTokens.space.lg,
            color: webTokens.accent.default,
            fontSize: webTokens.type.body.size,
            lineHeight: webTokens.type.body.lineHeight,
            fontWeight: webTokens.type.body.weight,
          }}
        >
          Try again
        </a>
      </section>
    </main>
  );
}
