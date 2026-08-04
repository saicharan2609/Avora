import type { Metadata } from "next";
import type { ReactNode } from "react";

import { webTokens } from "@avora/ui-web/tokens";

export const metadata: Metadata = {
  title: "Avora",
  description: "Bring us your semester. We will make sense of it.",
  applicationName: "Avora",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps): ReactNode {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: webTokens.surface.base,
          color: webTokens.text.primary,
          fontFamily: webTokens.type.body.family,
        }}
      >
        {children}
      </body>
    </html>
  );
}