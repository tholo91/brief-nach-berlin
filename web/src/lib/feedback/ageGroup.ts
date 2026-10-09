export const AGE_GROUP_VALUES = [
  "under_30",
  "30_44",
  "45_59",
  "60_74",
  "75_plus",
] as const;

export type AgeGroup = (typeof AGE_GROUP_VALUES)[number];

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  under_30: "unter 30",
  "30_44": "30 bis 44",
  "45_59": "45 bis 59",
  "60_74": "60 bis 74",
  "75_plus": "75 oder älter",
};
