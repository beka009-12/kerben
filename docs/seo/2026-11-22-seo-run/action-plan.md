# Decision record and action plan

- Step ID: `plan`
- Status: completed for local implementation; release and provider actions await the owner
- Decision owner: Kerben Travel (site owner)

## Decision record

| Field | Value |
| --- | --- |
| Request (2026-11-22) | "Audit + fix locally" plus the "AI/LLM Markdown layer" for all four languages, with no Search Console data, for the en/ru/de/zh markets |
| End state | Locally committed fixes on `feat/seo-improvements` and a complete Markdown corpus for every public page |
| Implementation authorization | Granted: local changes and commits on `feat/seo-improvements` |
| Release authorization | **Not granted.** No push and no deploy |
| Provider operations (GSC/Bing submit, IndexNow) | **Not granted** and not possible: GSC is not verified |
| Rollback | Each commit reverts on its own (`git revert <sha>`). No backend or data changes |

## Implemented (local acceptance passed: lint, typecheck, 363 tests, production build)

| ID | Commit | Change | Verification |
| --- | --- | --- | --- |
| I-01 | `aff5360` | Titles and descriptions: head terms in en/de/zh, brand-first home, unique hotel, car and helicopter descriptions, experience titles, contact NAP | `tests/detail-seo.test.ts`; rendered HTML checked on 16 URLs |
| I-02 | `a7e6033` | JSON-LD: helicopter TouristTrip+Product, breadcrumbs on transport and trekking, TravelAgency logo/image/address | `tests/structured-data.test.ts` |
| I-03 | `da25bf6` | `/favicon.ico` (16/32/48 px from the brand icon) | `next start`: 200 image/x-icon |
| I-04 | `6c342d9` | Full HTML for Amazonbot, DuckAssistBot, Meta agents, MistralAI-User, PetalBot, CCBot | after deploy: curl with those UAs should show `<h1` |
| I-05 | `1dee531` | Markdown layer: llms.txt, sitemap.md, 224 `.md` pages, alternate links, robots/sitemap comments | [markdown-delivery.md](markdown-delivery.md) |

## Owner backlog (needs your accounts, facts or decisions)

| ID | Action | Why | Acceptance |
| --- | --- | --- | --- |
| A-01 | Merge `chore/google-search-console-verification` (or verify by DNS) and add the site to Bing Webmaster Tools. Then submit `https://www.kerben-travel.com/sitemap.xml` in both | Nothing about rankings or indexing can be measured until then; the file is 404 live | GSC shows "Verified" and the sitemap is "Success". Acceptance proves receipt, not indexing |
| A-02 | Give the office street address (as on 2GIS) | Needed for a full PostalAddress, a Google Business Profile and NAP consistency. The site currently says only "Bishkek" | Address visible on /contact, then added to the TravelAgency schema |
| A-03 | Create and verify a Google Business Profile for Kerben Travel (category: tour operator / travel agency) linked to kerben-travel.com | The brand SERP currently belongs to the unrelated kerbentravel.kg | Profile is live with the website link |
| A-04 | Add the site URL to the Instagram, Facebook, Telegram and 2GIS profiles; list on TripAdvisor, GetYourGuide or Viator, Yandex Business and Ctrip/Trip.com if you work with Chinese travellers | Citations and links are the main gap for head terms on a 5-day-old domain | Each profile links to kerben-travel.com |
| A-05 | Ask past travellers for reviews on Google and TripAdvisor (2GIS already shows 4.9 from 159 ratings) | Trust and local ranking | Visible reviews on at least two platforms |
| A-06 | Fill backend content: hotel and car descriptions, a real name and description for helicopter route 45 ("Marry me"), day-by-day programmes (tour 49 has none), trekking routes | Thin pages limit both search snippets and the Markdown answers | Each detail page has its own description |
| A-07 | Plan guide content for the head-term track, e.g. "Kyrgyzstan itinerary for 7/10/14 days", "best time to visit", "how to get to Song-Kul", in RU and EN first | Competitors rank with guides plus catalogs | Briefs approved, then published |
| A-08 | Native-speaker review of the new German and Chinese titles and descriptions | Written by the assistant | Reviewer sign-off |
| A-09 | Decide on readable tour URLs (`/tours/49` → `/tours/song-kul-yurt` or similar) with 301 redirects | Cheapest before the site is indexed; touches 40 URLs | Owner decision first |
| A-10 | After deploy, run the live checks in [markdown-delivery.md](markdown-delivery.md#live-verification--pending) and repeat the crawl in [site-audit.md](site-audit.md) | Proves delivery, not indexing | All 224 `.md` return 200 text/markdown; comments survive the CDN |

## Measurement plan

Once A-01 is done: take a 28-day GSC baseline (queries, pages, country, device) per language and compare monthly. Watch the head-term family on `/{lang}/tours` and brand queries on the home page. Any change is an observation, not proof that these commits caused it. AI-answer visibility would need separate monitoring, which wasn't requested.

## Next destination

[delivery-summary.md](delivery-summary.md)
