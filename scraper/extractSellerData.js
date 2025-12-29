// scraper/extractSellerData.js
import {
  extractNumber,
  extractPercentage,
  normalizeText,
  safeQueryAll
} from "./utils.js";

export function extractSellerData() {
  const data = {
    accountAgeDays: null,
    totalTrades: null,
    completionRate: null,
    cancellationRate: null,
    priceDeviationPct: null,
    isVerified: null,
    reviewTexts: [],
    tradeMin: null,
    tradeMax: null,
    detectedOffPlatformMentions: 0
  };

  try {
    // General text scan
    const bodyText = normalizeText(document.body.innerText);

    // Off-platform mentions
    const offPlatformKeywords = ["telegram", "whatsapp", "signal", "dm"];
    offPlatformKeywords.forEach(k => {
      if (bodyText.includes(k)) data.detectedOffPlatformMentions++;
    });

    // Reviews
    const reviewNodes = safeQueryAll(document, "[class*=review]");
    reviewNodes.forEach(node => {
      const text = node.innerText;
      if (text && text.length > 10) {
        data.reviewTexts.push(text);
      }
    });

    // Stats blocks (key-value style)
    const statBlocks = safeQueryAll(document, "div");

    statBlocks.forEach(block => {
      const text = block.innerText;

      if (!text) return;

      if (text.includes("Completion")) {
        data.completionRate = extractPercentage(text);
      }

      if (text.includes("Trades")) {
        data.totalTrades = extractNumber(text);
      }

      if (text.includes("Registered") || text.includes("Account age")) {
        const days = extractNumber(text);
        if (days !== null) data.accountAgeDays = days;
      }

      if (text.includes("Verified")) {
        data.isVerified = !text.toLowerCase().includes("unverified");
      }

      if (text.includes("Limit")) {
        const numbers = text.match(/[\d,.]+/g);
        if (numbers && numbers.length >= 2) {
          data.tradeMin = Number(numbers[0].replace(/,/g, ""));
          data.tradeMax = Number(numbers[1].replace(/,/g, ""));
        }
      }
    });

    // Price deviation (relative to market)
    const priceNodes = safeQueryAll(document, "[class*=price]");
    if (priceNodes.length >= 2) {
      const prices = priceNodes
        .map(n => extractNumber(n.innerText))
        .filter(Boolean);

      if (prices.length >= 2) {
        const [adPrice, marketPrice] = prices;
        data.priceDeviationPct =
          Math.abs((adPrice - marketPrice) / marketPrice) * 100;
      }
    }
  } catch (err) {
    console.warn("Seller data extraction failed", err);
  }

  return data;
}
