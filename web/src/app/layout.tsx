import type { Metadata, Viewport } from "next";
import { Courier_Prime, Source_Sans_3, Caveat } from "next/font/google";
import { AnalyticsWrapper } from "@/components/AnalyticsWrapper";
import { APP_URL, FOUNDER_HOMEPAGE, FOUNDER_LINKEDIN } from "@/lib/config";
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

const brandJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${APP_URL}/#organization`,
      name: "Brief nach Berlin",
      url: APP_URL,
      logo: {
        "@type": "ImageObject",
        url: `${APP_URL}/apple-icon.png`,
        width: 180,
        height: 180,
      },
      image: `${APP_URL}/opengraph-image.jpg`,
      description:
        "Brief nach Berlin ist ein kostenloses Tool, das Bürgerinnen und Bürgern hilft, in wenigen Minuten einen persönlichen Brief an ihre Bundestagsabgeordneten zu formulieren.",
      sameAs: ["https://github.com/tholo91/brief-nach-berlin"],
      founder: { "@id": `${APP_URL}/#founder` },
    },
    {
      "@type": "Person",
      "@id": `${APP_URL}/#founder`,
      name: "Thomas Lorenz",
      url: FOUNDER_HOMEPAGE,
      sameAs: [FOUNDER_HOMEPAGE, FOUNDER_LINKEDIN],
    },
    {
      "@type": "WebSite",
      "@id": `${APP_URL}/#website`,
      name: "Brief nach Berlin",
      url: APP_URL,
      publisher: { "@id": `${APP_URL}/#organization` },
      inLanguage: "de-DE",
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "Brief-nach-Berlin | Dein Anliegen an die Politik, in drei Minuten",
  description:
    "Was stört dich? Das Tool findet die zuständigen Abgeordneten und formuliert deinen Brief, der wirklich ankommt. ✉️",
  openGraph: {
    title: "Brief-nach-Berlin | Dein Anliegen an die Politik, in drei Minuten",
    description:
      "Was stört dich? Das Tool findet die zuständigen Abgeordneten und formuliert deinen Brief, der wirklich ankommt. ✉️",
    type: "website",
    locale: "de_DE",
    url: APP_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Brief-nach-Berlin | Dein Anliegen an die Politik, in drei Minuten",
    description:
      "Was stört dich? Das Tool findet die zuständigen Abgeordneten und formuliert deinen Brief, der wirklich ankommt. ✉️",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF8F5",
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
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(brandJsonLd) }}
        />
        {children}
        <AnalyticsWrapper />
      </body>
    </html>
  );
}
