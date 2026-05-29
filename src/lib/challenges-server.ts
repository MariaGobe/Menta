import { createClient } from "@/lib/supabase/server";
import { FREE_CHALLENGES_PER_YEAR, CHALLENGE_ADDON_PRICE_EUR } from "@/lib/challenges";

/**
 * SERVER-ONLY. No importar desde client components.
 */
export async function countChallengesThisYear(
  organizationId: string,
): Promise<number> {
  const supabase = createClient();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const { count } = await supabase
    .from("challenges")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .in("status", ["published", "closed", "archived"])
    .gte("created_at", oneYearAgo.toISOString());

  return count ?? 0;
}

export interface ChallengeAvailability {
  hasFree: boolean;
  usedThisYear: number;
  priceEur: number;
}

export async function checkChallengeAvailability(
  organizationId: string,
): Promise<ChallengeAvailability> {
  const used = await countChallengesThisYear(organizationId);
  return {
    hasFree: used < FREE_CHALLENGES_PER_YEAR,
    usedThisYear: used,
    priceEur: CHALLENGE_ADDON_PRICE_EUR,
  };
}
