export type MdbContactQuery =
  | { type: "plz"; plz: string }
  | { type: "mdb"; mdbId: number; plz?: string }
  | null;

export function resolveMdbContactQuery(search: string): MdbContactQuery {
  const params = new URLSearchParams(search);
  const rawPlz = params.get("plz");
  const plz = rawPlz && /^\d{5}$/.test(rawPlz) ? rawPlz : undefined;

  const mdb = params.get("mdb");
  if (mdb && /^\d+$/.test(mdb)) {
    const mdbId = Number(mdb);
    if (Number.isSafeInteger(mdbId) && mdbId > 0) {
      return { type: "mdb", mdbId, ...(plz ? { plz } : {}) };
    }
  }

  if (plz) return { type: "plz", plz };
  return null;
}
