# Keyword research and query-to-page map — kerben-travel.com

- Step ID: `research`
- Status: provisional (no first-party search data; no keyword-volume tool)
- Owner: Kerben Travel (site owner); prepared by the SEO run of 2026-11-22
- Scope: www.kerben-travel.com, locales en / ru / de / zh-CN, all public templates
- Outcome: one primary query family per page template, a nearer-term track and a head-term leadership track, applied to titles and descriptions in commit `aff5360`

## Inputs and evidence

| Input | Date | Notes |
| --- | --- | --- |
| Live crawl of all 224 sitemap URLs (Googlebot UA) | 2026-11-22 | [raw/crawl-googlebot-ua.json](raw/crawl-googlebot-ua.json): titles, descriptions, H1, JSON-LD types, per-URL SHA-256 of the HTML |
| Dictionaries and catalog data in the repository | revision `dfa9223` | Pre-change titles: `src/dictionaries/*.json` → `meta` |
| Web search snapshots (US-only search tool, not locale/device specific) | 2026-11-22 | Queries: "Kyrgyzstan tours local tour operator Bishkek", "туры в Киргизию из Бишкека туроператор", "Kirgistan Reisen Rundreise", "吉尔吉斯斯坦旅游 线路", "kerben-travel.com" |
| Search Console / Bing Webmaster data | — | **Unavailable.** The owner has no export; the GSC verification file is on unmerged branch `chore/google-search-console-verification` and returns 404 live |

Volumes are not quoted anywhere in this note: no keyword tool or first-party data was available, so demand is ranked qualitatively from the language people use and the result types observed. Treat every family below as a hypothesis until Search Console shows impressions.

## Observed result landscape (dated snapshot, not stable truth)

- **EN "Kyrgyzstan tours":** aggregators (TourRadar, ToursByLocals, GoWithGuide) and established local operators (kyrgyzstan-tourism.com, tours.too.kg). Pages that win are catalogs with many itineraries, prices and reviews.
- **RU "туры в Киргизию":** aggregator blogs (uniticket.ru, tonkosti.ru), Advantour, eurasia.travel. The intent is mixed: catalogs plus "what to know" guides.
- **DE "Kirgistan Reisen":** German tour operators (ASI Reisen, Gebeco, WeRoad, Lidl Reisen) and aggregators. "Kirgistan" is the spelling people use; "Kirgisistan" is the official one, and both appear.
- **ZH "吉尔吉斯斯坦旅游":** Ctrip guides, travelogues and aggregators. Little operator presence.
- **Brand:** the search for `"kerben-travel.com"` returned nothing from the site. The domain was registered on 2026-11-17, so this is expected. The unrelated agency kerbentravel.kg holds the brand name in Google (see memory note `kerben-brand-conflict`).

## Query-family ownership (one primary owner per family)

| Family (EN / RU / DE / ZH) | Primary page | Track | Notes |
| --- | --- | --- | --- |
| Kyrgyzstan tours / туры по Кыргызстану (в Киргизию) / Kirgistan Reisen / 吉尔吉斯斯坦旅游 | `/{lang}/tours` | **Head-term leadership** | Title now names the country in all four languages. RU already did; EN/DE/ZH said "All Tours / Alle Touren / 全部线路" |
| Kerben Travel + tour operator in Bishkek / туроператор Бишкек / Reiseveranstalter Kirgistan / 吉尔吉斯斯坦旅行社 | `/{lang}` (home) | Brand + mid-tail | Home title now leads with the brand and "tour operator" so it stops competing with `/tours` for the head term (RU home and RU tours titles were near-identical) |
| Issyk-Kul / Song-Kul / Kel-Suu lake tours | `/{lang}/experiences/lake` + tour pages | Nearer-term | Theme pages had one-word titles ("Lakes"); now named searches |
| Mountain / trekking tours Kyrgyzstan | `/{lang}/experiences/mountain`; `/{lang}/trekking` once routes exist | Nearer-term | The trekking catalog is empty (0 routes), so it isn't promoted in llms.txt |
| Nomadic culture / yurt stays | `/{lang}/experiences/nomad` | Nearer-term | 3 tours |
| Silk Road / Burana / Tash-Rabat | `/{lang}/experiences/history`, `/{lang}/attractions` | Nearer-term | The attractions page is the strongest editorial asset (9 sights, 4 languages) |
| Winter Kyrgyzstan / ski | `/{lang}/experiences/winter` | Later | Only 1 tour; thin |
| Car with driver Kyrgyzstan / Manas airport transfer | `/{lang}/transport` | Nearer-term | 16 vehicles; detail titles now say "with driver" or "for rent" from backend data |
| Helicopter tour Kyrgyzstan / Ala-Archa helicopter | `/{lang}/helicopter` | Nearer-term, low competition | 4 routes with prices |
| Hotels Bishkek / Issyk-Kul / Karakol | `/{lang}/hotels` | Supporting only | Competes with OTAs; serves conversion, not acquisition |
| Kyrgyzstan visa / safety / currency / best season | `/{lang}/faq` | Nearer-term (answers) | Good AEO material; FAQPage markup already live |
| Single tours (Song-Kul yurt, Ala-Archa day trip…) | `/{lang}/tours/{id}` | Nearer-term long tail | Titles are descriptive; URLs are numeric ids (see backlog A-09) |

## Leadership track (head term) — what it takes, in order

The head term stays a required target even though authority is currently near zero:

1. **Now (done locally):** the catalog title, description and H1 context name the country in every language, and the catalog has its own Markdown topic map.
2. **Next:** verify Search Console and Bing (A-01) so impressions are measurable; create a Google Business Profile (A-03); add a few citations and profiles (A-04).
3. **Later:** guide content that competitors' catalogs lack, such as itineraries by number of days, a "best time to visit" guide and getting-there guides (A-07); reviews on third-party platforms (A-05).

## Declined ideas

- Keyword-stuffing every title with "tours" and every spelling variant. The RU titles already carry «Кыргызстан (Киргизия)»; repeating more variants would read as spam.
- Changing tour URLs to slugs right now. It's valuable, but it changes 40 indexable URLs and needs an owner decision and redirects (A-09).

## Next destination

[site-audit.md](site-audit.md) — audit findings that use this ownership map.
