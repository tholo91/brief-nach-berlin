"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode, type RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import { deleteDataAction, type DeleteDataResult } from "@/lib/actions/deleteData";
import { BRIEF_EMAIL } from "@/lib/contact";
import { SUPPORT_CONTENT } from "@/lib/support-content";
import { buildDataDeletionMailto } from "@/lib/email/mailLocale";

export type StoredRow = { id: string; title: string; detail: string };

export type DatenloeschenView =
  | { kind: "no_link"; reason: "missing" | "invalid" }
  | { kind: "lookup_failed" }
  | { kind: "empty"; email: string }
  | { kind: "stored"; email: string; token: string; rows: StoredRow[] };

const linkClass = "text-waldgruen underline underline-offset-2 hover:text-waldgruen-dark";
const primaryButtonClass =
  "inline-block w-full sm:w-auto bg-waldgruen text-creme font-semibold px-6 py-3 rounded-xl hover:bg-waldgruen-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer";

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

function formatDeleted(deleted: { reviews: number; mapEntries: number; outcomes: number }): string {
  const parts: string[] = [];
  if (deleted.reviews > 0) parts.push(plural(deleted.reviews, "Bewertung", "Bewertungen"));
  if (deleted.mapEntries > 0) parts.push(plural(deleted.mapEntries, "Kartenpunkt", "Kartenpunkte"));
  if (deleted.outcomes > 0) parts.push(plural(deleted.outcomes, "Rückmeldung", "Rückmeldungen"));
  if (parts.length === 0) return "Es war nichts mehr gespeichert.";
  const text = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(", ")} und ${parts[parts.length - 1]}`;
  return `Gelöscht: ${text}.`;
}

function PersonalLine() {
  return (
    <div className="mt-8 pt-6 border-t border-waldgruen/10 flex items-center gap-3 text-left">
      <Image
        src="/images/thomas-avatar.jpg"
        alt=""
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 rounded-full object-cover"
      />
      <p className="font-body text-sm text-warmgrau leading-relaxed">
        Moin, ich bin Thomas und baue, fixe und betreue Brief-nach-Berlin allein. Schreib mir gern bei Fragen an{" "}
        <a href={`mailto:${BRIEF_EMAIL}`} className={linkClass}>
          {BRIEF_EMAIL}
        </a>
        .
      </p>
    </div>
  );
}

function SmallPrint() {
  return (
    <p className="mt-6 font-body text-sm text-warmgrau leading-relaxed">
      Du hast auch mit einer anderen Adresse geschrieben?{" "}
      <a href={buildDataDeletionMailto("de")} className={linkClass}>
        Schreib mir, dann lösche ich das von Hand.
      </a>
    </p>
  );
}

function Heading({ headingRef, children }: { headingRef: RefObject<HTMLHeadingElement | null>; children: ReactNode }) {
  return (
    <h1
      ref={headingRef}
      tabIndex={-1}
      className="font-typewriter text-xl font-semibold text-waldgruen-dark mb-4 focus:outline-none"
    >
      {children}
    </h1>
  );
}

export function DatenloeschenClient({ view }: { view: DatenloeschenView }) {
  const [result, setResult] = useState<DeleteDataResult | null>(null);
  const [pending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (result) headingRef.current?.focus();
  }, [result]);

  function handleDelete() {
    if (view.kind !== "stored") return;
    startTransition(async () => {
      setResult(await deleteDataAction({ token: view.token }));
    });
  }

  const body = (() => {
    if (result?.ok) {
      return (
        <>
          <Heading headingRef={headingRef}>Erledigt. Deine Daten sind gelöscht.</Heading>
          <p className="font-body text-sm text-warmgrau leading-relaxed mb-3">{formatDeleted(result.deleted)}</p>
          <p className="font-body text-sm text-warmgrau leading-relaxed mb-3">
            Danke, dass du einen Brief geschrieben hast. Wenn du magst und es dir etwas wert ist: Ich zahle KI,
            Mailversand und Server bisher allein. Schon 5 € helfen, damit es für die Nächsten kostenlos bleibt.{" "}
            <a href={SUPPORT_CONTENT.ctas.donate.href} className={linkClass}>
              {SUPPORT_CONTENT.ctas.donate.label}
            </a>
            .
          </p>
          <p className="font-body text-sm text-warmgrau leading-relaxed mb-6">
            Höchstens kommt noch eine Rückfrage-Mail, die schon geplant war. Danach ist Schluss.
          </p>
          <Link href="/app" className={primaryButtonClass}>
            Neuen Brief schreiben
          </Link>
        </>
      );
    }

    if (result && result.reason !== "invalid_link") {
      const message = result.reason === "rate_limited"
        ? "Du hast es gerade mehrmals versucht. Warte bitte eine Weile und versuch es dann noch einmal, oder schreib mir."
        : "Bitte versuch es gleich noch einmal. Klappt es wieder nicht, schreib mir, dann lösche ich es von Hand.";
      return (
        <>
          <Heading headingRef={headingRef}>Da hat etwas nicht geklappt</Heading>
          <p className="font-body text-sm text-warmgrau leading-relaxed mb-6">{message}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            {result.reason === "server_error" && view.kind === "stored" && (
              <button type="button" onClick={handleDelete} disabled={pending} aria-busy={pending} className={primaryButtonClass}>
                {pending ? "Wird gelöscht" : "Noch einmal versuchen"}
              </button>
            )}
            <a href={buildDataDeletionMailto("de")} className={`${linkClass} self-center text-sm`}>
              Löschwunsch per Mail schicken
            </a>
          </div>
        </>
      );
    }

    if (view.kind === "no_link" || (result && !result.ok)) {
      const invalid = view.kind === "no_link" ? view.reason === "invalid" : true;
      return (
        <>
          <Heading headingRef={headingRef}>
            {invalid ? "Dieser Link ist nicht mehr gültig." : "Gespeicherte Daten löschen"}
          </Heading>
          <div className="font-body text-sm text-warmgrau leading-relaxed space-y-3 mb-6">
            <p>
              Deinen Brief speichere ich nicht. Etwas liegt nur bei mir, wenn du deinen Brief
              bewertet, eine Rückmeldung abgegeben oder dein Anliegen auf die Karte gesetzt hast.
            </p>
            <p>Zum Löschen brauchst du den persönlichen Link aus meiner Rückfrage-Mail. Er gilt 90 Tage.</p>
            <p>Findest du die Mail nicht mehr? Schreib mir kurz, dann lösche ich es von Hand.</p>
          </div>
          <a href={buildDataDeletionMailto("de")} className={primaryButtonClass}>
            Löschwunsch per Mail schicken
          </a>
        </>
      );
    }

    if (view.kind === "lookup_failed") {
      return (
        <>
          <Heading headingRef={headingRef}>Da hat etwas nicht geklappt</Heading>
          <p className="font-body text-sm text-warmgrau leading-relaxed mb-6">
            Ich konnte gerade nicht nachsehen, was gespeichert ist. Lade die Seite bitte gleich noch einmal oder
            schreib mir.
          </p>
          <a href={buildDataDeletionMailto("de")} className={primaryButtonClass}>
            Löschwunsch per Mail schicken
          </a>
        </>
      );
    }

    if (view.kind === "empty") {
      return (
        <>
          <Heading headingRef={headingRef}>Zu deiner Adresse liegt nichts bei mir</Heading>
          <div className="font-body text-sm text-warmgrau leading-relaxed space-y-3">
            <p>
              Für <strong className="font-semibold text-waldgruen-dark break-all">{view.email}</strong> habe ich keine
              Daten gespeichert.
            </p>
            <p>
              Es gibt keinen Newsletter und keine Liste, auf der du stehst. Deinen Brief speichere ich nicht. Etwas
              liegt nur bei mir, wenn du deinen Brief bewertest, eine Rückmeldung abgibst oder dein Anliegen auf die Karte setzt.
            </p>
          </div>
          <SmallPrint />
        </>
      );
    }

    return (
      <>
        <Heading headingRef={headingRef}>Das habe ich zu deiner Adresse gespeichert</Heading>
        <p className="font-body text-sm text-warmgrau leading-relaxed mb-4">
          Für <strong className="font-semibold text-waldgruen-dark break-all">{view.email}</strong> liegt bei mir:
        </p>
        <ul className="divide-y divide-waldgruen/10 border-y border-waldgruen/10 mb-5">
          {view.rows.map((row) => (
            <li key={row.id} className="py-3">
              <p className="font-body text-sm font-semibold text-waldgruen-dark">{row.title}</p>
              <p className="font-body text-sm text-warmgrau">{row.detail}</p>
            </li>
          ))}
        </ul>
        <p className="font-body text-sm text-warmgrau leading-relaxed mb-5">
          Mit dem Button lösche ich alles davon endgültig.
        </p>
        <button type="button" onClick={handleDelete} disabled={pending} aria-busy={pending} className={primaryButtonClass}>
          {pending ? "Wird gelöscht" : "Alles löschen"}
        </button>
        <SmallPrint />
      </>
    );
  })();

  return (
    <div className="bg-white border border-waldgruen/15 rounded-2xl px-6 py-8 sm:px-10 sm:py-10 shadow-sm">
      <div role="status" aria-live="polite">
        {body}
      </div>
      <PersonalLine />
    </div>
  );
}
