import type { TopicStarter } from "@/lib/topics/topicStarters";

export const JUNG_MAX_TOPICS = 2;

// Neutrale Satzanfänge (Beutelsbacher Konsens): sie nennen das Feld, nicht die Meinung.
export const JUNG_TOPICS: readonly TopicStarter[] = [
  {
    id: "schulgebaeude",
    // Weiche Trennzeichen (\u00ad): lange Wörter passen sonst auf 375 px nicht in die Kachel.
    title: "Schul\u00adgebäude & Ausstattung",
    issueText: "An meiner Schule ist das Gebäude oder die Ausstattung ein Problem: ",
  },
  {
    id: "lehrkraeftemangel",
    title: "Lehrkräfte\u00admangel",
    issueText: "Bei uns fällt Unterricht aus oder wird vertreten, weil Lehrkräfte fehlen: ",
  },
  {
    id: "handy-digitales",
    title: "Handy & Digitales",
    issueText: "Beim Thema Handy, WLAN oder Tablets an der Schule erlebe ich: ",
  },
  {
    id: "schulweg",
    title: "Schulweg & Bus",
    issueText: "Mein Schulweg oder der Bus ist ein Problem: ",
  },
  {
    id: "mentale-gesundheit",
    title: "Mentale Gesundheit",
    issueText: "Beim Thema Druck, Stress oder psychische Gesundheit erlebe ich: ",
  },
  {
    id: "klima",
    title: "Klima",
    issueText: "Beim Klimaschutz in meinem Ort oder an meiner Schule fällt mir auf: ",
  },
  {
    id: "wehrdienst",
    title: "Wehrdienst",
    issueText: "Die Debatte über den Wehrdienst betrifft mich, weil ",
  },
  {
    id: "orte-fuer-jugendliche",
    title: "Orte für Jugendliche",
    issueText: "In meinem Ort fehlen Orte für Jugendliche: ",
  },
];

// Ohne Klassenlink (kein Unterricht): Satzanfänge mit Haltung, damit Jugendliche schneller ins Schreiben kommen.
const JUNG_OPEN_TEXT: Record<string, string> = {
  schulgebaeude: "Ich finde es nicht okay, dass wir in einem Schulgebäude lernen, in dem ",
  lehrkraeftemangel:
    "Bei uns fällt ständig Unterricht aus, und in der Prüfung sollen wir trotzdem alles können. Mich ärgert, dass ",
  "handy-digitales": "Alle reden von Digitalisierung, aber an meiner Schule ",
  schulweg: "Mein Schulweg kostet mich jeden Tag Zeit und Nerven, weil ",
  "mentale-gesundheit":
    "Viele in meinem Alter sind am Limit, und auf einen Therapieplatz wartet man monatelang. Bei mir ",
  klima:
    "Wir hatten vom Leben noch kaum etwas und sollen trotzdem ausbaden, was beim Klimaschutz liegen bleibt. Mich stört, dass ",
  wehrdienst:
    "Beim Wehrdienst wird über unsere Köpfe hinweg entschieden, obwohl es um unser Leben geht. Ich möchte, dass ",
  "orte-fuer-jugendliche": "In meinem Ort gibt es kaum einen Platz, an dem wir einfach sein dürfen. Mir fehlt ",
};

export const JUNG_OPEN_TOPICS: readonly TopicStarter[] = JUNG_TOPICS.map((topic) => ({
  ...topic,
  issueText: JUNG_OPEN_TEXT[topic.id] ?? topic.issueText,
}));
