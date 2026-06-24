"use client";

import { useEffect, useState } from "react";

// Adresse bewusst in Teilen, damit sie nicht als Klartext im statischen HTML
// steht. Sie wird erst im Browser zusammengesetzt, Crawler greifen sie so
// nicht ab. Entspricht thomas_lorenz@posteo.de.
const USER = "thomas_lorenz";
const DOMAIN = "posteo.de";
const SUBJECT = "Presseanfrage: Brief nach Berlin";

export function PressContactButton() {
  const [href, setHref] = useState<string | undefined>(undefined);

  useEffect(() => {
    const address = `${USER}@${DOMAIN}`;
    setHref(`mailto:${address}?subject=${encodeURIComponent(SUBJECT)}`);
  }, []);

  return (
    <a
      href={href ?? "#"}
      onClick={(e) => {
        if (!href) e.preventDefault();
      }}
      className="block w-full text-center font-body font-bold text-creme bg-waldgruen-dark hover:bg-waldgruen border-2 border-transparent px-6 py-3 rounded-sm transition-colors"
    >
      Presseanfrage senden &rarr;
    </a>
  );
}
