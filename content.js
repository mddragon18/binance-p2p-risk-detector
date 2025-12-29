(() => {
  console.log("P2P Risk Detector loaded");

  /* ---------- shared state ---------- */

  const pricePool = [];
  const PRICE_POOL_LIMIT = 100;
  let currentMarketPrice = null;

  /* ---------- helpers ---------- */

  function normalize(text) {
    return text ? text.toLowerCase().trim() : "";
  }

  function extractCompletionRate(text) {
    const match = text.match(/([\d.]+)\s*%/);
    return match ? Number(match[1]) : null;
  }

  /* ---------- styles ---------- */

  function injectStyles() {
    if (document.getElementById("p2p-risk-style")) return;

    const style = document.createElement("style");
    style.id = "p2p-risk-style";
    style.innerHTML = `
      .p2p-risk-badge {
        display: inline-block;
        margin-left: 8px;
        padding: 2px 6px;
        font-size: 11px;
        font-weight: 600;
        border-radius: 4px;
        color: #fff;
        cursor: pointer;
      }
      .risk-green { background: #2ecc71; }
      .risk-yellow { background: #f1c40f; color: #000; }
      .risk-red { background: #e74c3c; }

      .p2p-risk-overlay {
        position: fixed;
        top: 20%;
        right: 20px;
        width: 280px;
        background: #1e1e1e;
        color: #fff;
        border-radius: 8px;
        padding: 12px;
        z-index: 999999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        font-size: 13px;
      }

      .p2p-risk-overlay h4 {
        margin: 0 0 8px 0;
        font-size: 14px;
      }

      .p2p-risk-overlay ul {
        padding-left: 16px;
        margin: 6px 0;
      }

      .p2p-risk-overlay button {
        background: #444;
        color: #fff;
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }

  /* ---------- risk engine ---------- */

  function evaluateRisk(ad) {
    let score = 0;
    const reasons = [];

    if (ad.totalTrades !== null && ad.totalTrades < 20) {
      score += 10;
      reasons.push("Very low trade count");
    }

    if (ad.totalTrades !== null && ad.totalTrades < 100) {
      score += 5;
      reasons.push("Relatively low trading history");
    }

    if (ad.completionRate !== null && ad.completionRate < 90) {
      score += 15;
      reasons.push("Low completion rate");
    }

    if (
      ad.completionRate !== null &&
      ad.completionRate >= 90 &&
      ad.completionRate < 95
    ) {
      score += 5;
      reasons.push("Completion rate slightly below top sellers");
    }

    if (
      ad.price !== null &&
      currentMarketPrice !== null &&
      pricePool.length >= 10
    ) {
      const deviation =
        Math.abs(ad.price - currentMarketPrice) / currentMarketPrice * 100;

      if (deviation > 3) {
        score += 15;
        reasons.push(`Price deviates ${deviation.toFixed(1)}% from market`);
      } else if (deviation > 1) {
        score += 10;
        reasons.push(`Price slightly off market (${deviation.toFixed(1)}%)`);
      }
    }

    score = Math.min(score, 100);

    let level = "GREEN";
    if (score >= 60) level = "RED";
    else if (score >= 30) level = "YELLOW";

    return { score, level, reasons };
  }

  /* ---------- overlay ---------- */

  function removeOverlay() {
    const o = document.querySelector(".p2p-risk-overlay");
    if (o) o.remove();
  }

  function showOverlay(risk, ad) {
    removeOverlay();

    const overlay = document.createElement("div");
    overlay.className = "p2p-risk-overlay";

    const color =
      risk.level === "RED" ? "#e74c3c" :
      risk.level === "YELLOW" ? "#f1c40f" :
      "#2ecc71";

    overlay.innerHTML = `
      <h4 style="color:${color}">
        Risk Score: ${risk.score} (${risk.level})
      </h4>

      ${
        currentMarketPrice
          ? `<div style="font-size:12px;margin-bottom:6px;">
               Market ≈ ₹${currentMarketPrice.toFixed(2)}<br/>
               This ad: ₹${ad.price ?? "N/A"}
             </div>`
          : ""
      }

      <strong>Why:</strong>
      <ul>
        ${
          risk.reasons.length
            ? risk.reasons.map(r => `<li>${r}</li>`).join("")
            : "<li>No risk flags detected</li>"
        }
      </ul>

      <strong>Safety tips:</strong>
      <ul>
        <li>Keep chat on Binance</li>
        <li>Confirm payment before releasing crypto</li>
        <li>Avoid off-platform contact</li>
      </ul>

      <div style="text-align:right;margin-top:8px;">
        <button id="p2p-risk-close">Close</button>
      </div>
    `;

    document.body.appendChild(overlay);
    document.getElementById("p2p-risk-close").onclick = removeOverlay;
  }

  /* ---------- scraping ---------- */

  function findAdRow(button) {
    let el = button;
    for (let i = 0; i < 7; i++) {
      if (!el) break;
      const text = el.innerText || "";
      if (/orders/i.test(text) && /₹\s?[\d,.]+/.test(text)) {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  }

  function extractAds() {
    const buttons = Array.from(document.querySelectorAll("button"))
      .filter(b => b.innerText.includes("Buy") || b.innerText.includes("Sell"));

    const ads = [];

    buttons.forEach(btn => {
      const row = findAdRow(btn);
      if (!row || row.dataset.p2pRiskProcessed) return;

      row.dataset.p2pRiskProcessed = "true";
      const text = normalize(row.innerText);

      ads.push({
        row,
        price: (() => {
          const m = row.innerText.match(/₹\s?([\d,.]+)/);
          return m ? Number(m[1].replace(/,/g, "")) : null;
        })(),
        totalTrades: (() => {
          const m = text.match(/(\d+)\s+orders/i);
          return m ? Number(m[1]) : null;
        })(),
        completionRate: extractCompletionRate(text)
      });
    });

    return ads;
  }

  function calculateMedian(pool) {
    if (!pool.length) return null;
    const s = [...pool].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }

  /* ---------- main ---------- */

  function run() {
    injectStyles();

    const ads = extractAds();

    ads.forEach(ad => {
      if (typeof ad.price === "number") pricePool.push(ad.price);
    });

    while (pricePool.length > PRICE_POOL_LIMIT) pricePool.shift();

    currentMarketPrice = calculateMedian(pricePool);

    ads.forEach(ad => {
      const risk = evaluateRisk(ad);
      const badge = document.createElement("span");
      badge.className = `p2p-risk-badge risk-${risk.level.toLowerCase()}`;
      badge.textContent = `RISK ${risk.score}`;
      badge.onclick = e => {
        e.stopPropagation();
        showOverlay(risk, ad);
      };
      (ad.row.querySelector("span") || ad.row.firstElementChild)?.appendChild(badge);
    });
  }

  run();
  new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
})();
