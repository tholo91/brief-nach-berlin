import type { Metadata } from "next";
import { Courier_Prime, Source_Sans_3, Caveat } from "next/font/google";
import "./globals.css";

const courierPrime = Courier_Prime({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-courier-prime",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://brief-nach-berlin.de"),
  title: "Brief-nach-Berlin | Dein Anliegen an die Politik, in drei Minuten",
  description:
    "Was stört dich? Wir finden die zuständigen Abgeordneten und formulieren deinen Brief, damit dein Anliegen dort ankommt, wo es hingehört.",
  openGraph: {
    title: "Brief-nach-Berlin | Dein Anliegen an die Politik, in drei Minuten",
    description:
      "Was stört dich? Wir finden die zuständigen Abgeordneten und formulieren deinen Brief, damit dein Anliegen dort ankommt, wo es hingehört.",
    type: "website",
    locale: "de_DE",
    url: "https://brief-nach-berlin.de",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brief-nach-Berlin | Dein Anliegen an die Politik, in drei Minuten",
    description:
      "Was stört dich? Wir finden die zuständigen Abgeordneten und formulieren deinen Brief, damit dein Anliegen dort ankommt, wo es hingehört.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${courierPrime.variable} ${sourceSans.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
