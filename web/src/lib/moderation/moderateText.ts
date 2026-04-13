import { openai } from "../openai";

export interface ModerationResult {
  flagged: boolean;
  categories: string[];
}

export async function moderateText(text: string): Promise<ModerationResult> {
  const response = await openai.moderations.create({
    model: "omni-moderation-latest",
    input: text,
  });
  const result = response.results[0];
  const flaggedCategories = Object.entries(result.categories)
    .filter(([, flagged]) => flagged)
    .map(([category]) => category);
  return { flagged: result.flagged, categories: flaggedCategories };
}
