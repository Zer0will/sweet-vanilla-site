# Sweet Vanilla Website

Responsive single-page bakery website for Diana / Sweet Vanilla, built from the July 2026 PRD.

## Included

- Spanish-first mobile landing page
- Menu, pricing, specials, gallery, policies, FAQ, and contact/pickup sections
- Seven-step guided order flow
- Live summary, estimated total, and 50% deposit estimate
- Weekend-only date validation with 4-day minimum notice
- Mock capacity config: max 5 orders/day via `bookedDates` in `script.js`
- Max 3 inspiration images selected client-side
- WhatsApp handoff to `206-571-6064` with a structured message

## Run locally

Open `index.html` directly, or start a local server:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Before launch

- Confirm exact pickup location or pickup-area wording.
- Confirm payment methods for the 50% deposit.
- Replace mock `bookedDates` in `script.js` with Airtable/Google Sheets/DB-backed availability if Diana wants true no-overbooking enforcement.
- Decide whether form-submitted dates should reserve provisional capacity or only count after Diana confirms.
- WhatsApp deep links cannot attach uploaded images directly; current version lists selected file names and prompts customers to send photos in the WhatsApp thread. For real image links, add storage/upload backend in phase 2 or a form provider.
- Replace/add higher-resolution gallery images when available.
