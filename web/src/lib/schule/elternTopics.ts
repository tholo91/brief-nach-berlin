import type { TopicStarter } from "@/lib/topics/topicStarters";

export const ELTERN_MAX_TOPICS = 2;

// Neutrale Satzanfänge aus Elternsicht: sie nennen das Feld, nicht die Meinung.
export const ELTERN_TOPICS: readonly TopicStarter[] = [
  {
    id: "unterrichtsausfall",
    title: "Unterrichts­ausfall",
    issueText: "Bei der Schule meines Kindes fällt Unterricht aus: ",
  },
  {
    id: "lehrkraeftemangel",
    title: "Lehrkräfte­mangel",
    issueText: "An der Schule meines Kindes fehlen Lehrkräfte: ",
  },
  {
    id: "schulgebaeude",
    title: "Schul­gebäude & Ausstattung",
    issueText:
      "Das Gebäude oder die Ausstattung der Schule meines Kindes ist ein Problem. Dafür ist der Schulträger zuständig, also die Stadt oder der Kreis: ",
  },
  {
    id: "ganztag",
    title: "Ganztag & Betreuung",
    issueText: "Bei Ganztag oder Betreuung an der Schule meines Kindes erlebe ich: ",
  },
  {
    id: "inklusion",
    title: "Inklusion & Förderung",
    issueText: "Bei Inklusion oder Förderung an der Schule meines Kindes erlebe ich: ",
  },
  {
    id: "schulweg",
    title: "Schulweg & Bus",
    issueText: "Der Schulweg oder der Schulbus meines Kindes ist ein Problem: ",
  },
  {
    id: "digitales",
    title: "Digitales",
    issueText: "Bei WLAN, Tablets oder digitalem Unterricht an der Schule meines Kindes erlebe ich: ",
  },
];
