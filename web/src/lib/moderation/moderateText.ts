import { mistral } from "@/lib/mistral";

export interface ModerationResult {
  flagged: boolean;
  categories: string[];
}

export async function moderateText(text: string): Promise<ModerationResult> {
  const response = await mistral.classifiers.moderate({
    model: "mistral-moderation-latest",
    inputs: [text],
  });
  const result = response.results[0];
  const categoryMap = result?.categories ?? {};
  const flaggedCategories = Object.entries(categoryMap)
    .filter(([, flagged]) => flagged)
    .map(([category]) => category);
  return { flagged: flaggedCategories.length > 0, categories: flaggedCategories };
}
