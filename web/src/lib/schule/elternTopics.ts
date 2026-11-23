import type { Locale } from "@/lib/i18n/locale";
import type { TopicStarter } from "@/lib/topics/topicStarters";

export const ELTERN_MAX_TOPICS = 2;

// Neutrale Satzanfänge aus Elternsicht: sie nennen das Feld, nicht die Meinung.
export const ELTERN_TOPICS: readonly TopicStarter[] = [
  {
    id: "unterrichtsausfall",
    emoji: "⏰",
    title: "Unterrichts­ausfall",
    issueText: "Bei der Schule meines Kindes fällt Unterricht aus: ",
  },
  {
    id: "lehrkraeftemangel",
    emoji: "📚",
    title: "Lehrkräfte­mangel",
    issueText: "An der Schule meines Kindes fehlen Lehrkräfte: ",
  },
  {
    id: "schulgebaeude",
    emoji: "🏫",
    title: "Schul­gebäude & Ausstattung",
    issueText:
      "Das Gebäude oder die Ausstattung der Schule meines Kindes ist ein Problem. Dafür ist der Schulträger zuständig, also die Stadt oder der Kreis: ",
  },
  {
    id: "ganztag",
    emoji: "🍽️",
    title: "Ganztag & Betreuung",
    issueText: "Bei Ganztag oder Betreuung an der Schule meines Kindes erlebe ich: ",
  },
  {
    id: "inklusion",
    emoji: "🤝",
    title: "Inklusion & Förderung",
    issueText: "Bei Inklusion oder Förderung an der Schule meines Kindes erlebe ich: ",
  },
  {
    id: "schulweg",
    emoji: "🚌",
    title: "Schulweg & Bus",
    issueText: "Der Schulweg oder der Schulbus meines Kindes ist ein Problem: ",
  },
  {
    id: "digitales",
    emoji: "💻",
    title: "Digitales",
    issueText: "Bei WLAN, Tablets oder digitalem Unterricht an der Schule meines Kindes erlebe ich: ",
  },
];

// Same ids, emojis and order as the German list; only titles and sentence starts differ.
// Module-level arrays keep the `topics` identity stable until the language changes.
const ELTERN_TOPICS_EN: readonly TopicStarter[] = [
  { id: "unterrichtsausfall", emoji: "⏰", title: "Cancelled lessons", issueText: "Lessons are being cancelled at my child's school: " },
  { id: "lehrkraeftemangel", emoji: "📚", title: "Teacher shortage", issueText: "My child's school is short of teachers: " },
  {
    id: "schulgebaeude",
    emoji: "🏫",
    title: "School building & equipment",
    issueText:
      "The building or equipment at my child's school is a problem. The Schulträger is responsible for that, meaning the city or the district: ",
  },
  { id: "ganztag", emoji: "🍽️", title: "All-day school & care", issueText: "With all-day school or care at my child's school, I experience: " },
  { id: "inklusion", emoji: "🤝", title: "Inclusion & support", issueText: "With inclusion or extra support at my child's school, I experience: " },
  { id: "schulweg", emoji: "🚌", title: "School route & bus", issueText: "My child's route to school or the school bus is a problem: " },
  { id: "digitales", emoji: "💻", title: "Digital", issueText: "With Wi-Fi, tablets or digital teaching at my child's school, I experience: " },
];

const ELTERN_TOPICS_TR: readonly TopicStarter[] = [
  { id: "unterrichtsausfall", emoji: "⏰", title: "Ders iptali", issueText: "Çocuğumun okulunda dersler iptal ediliyor: " },
  { id: "lehrkraeftemangel", emoji: "📚", title: "Öğretmen eksikliği", issueText: "Çocuğumun okulunda öğretmen eksik: " },
  {
    id: "schulgebaeude",
    emoji: "🏫",
    title: "Okul binası ve donanım",
    issueText:
      "Çocuğumun okulunun binası veya donanımı bir sorun. Bundan Schulträger, yani şehir veya ilçe sorumlu: ",
  },
  { id: "ganztag", emoji: "🍽️", title: "Tam gün ve bakım", issueText: "Çocuğumun okulunda tam gün eğitim veya bakım konusunda şunu yaşıyorum: " },
  { id: "inklusion", emoji: "🤝", title: "Kaynaştırma ve destek", issueText: "Çocuğumun okulunda kaynaştırma veya destek konusunda şunu yaşıyorum: " },
  { id: "schulweg", emoji: "🚌", title: "Okul yolu ve servis", issueText: "Çocuğumun okul yolu veya okul servisi bir sorun: " },
  { id: "digitales", emoji: "💻", title: "Dijital", issueText: "Çocuğumun okulunda Wi-Fi, tablet veya dijital derslerle ilgili şunu yaşıyorum: " },
];

export const ELTERN_TOPICS_BY_LOCALE: Record<Locale, readonly TopicStarter[]> = {
  de: ELTERN_TOPICS,
  en: ELTERN_TOPICS_EN,
  tr: ELTERN_TOPICS_TR,
};
