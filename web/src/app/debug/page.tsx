import type { ReactNode } from "react";
import AppHeader from "@/components/AppHeader";
import { LETTER_LENGTHS } from "@/lib/config";
import type { LetterDebugPayload } from "@/lib/email/sendLetterEmail";
import type { LetterVariantDebugPayload } from "@/lib/email/variantDebugPayload";
import CopyButton from "./CopyButton";
import { format, type DebugPayload } from "./formatDebug";

function lengthText(key: string | undefined, min: number, max: number): string {
  const label = key && key in LETTER_LENGTHS ? LETTER_LENGTHS[key as keyof typeof LETTER_LENGTHS].label : key;
  return label ? `${label} (${min} bis ${max} Wörter)` : `${min} bis ${max} Wörter`;
}

export const metadata = {
  title: "Deine Eingaben",
  robots: { index: false, follow: false },
};

function decode(d: string | undefined): DebugPayload | { error: string } {
  if (!d) return { error: "Missing ?d= param" };
  try {
    const b64 = d.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as DebugPayload;
  } catch (e) {
    return { error: `Decode failed: ${(e as Error).message}` };
  }
}

function isVariant(p: DebugPayload): p is LetterVariantDebugPayload {
  return "source" in p && p.source === "brief_variant";
}

function Facts({ items }: { items: Array<[string, string | undefined]> }) {
  const rows = items.filter((i): i is [string, string] => Boolean(i[1]));
  return (
    <dl className="mt-2 divide-y divide-warmgrau/10 text-[15px]">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[7.5rem_1fr] gap-3 py-2.5 sm:grid-cols-[9rem_1fr]">
          <dt className="text-warmgrau/75">{k}</dt>
          <dd className="min-w-0 break-words font-semibold text-warmgrau">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6 first:mt-0">
      <h2 className="font-typewriter text-lg font-bold text-waldgruen-dark">{title}</h2>
      {children}
    </section>
  );
}

function TextBlock({ text, note }: { text: string; note?: string }) {
  return (
    <>
      <p className="mt-3 whitespace-pre-wrap break-words rounded-xl bg-creme p-4 text-base leading-relaxed text-warmgrau">
        {text || "—"}
      </p>
      {note && <p className="mt-2 text-sm text-warmgrau/75">{note}</p>}
      {text && (
        <div className="mt-3">
          <CopyButton text={text} label="Text kopieren" />
        </div>
      )}
    </>
  );
}

function LetterCard({ d }: { d: LetterDebugPayload }) {
  const preview = d.issueTextPreview ?? "";
  const truncated = preview.length > 0 && preview.length < d.issueTextLength;
  const region = d.recipientRegion ?? d.representativeWahlkreis;
  const recipient = [d.representativeName, d.representativeLevel, region].filter(Boolean);
  return (
    <>
      <Section title="Dein Anliegen">
        <TextBlock
          text={preview}
          note={
            truncated
              ? `Gekürzt: ${preview.length} von ${d.issueTextLength} Zeichen. Der Brief selbst steht in deiner Mail.`
              : undefined
          }
        />
      </Section>
      <Section title="Dein Brief im Überblick">
        <Facts
          items={[
            ["Empfänger:in", recipient.join(", ")],
            ["Ebene", d.politicalLevel],
            ["Tonalität", d.toneLabel],
            ["Brieflänge", lengthText(d.letterLengthKey, d.letterLengthMin, d.letterLengthMax)],
            ["PLZ", d.plz],
            ["Herkunft", d.campaignSlug ? "Kampagnenbrief" : undefined],
          ]}
        />
      </Section>
    </>
  );
}

function VariantCard({ d }: { d: LetterVariantDebugPayload }) {
  return (
    <>
      <Section title="Dein Änderungswunsch">
        <TextBlock text={d.changeRequestPreview ?? ""} />
      </Section>
      <Section title="Dein Brief im Überblick">
        <Facts
          items={[
            ["Gewünschte Tonalität", d.requestedToneLabel],
            [
              "Brieflänge",
              lengthText(d.letterLengthKey, d.letterLengthMin, d.letterLengthMax),
            ],
          ]}
        />
      </Section>
    </>
  );
}

export default async function DebugPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const { d } = await searchParams;
  const payload = decode(d);
  const failed = "error" in payload;

  return (
    <div className="min-h-screen bg-creme font-body text-warmgrau">
      <AppHeader />
      <main className="mx-auto w-full max-w-[640px] px-4 py-8 sm:py-12">
        <h1 className="font-typewriter text-3xl font-bold text-waldgruen-dark">Deine Eingaben</h1>
        <p className="mt-3 text-base leading-relaxed">
          Diese Seite zeigt nur die Werte, die in deinem E-Mail-Link mitgeschickt wurden. Es wird
          nichts aus einer Datenbank geladen und nichts gespeichert.
        </p>

        <article className="mt-6 rounded-2xl border border-warmgrau/15 bg-white p-5 shadow-sm sm:p-6">
          {failed ? (
            <Section title="Link unvollständig">
              <p className="mt-2 leading-relaxed">
                Dieser Link scheint unvollständig zu sein. Öffne ihn bitte noch einmal direkt aus
                der Mail, ohne ihn zu kopieren oder zu kürzen.
              </p>
            </Section>
          ) : isVariant(payload) ? (
            <VariantCard d={payload} />
          ) : (
            <LetterCard d={payload} />
          )}
        </article>

        <details className="mt-6 rounded-2xl border border-warmgrau/15 bg-white/60 p-4">
          <summary className="cursor-pointer rounded font-semibold text-warmgrau focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-waldgruen">
            Technische Details
          </summary>
          <pre className="mt-3 whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed">
            {format(payload)}
          </pre>
        </details>
      </main>
    </div>
  );
}
