import { getLetterCount } from "@/lib/counter";
import { formatNumber } from "@/lib/formatNumber";
import { LocalizedFooter } from "./LocalizedFooter";

export default async function Footer() {
  const letterCount = await getLetterCount();
  return (
    <LocalizedFooter
      letterCount={letterCount}
      formattedLetterCount={formatNumber(letterCount)}
    />
  );
}
