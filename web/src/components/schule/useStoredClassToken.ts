"use client";

import { useSyncExternalStore } from "react";
import { CLASS_LINK_CHANGE_EVENT, CLASS_LINK_STORAGE_KEY, readClassLink } from "@/lib/schule/classLinkStorage";

function subscribe(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === CLASS_LINK_STORAGE_KEY) onChange();
  };
  window.addEventListener(CLASS_LINK_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CLASS_LINK_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** Token des im Tab gemerkten Klassenlinks; null auf dem Server und beim ersten Render. */
export function useStoredClassToken(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => readClassLink()?.token ?? null,
    () => null
  );
}
