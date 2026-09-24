export function formatSourceStand(value: string): string {
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    return `${iso[3]}.${iso[2]}.${iso[1].slice(-2)}`;
  }
  const germanLong = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (germanLong) {
    return `${germanLong[1]}.${germanLong[2]}.${germanLong[3].slice(-2)}`;
  }
  return value;
}