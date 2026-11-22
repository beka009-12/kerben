# Site audit — kerben-travel.com, 2026-11-22

- Step ID: `audit`
- Status: completed (evidence-backed); handoffs labelled provisional because no formal `seo-findings.json` bundle was produced
- Owner: Kerben Travel (site owner)
- Scope: all 224 URLs in the live XML sitemap (56 pages × en/ru/de/zh), robots.txt, icons, the code on `feat/seo-improvements` at `dfa9223`
- Outcome: 12 confirmed defects or opportunities, 9 fixed locally in commits `aff5360`–`1dee531`, 3 open for the owner in the [action plan](action-plan.md)

## Evidence

| Capture | How | File |
| --- | --- | --- |
| Live crawl, Googlebot UA (what Google gets) | curl, sequential, 0.2 s delay, 2026-11-22 ~13:00 UTC | [raw/crawl-googlebot-ua.json](raw/crawl-googlebot-ua.json) |
| Live crawl, generic UA (what unlisted bots get) | same | [raw/crawl-browser-ua.json](raw/crawl-browser-ua.json) |
| Live sitemap.xml | same | [raw/live-sitemap-2026-11-22.xml](raw/live-sitemap-2026-11-22.xml) |
| Spot checks of bot classes | curl with Googlebot, GPTBot, bingbot, YandexBot, Baiduspider and Chrome UAs on `/en/tours/49` and `/en/about` | recorded below |

The raw HTML (67 MB) stayed in the session scratchpad. Each URL's SHA-256 is in the crawl JSON.

## What is already solid (no action)

- All 224 URLs return 200 with a self-referencing canonical, a complete reciprocal hreflang cluster (en, ru, de, zh-CN, x-default) and no robots/X-Robots noindex.
- With a Googlebot UA every page has exactly one H1. Tour pages carry TouristTrip+Product+Offer+BreadcrumbList, hotels carry LodgingBusiness, the home page carries TravelAgency+WebSite and the FAQ page carries FAQPage. All JSON-LD parses.
- Schema prices match the visible prices (checked on all 10 EN tours: $65, $195, $320, $490, $85, $75, $80, $190, $310, $280).
- No `<img>` lacks an `alt` attribute; every page has an og:image; no page took longer than 3.2 s to fetch.
- The XML sitemap matches the route inventory (224 URLs) and robots.txt blocks only private sections.
- Internal linking: no orphan URLs. The weakest pages (some hotel and transport details) have one inbound link, from their listing page.

## Findings

| ID | Lane | Finding (evidence) | Severity | Status |
| --- | --- | --- | --- | --- |
| F-01 | page / content / research | EN, DE and ZH catalog titles were generic: "All Tours — Kerben Travel", "Hotels — Kerben Travel", "Alle Touren", "全部线路". The head-term pages didn't name the country | important | **fixed** `aff5360` |
| F-02 | research | The RU home title «Туры по Кыргызстану (Киргизии)» and RU `/tours` «Туры по Кыргызстану (Киргизии): цены и программы» targeted the same query (cannibalization) | important | **fixed** `aff5360`: home now leads with brand + «туроператор» |
| F-03 | content | 64 transport detail pages shared one description per language, and hotels in the same district shared one ("Pervomaysky District, Bishkek… Handpicked hotels…") | important | **fixed** `aff5360`: descriptions built from each item's own facts |
| F-04 | content | Experience theme titles were single words ("Mountains — Kerben Travel"); two descriptions were padded with the home text and cut off with "…" | important | **fixed** `aff5360` |
| F-05 | content | The contact description was thin ("Ask us anything about your next trip.") and had no NAP | minor | **fixed** `aff5360`: live phone + hours |
| F-06 | schema | Transport, helicopter and trekking detail pages had no JSON-LD; the TravelAgency lacked logo, image and address | important | **fixed** `a7e6033` |
| F-07 | technical | `/favicon.ico` returned the HTML 404 page; only `/icon.png` (512 px) was declared | minor | **fixed** `da25bf6` |
| F-08 | technical / agentic | Crawlers outside `htmlLimitedBots` (Amazonbot, DuckAssistBot, meta-externalagent, MistralAI-User, PetalBot, CCBot) get the prerender shell: 0 H1, no JSON-LD and ~100 words on 156/224 pages ([browser-UA crawl](raw/crawl-browser-ua.json)) | important | **fixed** `6c342d9` for the named crawlers; unknown bots are covered by the Markdown layer |
| F-09 | technical / AI search | No `/llms.txt` (404), no Markdown or text representation of any page | owner-required | **fixed** `1dee531`, see [markdown-delivery.md](markdown-delivery.md) |
| F-10 | performance | Search Console is not verified: `public/google442cc37a16c5e944.html` sits on unmerged branch `chore/google-search-console-verification` and is 404 live. No Bing Webmaster | **blocker for measurement** | open, A-01 (owner) |
| F-11 | local / authority | The site never publishes a street address (contacts show "Bishkek, Kerben Travel LLC"). There's no Google Business Profile evidence, the brand SERP belongs to unrelated kerbentravel.kg, and there are zero indexed mentions of kerben-travel.com | important | open, A-02…A-05 (owner) |
| F-12 | content | Backend data gaps: most hotels and cars have no description; helicopter route 45 is titled "Marry me" with no description; the trekking catalog is empty; tour 49 has no day-by-day programme | minor | open, A-06 (owner content) |

## Lanes screened and why they did or did not produce findings

- **Images:** alt text is complete; formats are AVIF/WebP via next/image. No action.
- **Video:** the two MP4s are a decorative hero background, with no watch pages. Not applicable.
- **Commerce:** tours are priced trips without a cart or merchant feed. The schema/visible price parity above is the only relevant check, and it passed.
- **Programmatic:** detail pages are template-driven from the backend. The template fixes (F-03, F-06) apply to every item, and the backlog item A-06 covers data quality.
- **News/Discover, competitor pages:** no articles and no comparison pages. Not applicable.
- **AEO/GEO:** no Research Pack or engine observations were collected (no access, and none requested). The Markdown layer improves extractability; any citation outcome is unmeasured.

## Next destination

[markdown-delivery.md](markdown-delivery.md) → [action-plan.md](action-plan.md)
