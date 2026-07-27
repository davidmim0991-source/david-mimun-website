# דוד מימון · אוטומציות ואתרים — Agency Website

One-page marketing site (Hebrew, RTL) for David Mimun Automations & Websites — an AI automation agency that builds human-like WhatsApp customer-service bots for e-commerce.

## Stack
- Single static `index.html` (HTML + CSS + vanilla JS, no build step)
- Font: Heebo (Google Fonts)
- Live demo chat widget calls the bot API: `POST https://web-production-e83e4.up.railway.app/api/chat`

## Deploy (Vercel)
1. Import this repo in Vercel
2. Framework preset: **Other** (it's static)
3. Root directory: `/` · Build command: none · Output directory: `/`
4. Deploy

## Config
Edit the `CONFIG` block near the bottom of `index.html`:
- `API_BASE` — bot backend URL
- `WHATSAPP` — number (international, digits only)
- `CALENDLY` — booking link

## Contact
- WhatsApp: 058-642-1825
- Email: davidmim0991@gmail.com
