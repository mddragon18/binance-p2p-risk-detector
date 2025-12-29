// background.js
chrome.runtime.onInstalled.addListener(() => {
  console.log("Binance P2P Risk Detector installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PING") {
    sendResponse({ status: "OK" });
  }
});
