// scraper/detectPage.js

export function isP2PPage() {
  return location.href.includes("/p2p");
}

export function isAdDetailView() {
  // Binance uses client-side routing
  // We detect presence of trade action buttons
  const buttons = document.querySelectorAll("button");
  return Array.from(buttons).some(btn =>
    btn.innerText.includes("Buy") || btn.innerText.includes("Sell")
  );
}
