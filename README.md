# Monaflows · דוד מימון אוטומציות

One-page Hebrew RTL marketing site for custom AI WhatsApp customer-service bots.

## Stack
- Static `index.html` plus `privacy.html`, `terms.html`, `accessibility.html`
- Local Heebo font (`fonts/heebo-vf.woff2`) — no Google Fonts request
- Live demo chat: `POST` to the ChatbotDemo API (`CONFIG.API_BASE` in `index.html`)

## Deploy (Vercel)
1. Import this repo in Vercel
2. Framework preset: **Other**
3. Root `/` · no build command · output `/`
4. Deploy

## Config
In `index.html`, `CONFIG`:
- `API_BASE` — ChatbotDemo origin (currently Northflank)
- `WHATSAPP` — digits only for `wa.me`

Legal pages use placeholders in dashed highlight until business details (address, ח.פ., training-off confirmation) are filled in.

## Contact
- WhatsApp: 058-642-1825
- Email: davidmim0991@gmail.com
