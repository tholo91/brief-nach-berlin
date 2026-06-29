"use client";

import { usePathname } from "next/navigation";
import FadeFooterImage from "./FadeFooterImage";

export default function ConditionalFadeFooterImage() {
  const pathname = usePathname();

  if (pathname.startsWith("/kampagne")) return null;

  return <FadeFooterImage variant="content" />;
}
