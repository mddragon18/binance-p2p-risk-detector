// riskEngine.js
import { RULES } from "./rules.js";

export function evaluateRisk(data, rules = RULES) {
  let score = 0;
  const triggeredRules = [];
  const missingSignals = [];

  // Track missing signals explicitly
  const REQUIRED_FIELDS = [
    "accountAgeDays",
    "totalTrades",
    "completionRate",
    "priceDeviationPct",
    "isVerified"
  ];

  REQUIRED_FIELDS.forEach(field => {
    if (data[field] === null || data[field] === undefined) {
      missingSignals.push(field);
    }
  });

  for (const rule of rules) {
    if (!rule.enabled) continue;

    let triggered = false;
    try {
      triggered = rule.evaluate(data);
    } catch (err) {
      // Never crash the engine
      console.warn(`Rule ${rule.id} failed`, err);
      continue;
    }

    if (triggered) {
      score += rule.weight;
      triggeredRules.push({
        id: rule.id,
        description: rule.description,
        weight: rule.weight,
        explanation: rule.explain(data)
      });
    }
  }

  score = Math.min(score, 100);

  let level = "GREEN";
  if (score >= 60) level = "RED";
  else if (score >= 30) level = "YELLOW";

  return {
    score,
    level,
    triggeredRules,
    missingSignals
  };
}
