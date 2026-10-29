export type MdbContactQuery =
  | { type: "plz"; plz: string }
  | { type: "mdb"; mdbId: number }
  | null;

export function resolveMdbContactQuery(search: string): MdbContactQuery {
  const params = new URLSearchParams(search);
  const plz = params.get("plz");
  if (plz && /^\d{5}$/.test(plz)) return { type: "plz", plz };

  const mdb = params.get("mdb");
  if (mdb && /^\d+$/.test(mdb)) {
    const mdbId = Number(mdb);
    if (Number.isSafeInteger(mdbId) && mdbId > 0) return { type: "mdb", mdbId };
  }

  return null;
}
