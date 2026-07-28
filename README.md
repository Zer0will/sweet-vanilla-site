# Sweet Vanilla Website

Responsive single-page bakery website for Diana / Sweet Vanilla, built from the July 2026 PRD.

## Included

- Spanish-first mobile landing page
- Real cropped product photos from Sweet Vanilla Instagram screenshots
- Menu, pricing, specials, gallery, policies, and contact/pickup sections
- Seven-step guided order flow
- Live summary, estimated total, and 50% deposit note
- Weekend-only date validation with 4-day minimum notice
- Mock capacity config: max 5 orders/day via `bookedDates` in `index.html`
- Max 3 inspiration images selected client-side
- WhatsApp handoff to `206-571-6064` with a structured message
- Supabase-ready inspiration photo upload through Vercel API route: `api/upload.js`

## Run locally

Open `index.html` directly, or start a local server:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Supabase photo upload setup

The order form is wired to upload customer inspiration photos to Supabase Storage and insert public links in the WhatsApp message. Configure these Vercel environment variables:

```bash
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
SUPABASE_BUCKET=order-inspiration
```

Bucket requirement:

- Create a Storage bucket named `order-inspiration`.
- Make the bucket public if you want WhatsApp links to open without auth.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only; never paste it into `index.html`.

If Supabase env vars are missing, the site gracefully falls back to telling customers to attach photos manually in WhatsApp.

## Before launch

- Confirm exact pickup location or pickup-area wording.
- Confirm payment methods for the 50% deposit.
- Replace mock `bookedDates` with Airtable/Google Sheets/DB-backed availability if Diana wants true no-overbooking enforcement.
- Decide whether form-submitted dates should reserve provisional capacity or only count after Diana confirms.
- Replace/add higher-resolution original photos when available; current gallery crops are taken from Instagram screenshots.
