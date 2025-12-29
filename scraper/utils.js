// scraper/utils.js

export function extractNumber(text) {
  if (!text) return null;
  const match = text.replace(/,/g, "").match(/[\d.]+/);
  return match ? Number(match[0]) : null;
}

export function extractPercentage(text) {
  const num = extractNumber(text);
  return num !== null ? num : null;
}

export function normalizeText(text) {
  return text ? text.trim().toLowerCase() : "";
}

export function safeQueryAll(root, selector) {
  try {
    return Array.from(root.querySelectorAll(selector));
  } catch {
    return [];
  }
}
