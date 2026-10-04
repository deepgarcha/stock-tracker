# Deep Stock Desk

A small stock watchlist that runs entirely in the browser: add tickers, see intraday sparklines and charts, and set price alerts.

- **Demo mode** (default): simulated prices so everything works without a key.
- **Live mode**: open **Settings** (gear icon) and paste free API keys. Keys are stored only in your browser's localStorage.
  - [Finnhub](https://finnhub.io/register): live quotes (every 20 s), company search, key stats and news. Free: 60 calls/min.
  - [Twelve Data](https://twelvedata.com/register): price history for the 1D–All charts (Finnhub's free plan has no candles). Free: 800 calls/day, 8/min.

Ask about a stock: in **Settings → AI**, pick **Google Gemini** (free key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey)) or **Anthropic Claude** (paid key from [console.anthropic.com](https://console.anthropic.com/settings/keys)). The page's quote, key stats, price history and recent news are sent along as context, straight from your browser to the provider you chose.

Email alerts: in **Settings → Email alerts**, add one or more addresses and your free [EmailJS](https://www.emailjs.com/) Service ID, Template ID and Public key (template: To = `{{to_email}}`, Subject = `{{subject}}`, body = `{{message}}`). Alerts are emailed while the page is open, for live prices only.

Features: tabs to group stocks, drag-and-drop ordering, range charts (1D, 5D, 1M, 6M, YTD, 1Y, 5Y, All), key stats, latest news, and price alerts.

Hosted with GitHub Pages from `index.html` on `main`.
