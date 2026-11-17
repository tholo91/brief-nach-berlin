"use client";

import { useEffect, useState } from "react";
import { BRIEF_EMAIL } from "@/lib/contact";

// Adresse bewusst in Teilen, damit sie nicht als Klartext im statischen HTML
// steht. Sie wird erst im Browser zusammengesetzt, Crawler greifen sie so
// nicht ab.
const [USER, DOMAIN] = BRIEF_EMAIL.split("@");
const SUBJECT = "Presseanfrage: Brief-nach-Berlin";

export function PressContactButton({
  subject = SUBJECT,
  body,
  label = "Presseanfrage senden",
}: {
  subject?: string;
  body?: string;
  label?: string;
} = {}) {
  const [href, setHref] = useState<string | undefined>(undefined);

  useEffect(() => {
    const address = `${USER}@${DOMAIN}`;
    const query = `subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ""}`;
    const id = window.setTimeout(() => {
      setHref(`mailto:${address}?${query}`);
    }, 0);

    return () => window.clearTimeout(id);
  }, [subject, body]);

  return (
    <a
      href={href ?? "#"}
      onClick={(e) => {
        if (!href) e.preventDefault();
      }}
      className="block w-full text-center font-body font-bold text-creme bg-waldgruen-dark hover:bg-waldgruen border-2 border-transparent px-6 py-3 rounded-sm transition-colors"
    >
      {label} &rarr;
    </a>
  );
}
