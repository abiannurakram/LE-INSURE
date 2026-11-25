/**
 * Le-Insure · layout.tsx
 * Root layout: fonts, page metadata and the <html>/<body> shell.
 *
 * Fonts (Brand Guideline v1.0 · Typography System):
 *   Space Grotesk → display and headings  (--font-space-grotesk)
 *   Inter         → body, UI and forms    (--font-inter)
 * globals.css reads these variables in --display and --body.
 * The logo is vector artwork (see IconSprite in page.tsx), so no logo font is loaded.
 *
 * Favicon: app/icon.svg is the official Compact Mark.
 */
import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Le-Insure · Digital Protection",
  description:
    "Le-Insure: Digital Protection for Your Rights & Legacy. Legal cost protection, partner advocates, a secure document vault and legacy planning in one flow.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7EFE6" },
    { media: "(prefers-color-scheme: dark)", color: "#24090F" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // app.js changes lang (EN/ID), data-theme and a few classes on <html>
    // after load, so React should not warn about those differences.
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
