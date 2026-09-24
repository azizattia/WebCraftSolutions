# Personalized Cold Outreach Plan — WebCraft Solutions

**Goal:** turn the scraped leads in the super-admin into booked calls by sending each business a
1-page PDF with a website concept designed for *them*, then following up.
**Target KPIs:** ≥95% deliverability · 40–60% open · 5–10% reply · 1–3% booked calls.

---

## 1. Pipeline at a glance

```
Super-admin leads ─┐
Apify scrapers ────┴─► Enrich & verify ─► Score & pick ─► Generate PDF + page ─► Send & follow up ─► Track in super-admin
```

| Step | Tool | Output |
|---|---|---|
| 1. Collect | Existing scraped emails + Apify **Google Maps Scraper** (`compass/crawler-google-places`) by niche + city | name, category, phone, website, rating, reviews |
| 2. Enrich | Apify **Website Content Crawler** + **Contact Details Scraper** on each site | services, about text, logo, colors, photos, socials, extra emails |
| 3. Verify | MillionVerifier / NeverBounce (or Apify email-validator actor) | drop invalid, catch-all flagged |
| 4. Score | Simple rules (below) | top 20–30 leads/day |
| 5. Create | LLM brief + HTML template → Playwright → PDF (1 page, 3+ images) | `lead-slug.pdf` + hosted preview page |
| 6. Send | Business mailbox, 3-step sequence | tracked sends, replies |
| 7. Track | New `outreach` status fields in super-admin | pipeline view: sent → opened → replied → call → won |

## 2. Who to target (lead scoring)

Score 0–10, send to the highest first:
- **+3** no website, or site not mobile-friendly / broken / >5s load (check with PageSpeed API)
- **+2** good Google rating (4.2+) and 20+ reviews → they have money and care about reputation
- **+2** high-value niche: clinics, dentists, lawyers, real estate, restaurants, gyms, salons, contractors
- **+1** active on Instagram/Facebook but weak site
- **+1** personal email found (owner/manager) instead of `info@`
- **−5** big chain / franchise / already a modern site

Start with **one niche + one city** (e.g. dentists in Tunis) so templates and images can be reused and
the offer sounds specialized.

## 3. The 1-page PDF (the “wow” asset)

Generated automatically per lead from an HTML template (A4, rendered with Playwright `page.pdf()`):

1. **Header:** their logo/name + “A new website concept for *{Business}*”
2. **Image 1 — Hero mockup:** desktop homepage using *their* colors, photos and services (HTML
   mockup screenshotted in a laptop frame).
3. **Image 2 — Mobile mockup:** same design on a phone frame (most of their customers are mobile).
4. **Image 3 — Before / after:** screenshot of their current site (or Google listing if none) vs. the
   new concept.
5. **3 bullets tailored to them** (from the crawled content), e.g. “Online booking for your 4
   services”, “Show your 4.7★ from 120 reviews”, “Arabic / French / English”.
6. **Offer + CTA:** matching package from the super-admin *Offers* section, price anchor, QR code +
   link to book a 15-min call.

Images come from HTML mockups first (fast, accurate branding); use an image model only for hero
backgrounds when the business has no usable photos. **Manually review every PDF before it goes out**
for the first 2 weeks.

## 4. Sending — deliverability first

- **Don’t blast from `webcraftsolutionsit@outlook.com`.** Consumer Outlook.com accounts have low
  daily limits and Microsoft suspends accounts for bulk unsolicited mail. Use it for replies/inbound,
  and send from a mailbox on the domain, e.g. `aziz@wecraftsolution.com` (Microsoft 365 / Zoho /
  Google Workspace), ideally on a secondary domain (e.g. `wecraftsolution.co`) to protect the main one.
- Set up **SPF, DKIM, DMARC**; warm up 2–3 weeks; start at **10–15/day**, grow to 30–40/day per inbox.
- **First email: no attachment**, 1 link max. Link to a hosted preview
  (`wecraftsolution.com/concept/{slug}`) that shows the PDF + download button. This avoids spam
  filters *and* tells you who viewed it. Attach the PDF only when they reply.
- Plain text, short, personal. Always include business address + one-line opt-out; honor it
  immediately (CAN-SPAM / GDPR / local law).

## 5. Sequence (3 touches, 10 days)

**Day 0 — Subject:** `Quick website idea for {Business}`
> Hi {FirstName}, I came across {Business} on Google Maps — {specific compliment, e.g. 4.8★ from 90
> reviews}. I noticed {specific issue: no site / site hard to use on mobile / no online booking}.
> I sketched a free concept of what your site could look like: {preview link}.
> Worth a 15-minute call this week? — Aziz, WebCraft Solutions

**Day 3 — Reply in thread:** one new benefit + mobile screenshot inline (“most of your clients will
see it like this”).
**Day 10 — Break-up:** “Should I close your file? Happy to send the concept files either way.”

Reply → move to call within 24h, send full PDF + matching super-admin offer.

## 6. Build in this codebase (super-admin)

1. **Leads table:** add `website_score`, `lead_score`, `enrichment_json`, `pdf_url`, `status`,
   `last_contacted_at`, `opt_out`.
2. **“Enrich” button / cron:** calls the Apify API (token in env), stores results.
3. **“Generate concept” button:** LLM writes the brief + bullets → fills HTML template →
   Playwright renders mockups + PDF → uploads to storage → creates `/concept/{slug}` page.
4. **Review queue:** approve/edit each PDF + email before sending.
5. **Send:** SMTP/Graph API from the domain mailbox with rate limit, auto-stop sequence on reply.
6. **Dashboard:** funnel counts and reply rate per niche/city/subject line.

## 7. Timeline & budget

| Week | Work |
|---|---|
| 1 | Domain mailbox + DNS + warm-up start; Apify scrape 1 niche/city; lead scoring |
| 2 | PDF/mockup template + generator; `/concept/{slug}` page; review queue |
| 3 | First 10–15 sends/day, manual review; measure |
| 4+ | A/B test subject + niche, scale to 30–40/day/inbox, add a 2nd inbox if results hold |

**Monthly cost (approx.):** Apify $49 · email verification ~$10–20 · domain mailbox ~$6 ·
warm-up tool ~$15–30 · LLM/image API ~$10–30 → **≈ $100/month**. One closed website pays for months.

## 8. Rules for best ROI

- Quality over volume: 20 great personalized emails beat 500 generic ones.
- Lead with *their* problem and a visual, not with your services list.
- Measure weekly; kill niches with <3% reply after 100 sends, double down on winners.
- Ask every client for a review/referral and add finished projects to the PDF as social proof.
