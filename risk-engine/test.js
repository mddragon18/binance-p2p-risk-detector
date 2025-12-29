// test.js
import { evaluateRisk } from "./riskEngine.js";

const mockData = {
  accountAgeDays: 12,
  totalTrades: 5,
  completionRate: 82,
  cancellationRate: null,
  priceDeviationPct: 4.2,
  isVerified: false,
  reviewTexts: [
    "User asked to move to Telegram",
    "Trade was cancelled after payment"
  ],
  tradeMin: 100,
  tradeMax: 5000,
  detectedOffPlatformMentions: 2
};

console.log(evaluateRisk(mockData));
