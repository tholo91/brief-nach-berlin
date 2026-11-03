"use client";

import { CopyTextButton } from "@/components/CopyTextButton";
import { useMdbContactContext } from "@/components/MdbContactContext";

export function buildCallScript(plz?: string, name?: string, wahlkreis?: string): string {
  const wohnort = wahlkreis
    ? `[Ort] (PLZ ${plz}, Wahlkreis ${wahlkreis})`
    : plz
      ? `[Ort] (PLZ ${plz})`
      : "[Ort]";
  const mdb = name ?? "[Name Ihres MdB]";
  return `Guten Tag, mein Name ist [Name]. Ich wohne in ${wohnort} und interessiere mich sehr für Politik. Ich habe gelesen, dass ${mdb} Bürgerinnen und Bürger zu einer Informationsfahrt nach Berlin einlädt. Kann ich mich dafür vormerken lassen? Und was brauchen Sie dafür von mir?`;
}

export function BpaCallScript() {
  const result = useMdbContactContext()?.result;
  const contacts = result?.contacts ?? [];
  const single = contacts.length === 1 ? contacts[0] : undefined;
  const plz = result?.plz && /^\d{5}$/.test(result.plz) ? result.plz : undefined;
  const text = buildCallScript(plz, single?.name, single?.wahlkreisName);

  return (
    <div className="rounded-xl border border-warmgrau/15 bg-white p-5 shadow-sm">
      <p className="font-handwriting text-xl md:text-2xl leading-snug text-warmgrau mb-4 text-pretty">
        {text}
      </p>
      <CopyTextButton text={text} label="Text kopieren" />
    </div>
  );
}
