# Monaflows · נציגי שירות AI

One-page Hebrew RTL marketing site for AI customer-service agents, led by voice/phone with WhatsApp as an additional channel.

## Stack
- Static `index.html` with shared homepage styles in `site.css`
- `privacy.html`, `terms.html`, and `accessibility.html` share `legal.css`
- Local Heebo font (`fonts/heebo-vf.woff2`) — no Google Fonts request
- Live demo chat: `POST` to the ChatbotDemo API (`CONFIG.API_BASE` in `index.html`)
- Python standard-library structural checks in `tests/test_site.py`

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

## Verify
```sh
python3 -m unittest discover -s tests -v
```

## Contact
- WhatsApp: 058-642-1825
- Email: davidmim0991@gmail.com
