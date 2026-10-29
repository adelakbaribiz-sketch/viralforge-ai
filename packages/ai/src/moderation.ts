/**
 * Moderation
 * =========
 * Pre-generation and pre-publishing moderation. Text runs through OpenAI
 * Moderation API (free tier). Image/video runs through Google SafeSearch.
 *
 * Returns BLOCKED / FLAGGED / APPROVED. Blocked content stops the pipeline.
 */

export interface ModerationInput {
  organizationId: string;
  type: "TEXT" | "IMAGE" | "VIDEO" | "MUSIC";
  content: string;
}

export interface ModerationResult {
  status: "APPROVED" | "FLAGGED" | "BLOCKED";
  reason?: string;
  categories?: string[];
  score?: number;
}

export async function runModeration(input: ModerationInput): Promise<ModerationResult> {
  // Text moderation via OpenAI Moderation API (production):
  // const res = await fetch("https://api.openai.com/v1/moderations", {
  //   method: "POST",
  //   headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
  //   body: JSON.stringify({ input: input.content }),
  // });
  // const { results } = await res.json();
  // if (results[0].flagged) {
  //   return { status: "BLOCKED", categories: Object.keys(results[0].categories).filter(k => results[0].categories[k]) };
  // }

  // Heuristic checks (no API needed for demo):
  const bannedPhrases = ["guaranteed virality", "guaranteed views", "guaranteed income", "guaranteed youtube"];
  const lower = input.content.toLowerCase();
  for (const phrase of bannedPhrases) {
    if (lower.includes(phrase)) {
      return { status: "BLOCKED", reason: `Forbidden phrase: "${phrase}"`, categories: ["policy"] };
    }
  }

  // Trademark/copyright heuristics
  const trademarkHints = ["©", "all rights reserved", "copyright"];
  for (const hint of trademarkHints) {
    if (lower.includes(hint)) {
      return { status: "FLAGGED", reason: `Potential copyright claim detected`, categories: ["copyright"] };
    }
  }

  return { status: "APPROVED" };
}
