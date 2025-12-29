// rules.js
import { NEGATIVE_KEYWORDS } from "./keywords.js";

export const RULES = [
  {
    id: "ACCOUNT_AGE_LT_30",
    description: "Very new account",
    weight: 20,
    enabled: true,
    evaluate: (data) =>
      data.accountAgeDays !== null && data.accountAgeDays < 30,
    explain: (data) =>
      `Account age is ${data.accountAgeDays} days`
  },

  {
    id: "COMPLETION_LT_90",
    description: "Low completion rate",
    weight: 15,
    enabled: true,
    evaluate: (data) =>
      data.completionRate !== null && data.completionRate < 90,
    explain: (data) =>
      `Completion rate is ${data.completionRate}%`
  },

  {
    id: "TRADES_LT_20",
    description: "Very few completed trades",
    weight: 10,
    enabled: true,
    evaluate: (data) =>
      data.totalTrades !== null && data.totalTrades < 20,
    explain: (data) =>
      `Only ${data.totalTrades} total trades`
  },

  {
    id: "PRICE_DEVIATION_GT_3",
    description: "Price deviates significantly from market",
    weight: 15,
    enabled: true,
    evaluate: (data) =>
      data.priceDeviationPct !== null && data.priceDeviationPct > 3,
    explain: (data) =>
      `Price deviates ${data.priceDeviationPct}% from market`
  },

  {
    id: "NEGATIVE_REVIEWS",
    description: "Negative keywords found in reviews",
    weight: 20,
    enabled: true,
    evaluate: (data) => {
      if (!data.reviewTexts || data.reviewTexts.length === 0) return false;

      return data.reviewTexts.some(text => {
        const lower = text.toLowerCase();
        return NEGATIVE_KEYWORDS.some(keyword =>
          lower.includes(keyword)
        );
      });
    },
    explain: () =>
      "Reviews contain scam-related keywords"
  },

  {
    id: "UNVERIFIED_ID",
    description: "Identity not verified",
    weight: 10,
    enabled: true,
    evaluate: (data) =>
      data.isVerified === false,
    explain: () =>
      "User is not identity verified"
  },

  {
    id: "LIMIT_HISTORY_MISMATCH",
    description: "Large trade limits with minimal history",
    weight: 15,
    enabled: true,
    evaluate: (data) =>
      data.tradeMax !== null &&
      data.totalTrades !== null &&
      data.tradeMax > 1000 &&
      data.totalTrades < 10,
    explain: (data) =>
      `Max trade ${data.tradeMax} with only ${data.totalTrades} trades`
  },

  {
    id: "OFF_PLATFORM_INVITES",
    description: "Repeated off-platform contact attempts",
    weight: 15,
    enabled: true,
    evaluate: (data) =>
      data.detectedOffPlatformMentions >= 2,
    explain: (data) =>
      `${data.detectedOffPlatformMentions} off-platform contact mentions detected`
  }
];
