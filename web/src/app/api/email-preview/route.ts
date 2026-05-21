import { NextResponse } from "next/server";
import { buildEmailHtml } from "@/lib/email/buildEmailHtml";
import { buildFollowupHtml } from "@/lib/email/buildFollowupHtml";
import { APP_URL } from "@/lib/config";

// Dev-only preview of the transactional emails with dummy data.
// - /api/email-preview               → Letter mail (Original-Briefversand)
// - /api/email-preview?type=followup → Backlog Follow-up Mail
// - ?format=text                     → Plain-Text-Variante anzeigen
// Returns 404 in production so this never leaks externally.
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  // Rewrite the hardcoded production APP_URL to the current host so local
  // assets (e.g. /images/email-bundestag-banner.png) actually load in preview.
  const url = new URL(request.url);
  const origin = url.origin;
  const type = url.searchParams.get("type");
  const wantText = url.searchParams.get("format") === "text";

  if (type === "followup") {
    const dummyToken =
      "eyJzb3VyY2UiOiJiYWNrbG9nXzIwMjZfMDUiLCJpYXQiOjE3Nzk0MDAwMDB9.preview";
    const { html, text, subject } = buildFollowupHtml({
      token: dummyToken,
      baseUrl: origin,
    });
    return new NextResponse(wantText ? text : html, {
      status: 200,
      headers: {
        "Content-Type": wantText
          ? "text/plain; charset=utf-8"
          : "text/html; charset=utf-8",
        "X-Email-Subject": subject,
      },
    });
  }

  const dummyLetter = `Sehr geehrte Frau Dr. Müller,

ich wende mich heute an Sie, weil mich die aktuelle Situation auf den Radwegen in unserem Viertel sehr beschäftigt. Seit Monaten warten wir auf die versprochene Sanierung, und mit jedem Regen werden die Schlaglöcher tiefer.

Ich bin selbst täglich mit dem Rad zur Arbeit unterwegs und sehe, wie viele Familien mit Kindern auf den Radweg ausweichen müssen, weil dort kein sicheres Vorankommen mehr möglich ist. Gerade in einem Wahlkreis wie unserem, der so stolz auf seine Fahrradkultur ist, wirkt dieser Zustand wie ein Bruch eines Versprechens.

Ich bitte Sie deshalb, sich im Bundestag dafür einzusetzen, dass die Mittel für kommunale Radinfrastruktur nicht erneut gekürzt werden. Es geht hier um Sicherheit, um Klima, und um das tägliche Leben tausender Bürgerinnen und Bürger.

Mit freundlichen Grüßen
Eine Bürgerin aus Ihrem Wahlkreis`;

  const html = buildEmailHtml({
    recipientEmail: "preview@example.com",
    politicianName: "Müller",
    politicianFirstName: "Anna",
    politicianLastName: "Müller",
    politicianTitle: "Dr.",
    politicianParty: "SPD",
    politicianPostalAddress: "Platz der Republik 1, 11011 Berlin",
    politicianAbgeordnetenwatchUrl: "https://www.abgeordnetenwatch.de/profile/anna-mueller",
    letterText: dummyLetter,
    issueText: "Radwege im Viertel sind seit Monaten kaputt",
    feedbackToken: "dummy-token-for-preview",
  });

  const localHtml = html.split(APP_URL).join(origin);

  return new NextResponse(localHtml, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
