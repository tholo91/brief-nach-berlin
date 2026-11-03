"use client";

import { useEffect, useState } from "react";

const TYPEWRITER_TYPE_MS = 42;
const TYPEWRITER_HOLD_MS = 1200;
const TYPEWRITER_DELETE_MS = 24;
const TYPEWRITER_NEXT_MS = 350;

// Placeholder-Beispiele tippen, kurz stehen lassen, wieder löschen, dann das nächste,
// solange `active` gilt (leeres Feld, auch mit Fokus). Bei reduzierter Bewegung tippt nichts.
export function useTypewriterPlaceholder(examples: readonly string[], active: boolean) {
  const [text, setText] = useState("");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!active || reducedMotion) return;

    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const animate = (index: number) => {
      const fullText = examples[index % examples.length] ?? "";
      let visibleCharacters = 0;

      const typeNext = () => {
        if (cancelled) return;
        visibleCharacters += 1;
        setText(fullText.slice(0, visibleCharacters));
        if (visibleCharacters < fullText.length) {
          timeout = setTimeout(typeNext, TYPEWRITER_TYPE_MS);
        } else {
          timeout = setTimeout(deleteNext, TYPEWRITER_HOLD_MS);
        }
      };

      const deleteNext = () => {
        if (cancelled) return;
        visibleCharacters -= 1;
        setText(fullText.slice(0, visibleCharacters));
        if (visibleCharacters > 0) {
          timeout = setTimeout(deleteNext, TYPEWRITER_DELETE_MS);
        } else {
          timeout = setTimeout(() => animate(index + 1), TYPEWRITER_NEXT_MS);
        }
      };

      timeout = setTimeout(() => {
        if (cancelled) return;
        setText("");
        timeout = setTimeout(typeNext, TYPEWRITER_TYPE_MS);
      }, 0);
    };

    animate(0);
    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [active, reducedMotion, examples]);

  return { text, reducedMotion };
}
