const germanIntegerFormatter = new Intl.NumberFormat("de-DE");

const germanDecimalFormatter = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatNumber(value: number): string {
  return germanIntegerFormatter.format(value);
}

export function formatDecimal(value: number): string {
  return germanDecimalFormatter.format(value);
}
