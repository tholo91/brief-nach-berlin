import { getServiceRoleClient } from "@/lib/supabase/server";
import { verifyDataDeletionToken } from "@/lib/dataDeletion/token";
import { lookupUserDataByEmail, type StoredUserData } from "@/lib/dataDeletion/userData";
import { DatenloeschenClient, type DatenloeschenView, type StoredRow } from "./DatenloeschenClient";

export const metadata = {
  title: "Gespeicherte Daten löschen | Brief-nach-Berlin",
  robots: { index: false, follow: false },
  // No referrer leakage: links on this page must not carry the signed token in the Referer header.
  referrer: "no-referrer" as const,
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Berlin",
  });
}

function buildRows(data: StoredUserData): StoredRow[] {
  const rows: StoredRow[] = [];
  data.reviews.forEach((review, index) => {
    rows.push({
      id: `review-${index}`,
      title: `Bewertung vom ${formatDate(review.createdAt)}: ${review.rating} von 5 Sternen`,
      detail: review.isPublic ? "öffentlich auf /stimmen" : "nicht öffentlich",
    });
  });
  data.mapEntries.forEach((entry, index) => {
    rows.push({
      id: `map-${index}`,
      title: `Anliegen auf der Karte: PLZ-Bereich ${entry.plzPrefix}`,
      detail: `eingetragen am ${formatDate(entry.createdAt)}`,
    });
  });
  data.outcomes.forEach((outcome, index) => {
    rows.push({
      id: `outcome-${index}`,
      title: `Rückmeldung vom ${formatDate(outcome.createdAt)}`,
      detail: outcome.completed ? "vollständig abgesendet" : "begonnen, noch nicht vollständig abgesendet",
    });
  });
  return rows;
}

export default async function DatenloeschenPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  const token = typeof t === "string" && t.length > 0 ? t : null;

  let view: DatenloeschenView;
  if (!token) {
    view = { kind: "no_link", reason: "missing" };
  } else {
    const verified = verifyDataDeletionToken(token);
    if (!verified) {
      view = { kind: "no_link", reason: "invalid" };
    } else {
      // GET only reads (D-01): deletion happens exclusively through the button and the Server Action.
      try {
        const data = await lookupUserDataByEmail(getServiceRoleClient(), verified.email);
        const rows = buildRows(data);
        view = rows.length === 0
          ? { kind: "empty", email: verified.email }
          : { kind: "stored", email: verified.email, token, rows };
      } catch (error) {
        console.error("[data-deletion] lookup failed", error instanceof Error ? error.message : "unknown error");
        view = { kind: "lookup_failed" };
      }
    }
  }

  return (
    <section className="bg-creme px-4 sm:px-6 py-10 sm:py-14 md:py-16 flex justify-center">
      <div className="max-w-xl w-full">
        <DatenloeschenClient view={view} />
      </div>
    </section>
  );
}
