# Binance P2P Risk Detector (Client-Side Chrome Extension)

A lightweight Chrome extension that analyzes **Binance P2P ads locally** and highlights **high-risk counterparties** using transparent, deterministic heuristics.

No data leaves your browser.

---

## Why this exists

Binance P2P users face two major risks:

1. **Scams** (fake payments, off-platform manipulation)
2. **Bank account freezes (India-specific)** due to tainted INR entering the system via laundering chains

Binance shows raw stats, but does not interpret risk.  
This extension bridges that gap.

---

## Key Features

-  Scans Binance P2P ad listings in real time
-  Assigns a **risk score (0–100)** per advertiser
-  Color-coded risk badges (Green / Yellow / Red)
-  Transparent explanations for every score
-  Detects **price deviations vs local market median**
-  Deterministic rules (no black-box AI)
-  Fully client-side (no network calls, no tracking)

---

## How risk is calculated

Signals used (when visible on the page):

- Number of completed trades
- Completion rate
- Price deviation vs nearby ads (rolling median)
- Trade limits vs history
- Off-platform contact indicators (Telegram, WhatsApp)
- Low-experience heuristics

Each rule contributes a fixed weight.  
Final score is capped at 100 and fully explainable.

---

## India-specific context

In India, P2P crypto sellers face **bank account freezes** when INR received originates from fraudulent or mule accounts.

This tool does **not** guarantee safety, but helps users:
- Avoid suspicious counterparties
- Avoid above-market laundering premiums
- Prefer established, consistent traders

---

## Installation (Developer Mode)

1. Clone the repo
   ```bash
   git clone

