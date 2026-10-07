# Deep Stock Desk

A small stock watchlist that runs entirely in the browser: add tickers, see intraday sparklines and charts, and set price alerts.

- **Demo mode** (default): simulated prices so everything works without a key.
- **Live mode**: open **Settings** (gear icon) and paste free API keys. Keys are stored only in your browser's localStorage.
  - [Finnhub](https://finnhub.io/register): live quotes (every 20 s), company search, key stats and news. Free: 60 calls/min.
  - [Twelve Data](https://twelvedata.com/register): price history for the 1D–All charts (Finnhub's free plan has no candles). Free: 800 calls/day, 8/min.

Ask about a stock: in **Settings → AI**, pick **Google Gemini** (free key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey)) or **Anthropic Claude** (paid key from [console.anthropic.com](https://console.anthropic.com/settings/keys)). The page's quote, key stats, price history and recent news are sent along as context, straight from your browser to the provider you chose.

Email alerts: in **Settings → Email alerts**, add one or more addresses and your free [EmailJS](https://www.emailjs.com/) Service ID, Template ID and Public key (template: To = `{{to_email}}`, Subject = `{{subject}}`, body = `{{message}}`). Alerts are emailed while the page is open, for live prices only.

Features: tabs to group stocks, drag-and-drop ordering, range charts (1D, 5D, 1M, 6M, YTD, 1Y, 5Y, All), key stats, latest news, price alerts, and private notes per stock (saved in your browser), and a light/dark switch in the top bar.

Hosted with GitHub Pages from `index.html` on `main`.

## Password

The published `index.html` is a password page: the desk is encrypted inside it (AES-256-GCM, key from the password via PBKDF2-SHA256, 600,000 rounds) and only unlocks in the browser with the right password. The readable source and key file are kept outside this repo. To rebuild after editing the source:

    node build.mjs <source.html> <key-file> index.html

To change the password: `node build.mjs --set-password "<new password>" <key-file>`, then rebuild.
