export const SEND_SIGNAL_LABEL = "geben an, ihren Brief verschickt zu haben oder ihn unmittelbar zu verschicken";

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
  timeZone: "Europe/Berlin",
});

export function formatPressDate(value: string): string {
  return dateFormatter.format(new Date(value));
}
