export const POLITICAL_SELF_EFFICACY_VALUES = [
  "clearly_yes",
  "rather_yes",
  "rather_no",
  "no",
  "unsure",
] as const;

export type PoliticalSelfEfficacy =
  (typeof POLITICAL_SELF_EFFICACY_VALUES)[number];

export const POLITICAL_SELF_EFFICACY_LABELS: Record<
  PoliticalSelfEfficacy,
  string
> = {
  clearly_yes: "Ja, deutlich",
  rather_yes: "Eher ja",
  rather_no: "Eher nein",
  no: "Nein",
  unsure: "Kann ich noch nicht sagen",
};

export const POLITICAL_POWERLESSNESS_FREQUENCY_VALUES = [
  "often",
  "sometimes",
  "rarely",
  "never",
] as const;

export type PoliticalPowerlessnessFrequency =
  (typeof POLITICAL_POWERLESSNESS_FREQUENCY_VALUES)[number];

export const POLITICAL_POWERLESSNESS_FREQUENCY_LABELS: Record<
  PoliticalPowerlessnessFrequency,
  string
> = {
  often: "Oft",
  sometimes: "Manchmal",
  rarely: "Selten",
  never: "Nie",
};

export function validatePoliticalReviewAnswers({
  mode,
  letterSent,
  politicalSelfEfficacy,
}: {
  mode: "initial" | "full";
  letterSent: boolean | null;
  politicalSelfEfficacy: PoliticalSelfEfficacy | null;
}): string | null {
  if (mode === "initial") return null;

  if (politicalSelfEfficacy !== null && letterSent !== true) {
    return "Ungültige Antwort zur politischen Handlungsfähigkeit.";
  }

  if (letterSent === true && politicalSelfEfficacy === null) {
    return "Bitte beantworte noch, ob du dich durch den Brief eher politisch einbringen kannst.";
  }

  return null;
}
