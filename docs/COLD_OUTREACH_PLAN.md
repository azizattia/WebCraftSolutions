# Personalized Concept Outreach — Plan

**Repo:** `azizattia/WebCraftSolutionsIT` (outreach engine + super-admin) · **Site:** wecraftsolution.com
**Goal:** for each good lead, send a **1-page PDF showing a website concept built for *their* business
(≥3 images)** and turn replies into booked calls.
**Targets:** ≥95% delivered · 5–10% reply · 1–3% booked calls · first client within 30 days.

---

## 1. What already exists (reuse, don't rebuild)

| Need | Already in the repo |
|---|---|
| Scrape businesses | `src/scraper.js`, `apify-pool.js`, `apify-budget.js`, `config/targets.js` (Google Maps via Apify, Montreal targets) |
| Find more emails | `src/enrich.js` (fast), `src/enrich-deep.js` (Playwright, local), `scripts/find-emails.js`, `hunt.js` |
| Judge their website | `src/website-audit.js` (no mobile layout, outdated, etc. → score + checkable issues) |
| Personal first line | `src/personalize.js` (Gemini hook + subject per lead) |
| Send safely | `pipeline.js` batches, `outreach-guard.js` (domain check + daily cap), CASL unsubscribe + open/click tracking (`server/routes/track.js`) |
| Catch replies | `src/reply-watch.js` reads the **Outlook** inbox over IMAP → marks lead "replied" |
| Branded PDFs | `src/blueprint-pdf.js` (PDFKit, works on Vercel) |
| Super-admin | `portal/admin.*`, `server/routes/leads.js`, `leadfinder.js`, `cron.js` |

**Missing:** the per-lead **concept PDF with images**, a **hosted concept page**, and an admin
**review step** for them. That is the whole build.

## 2. The flow

```
Leads (Firestore) ─► enrich + audit ─► score ─► Concept brief (Gemini) ─► 3 images ─► 1-page PDF
                                                                                   │
                     Admin review (approve / edit / skip) ◄────────────────────────┘
                                   │
            Email with link to /concept/{token} ─► follow-ups ─► reply (Outlook) ─► call ─► won
```

## 3. Who gets a concept (effort only where it pays)

A concept costs time and API credits, so only generate for leads that score high:
- **+3** audit finds real problems (no mobile layout, very old, broken) or **no website**
- **+2** Google rating ≥ 4.2 with 20+ reviews (they earn money and care about image)
- **+2** high-value niche: clinics, dentists, lawyers, real estate, contractors, spas, gyms
- **+1** owner/manager email (not a generic `info@` address) · **+1** active Instagram/Facebook
- **Skip:** chains, franchises, already-modern sites, anyone on the unsubscribe list

Start with **one niche in Montreal**, send **20–30 concepts a day**, measure, then expand.

## 4. The 1-page PDF

New module `src/concept-pdf.js` (PDFKit, same style as `blueprint-pdf.js`), A4 portrait:

1. **Header:** their name + “Un nouveau site pour {Business} / A new website for {Business}”
2. **Image 1 – Desktop hero:** new homepage in their colors, with their services and photos
3. **Image 2 – Mobile view:** same design on a phone (where most of their clients browse)
4. **Image 3 – Before / after:** their current site (or Google listing) beside the concept
5. **3 bullets for them**, from crawled content + audit, e.g. “Online booking for your 4 services”,
   “Your 4.7★ from 120 reviews on the homepage”, “French/English”
6. **Offer + CTA:** matching package from the admin Offers, price range, QR code to book 15 min

**Making the images (`src/concept-images.js`):**
- **Mockups (recommended):** fill 3–4 niche HTML templates with their logo, colors, text and
  photos, then screenshot desktop + mobile with Playwright. Run locally, like `enrich-deep.js`
  (Chromium is too heavy for Vercel), and upload PNGs to Firebase Storage.
- **Fallback:** Gemini image model (key already set up) for hero backgrounds when they have no
  usable photos.
- **Before shot:** Playwright screenshot of their current site.

**Check every PDF by hand for the first 2 weeks.** One wrong logo or name costs the lead.

## 5. Sending (deliverability first)

- **Send from the authenticated domain** (`FROM_EMAIL` on wecraftsolution.com via Brevo/SMTP,
  already enforced by `outreach-guard.js`). **Keep `webcraftsolutionsit@outlook.com` as `REPLY_TO`**
  and IMAP inbox for `reply-watch.js`. Don’t send bulk mail from it: free Outlook.com has low
  limits and Microsoft suspends accounts that send bulk unsolicited mail.
- **First email has no attachment**, just one link to `wecraftsolution.com/concept/{signed-token}`,
  which shows the images and a PDF download. Attachments hurt deliverability, and this page tells
  you who looked. Log a `concept_viewed` event through the existing tracking.
- Set `DAILY_SEND_CAP` to 20 in week 1, 50 in week 2, then 100 or more.
- **French first for Quebec leads** (English as a fallback). Keep the CASL footer and unsubscribe link.

## 6. Email sequence (reuse the pipeline’s follow-ups)

- **Day 0:** “J’ai préparé une idée de site pour {Business}”. Gemini hook + one issue from the audit +
  concept link + “15 min cette semaine?”
- **Day 3:** reply in the same thread with the mobile image inline
- **Day 8:** short close: “Je ferme votre dossier? Le concept reste à vous.”
- **Reply:** `reply-watch` stops the sequence. Answer within 24h, attach the PDF, book the call.
  Follow up with the estimator/blueprint flow you already have.

## 7. Build steps (in order)

1. `concept-brief.js`: Gemini turns crawl + audit + category into JSON (palette, sections, 3 bullets, headline)
2. `concept-images.js` + 3–4 niche HTML templates, rendered locally, saved to Storage
3. `concept-pdf.js` (PDFKit) + tests (`node:test`, like `blueprint-pdf.test.js`)
4. Public route `/concept/:token` (signed like `track.js`) with image gallery and PDF download
5. Admin: **“Generate concept”** button on a lead, a **Concepts** review queue, and a **“Send with concept”** action
6. New template `templates/concept.txt` (FR + EN); add `concept_viewed` to the admin funnel
7. Script: `npm run concepts -- --niche dentists --limit 30` runs the local batch

## 8. Timeline and cost

| Week | Work |
|---|---|
| 1 | Steps 1–3, pick a niche, scrape and enrich 200 leads |
| 2 | Steps 4–7, review 30 concepts by hand, start sending 20/day |
| 3–4 | Measure; test subject lines and niches; scale to 50–100/day |

**Monthly cost:** Apify ~$49 · Gemini ~$0–20 · Brevo free→$25 · email verification ~$10 → **under $100**.
One website sale pays for it many times over.

## 9. Rules for the best return

- Quality over volume: 20 concepts that look like *their* business beat 500 generic emails.
- Open with their problem and a picture, not a list of services.
- Every week, drop niches with under 3% replies after 100 sends and put more into the ones that work.
- Add each finished client site to the templates and PDFs as proof.
