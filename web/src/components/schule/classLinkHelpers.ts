export function classLinkFileName(klasse: number): string {
  return `brief-nach-berlin-klassenlink-klasse-${klasse}-qr.png`;
}

export function formatValidUntil(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Berlin",
  }).format(new Date(iso));
}
