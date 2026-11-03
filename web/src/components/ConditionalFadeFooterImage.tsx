"use client";

import { usePathname } from "next/navigation";
import FadeFooterImage from "./FadeFooterImage";

export default function ConditionalFadeFooterImage() {
  const pathname = usePathname();

  // /schule setzt das Bild selbst hinter die FAQ.
  if (pathname.startsWith("/kampagne") || pathname === "/ngo-briefkampagne" || pathname === "/schule") {
    return null;
  }

  return <FadeFooterImage variant="content" />;
}
