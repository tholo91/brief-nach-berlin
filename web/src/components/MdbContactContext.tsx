"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { MdbContact } from "@/lib/lookup/mdbContact";

export interface MdbLookupResult {
  plz: string;
  contacts: MdbContact[];
}

interface MdbContactContextValue {
  result: MdbLookupResult | null;
  setResult: (result: MdbLookupResult | null) => void;
}

const MdbContactContext = createContext<MdbContactContextValue | null>(null);

export function MdbContactProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<MdbLookupResult | null>(null);
  const value = useMemo(() => ({ result, setResult }), [result]);
  return <MdbContactContext.Provider value={value}>{children}</MdbContactContext.Provider>;
}

export function useMdbContactContext() {
  return useContext(MdbContactContext);
}
