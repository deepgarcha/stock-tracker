// Encrypts the desk into a password page for GitHub Pages.
//
//   node build.mjs --set-password "<password>" <key-file>    make a new key file (new salt)
//   node build.mjs <source.html> <key-file> [out.html]       encrypt source into index.html
//
// The page holds only ciphertext: AES-256-GCM with a key derived from the password by
// PBKDF2-SHA256 (600,000 rounds). The readable source and the key file stay out of this repo.
import { readFileSync, writeFileSync } from "node:fs";

const { subtle } = globalThis.crypto;
const ITER = 600000;
const b64 = (u8) => Buffer.from(u8).toString("base64");

async function deriveRaw(password, salt) {
  const base = await subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  return new Uint8Array(await subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: ITER }, base, 256));
}

const args = process.argv.slice(2);
if (args[0] === "--set-password") {
  const [, password, keyFile] = args;
  if (!password || !keyFile) throw new Error("usage: --set-password <password> <key-file>");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const raw = await deriveRaw(password, salt);
  writeFileSync(keyFile, JSON.stringify({ salt: b64(salt), iter: ITER, key: b64(raw) }, null, 2) + "\n");
  console.log("Wrote", keyFile);
  process.exit(0);
}

const [src, keyFile, out = "index.html"] = args;
if (!src || !keyFile) throw new Error("usage: <source.html> <key-file> [out.html]");
const k = JSON.parse(readFileSync(keyFile, "utf8"));
const key = await subtle.importKey("raw", Buffer.from(k.key, "base64"), "AES-GCM", false, ["encrypt"]);
const iv = crypto.getRandomValues(new Uint8Array(12));
const ct = new Uint8Array(await subtle.encrypt({ name: "AES-GCM", iv }, key, readFileSync(src)));
const payload = JSON.stringify({ salt: k.salt, iter: k.iter, iv: b64(iv), ct: b64(ct) });

writeFileSync(out, `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Deep Stock Desk</title>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@800&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
<style>
:root { --bg: #f3f5f7; --panel: #ffffff; --fg: #16202b; --muted: #5d6b7a; --line: #dde3ea; --accent: #1f5fae; --down: #c0392b; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #0f151c; --panel: #161e27; --fg: #e6ecf2; --muted: #93a1b0; --line: #26313d; --accent: #6ea8ef; --down: #ff7a6b; color-scheme: dark; } }
:root[data-theme="dark"] { --bg: #0f151c; --panel: #161e27; --fg: #e6ecf2; --muted: #93a1b0; --line: #26313d; --accent: #6ea8ef; --down: #ff7a6b; color-scheme: dark; }
* { box-sizing: border-box; }
html, body { height: 100%; }
body { margin: 0; background: var(--bg); color: var(--fg); font: 15px/1.5 "IBM Plex Sans", system-ui, sans-serif; display: grid; place-items: center; padding: 16px; }
form { width: min(360px, 100%); background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 28px 24px; display: grid; gap: 14px; }
h1 { font: 800 1.1rem/1 Archivo, "Helvetica Neue", Arial, sans-serif; letter-spacing: 0.04em; margin: 0 0 4px; }
p { margin: 0; color: var(--muted); font-size: 0.88rem; }
input[type=password] { font: inherit; color: inherit; width: 100%; border: 1px solid var(--line); background: var(--bg); border-radius: 8px; padding: 10px 12px; }
input:focus-visible, button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
label.rem { display: flex; gap: 8px; align-items: center; font-size: 0.86rem; color: var(--muted); }
button { font: 600 0.95rem/1 inherit; font-family: inherit; border: 0; border-radius: 8px; padding: 11px; background: var(--accent); color: var(--panel); cursor: pointer; }
button:disabled { opacity: .6; cursor: wait; }
.err { color: var(--down); font-size: 0.86rem; min-height: 1.3em; }
.hide { position: absolute; left: -9999px; }
</style>
<script>try { const t = JSON.parse(localStorage.getItem("td_theme")); if (t) document.documentElement.dataset.theme = t; } catch {}</script>
</head><body>
<form id="gate" autocomplete="on">
  <h1>DEEP STOCK DESK</h1>
  <p>Enter the password to open the desk.</p>
  <input class="hide" type="text" name="username" autocomplete="username" value="deep-stock-desk" tabindex="-1" aria-hidden="true">
  <input id="pw" type="password" name="password" autocomplete="current-password" placeholder="Password" aria-label="Password" required autofocus>
  <label class="rem"><input id="rem" type="checkbox" checked> Remember on this device</label>
  <button id="go" type="submit">Unlock</button>
  <div id="err" class="err" role="alert"></div>
</form>
<script>
(() => {
  const P = ${payload};
  const KEY = "td_gate_key", from64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const to64 = (u8) => btoa(String.fromCharCode(...u8));
  async function open(raw) {
    const key = await crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["decrypt"]);
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: from64(P.iv) }, key, from64(P.ct));
    document.open(); document.write(new TextDecoder().decode(pt)); document.close();
  }
  const saved = (() => { try { return localStorage.getItem(KEY); } catch { return null; } })();
  if (saved) open(from64(saved)).catch(() => { try { localStorage.removeItem(KEY); } catch {} });
  document.getElementById("gate").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("go"), err = document.getElementById("err");
    btn.disabled = true; btn.textContent = "Unlocking…"; err.textContent = "";
    try {
      const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(document.getElementById("pw").value), "PBKDF2", false, ["deriveBits"]);
      const raw = new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: from64(P.salt), iterations: P.iter }, base, 256));
      const remember = document.getElementById("rem").checked;
      await open(raw);
      try { if (remember) localStorage.setItem(KEY, to64(raw)); } catch {}
    } catch {
      btn.disabled = false; btn.textContent = "Unlock"; err.textContent = "That password isn't right.";
      document.getElementById("pw").select();
    }
  });
})();
</script>
</body></html>
`);
console.log("Wrote", out, `(${Math.round(ct.length / 1024)} KB encrypted)`);
