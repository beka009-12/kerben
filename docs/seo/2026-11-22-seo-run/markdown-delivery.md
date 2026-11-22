# Markdown discovery layer — delivery note

- Step ID: `markdown`
- Status: completed locally (`implemented-locally`); live delivery **not verified** (not released)
- Owner: Kerben Travel. The layer is code: it regenerates from the same dictionaries and backend catalog as the HTML, so editors maintain nothing by hand
- Scope: every public canonical page in en, ru, de and zh-CN
- Commit: `1dee531` (on top of `6c342d9`)

## What exists after this change

| Resource | Route source | Content type | Notes |
| --- | --- | --- | --- |
| `/llms.txt` | `src/app/llms.txt/route.ts` → `src/utils/markdown/maps.ts` | `text/plain; charset=utf-8` | Company summary, live contacts, official profiles, links to the catalog, FAQ, contacts, sights and the other languages. Empty catalogs (trekking today) are left out. Passes the suite's `validate_llms_txt.py` |
| `/sitemap.md` | `src/app/sitemap.md/route.ts` | `text/markdown; charset=utf-8` | All 224 pages grouped by language → topic, each with its `.md` link and HTML URL |
| `/{lang}/index.md` | rewrite → `src/app/md/[lang]/[...path]/route.ts` | `text/markdown; charset=utf-8` | Home page |
| `/{lang}{path}.md` | same | same | Every other public page, e.g. `/en/tours/49.md`, `/de/hotels/45.md` |
| `<link rel="alternate" type="text/markdown">` | `src/utils/seo.ts` | — | On every public HTML page; the chat page opts out |
| robots.txt comment | `src/app/robots.txt/route.ts` | — | Two `#` lines at the top; records unchanged |
| sitemap.xml comment | `src/app/sitemap.xml/route.ts` | — | One `<!-- -->` inside `<urlset>`; elements unchanged |

## Inventory and dispositions

- **Included (224):** `""`, `/tours`, `/attractions`, `/hotels`, `/trekking`, `/transport`, `/helicopter`, `/about`, `/faq`, `/contact`, `/credits`, 6 × `/experiences/{theme}`, 10 tours, 10 hotels, 15 cars and 4 helicopter routes, each in 4 languages. The source is `publicPaths()` in `src/utils/site-pages.ts`, the same function that now feeds sitemap.xml, so the XML and Markdown inventories can't diverge.
- **Excluded (private, by design):** `/{lang}/chat`, `/trips`, `/saved`, `/requests`, `/login`, `/admin/*`, `/reset-password`, `/api/*`. They're personal, authenticated or blocked in robots.txt. Requests for `.md` versions of them return 404.
- **Edge cases verified:** `/en/tours/49/x.md`, `/en/nope.md` and `/en/chat.md` return 404 text/plain. `/fr/tours.md` gets the normal HTML 404 (the rewrite only matches the 4 locales). The internal route `/md/...` is not reachable directly: the proxy redirects it under a locale, where it 404s.

## Content parity

Each document is rendered by `src/utils/markdown/documents.ts` from the same functions the HTML pages call (`getTours`, `getHotels`, `getTransports`, `getHelicopterTours`, `getTrekkings`, `getFaqs`, `getAboutSections`, `getContacts`, dictionaries), with the same fallbacks (for example `aboutFallback` when the backend description is empty, and backend FAQs falling back to dictionary FAQs). Backend text is escaped so it can't inject Markdown. Every document states its web page, language, the other languages, its source and the site map, and ends with how to book. Price lines repeat the HTML wording ("From $195 per person").

Not mirrored, deliberately: the client-only booking form, the AI chat, maps and reviews widgets (client-rendered), and nearby-hotel suggestions computed by distance.

## Duplicate and indexing policy

Mirrors send `Link: <html-url>; rel="canonical"` and no `noindex`. Google supports rel=canonical in HTTP headers for non-HTML resources, so the HTML stays the search result. The XML sitemap keeps listing only HTML URLs.

## Caching and freshness

The Markdown routes send `Cache-Control: public, max-age=300, s-maxage=600, stale-while-revalidate=86400`. Catalog data comes from the same `use cache` entries as the pages (`cacheLife("minutes")`, tags such as `tours`), so an admin edit shows up in Markdown after the cache expires: about 10 minutes at the CDN at most. robots.txt and sitemap.xml keep Next's previous `public, max-age=0, must-revalidate`. In the production build, llms.txt, sitemap.md and sitemap.xml are prerendered and revalidate every minute; `/md/*` renders on demand.

## Local verification (2026-11-22)

- `npm run lint`, `npm run typecheck`, `vitest` (363 tests, 63 files) and `npm run build` all pass at `1dee531`.
- Tests compare the new sitemap.xml and robots.txt against Next's own serializers (`resolveSitemap`, `resolveRobots`): byte-identical once the comments are removed.
- The local sitemap.xml with its comment removed is byte-identical to the live sitemap captured the same day.
- All 224 documents listed in sitemap.md fetched from the dev server: 200, `text/markdown; charset=utf-8`, the correct canonical Link header, an H1 and the web-page line. All 224 internal `.md` links resolve ([raw/md-verification-local.json](raw/md-verification-local.json)).
- The production server (`next start`) delivered both comments, the right content types and `/favicon.ico` (`image/x-icon`).
- Candidate outputs: [raw/llms-candidate.txt](raw/llms-candidate.txt), [raw/sitemap-md-candidate.md](raw/sitemap-md-candidate.md).

## Live verification — pending

After deploy, run the same check against production. The script is in the session scratchpad as `verify_md.py`; rerun it with base `https://www.kerben-travel.com` and check:
`curl -sI https://www.kerben-travel.com/en/tours/49.md` (expect 200 text/markdown + Link canonical), and confirm `curl -s https://www.kerben-travel.com/sitemap.xml | sed -n 3p` still shows the comment after Vercel's CDN.
None of this proves any engine fetches, uses or cites the files.

## Limitations

- Prices are whatever the backend returns, in USD; documents say so and tell readers to ask a manager about anything not published.
- The trekking section is empty, so its Markdown says offers are coming soon.
- German and Chinese copy was written by the assistant and should get a native read (action A-08).

## Rollback

`git revert 1dee531` restores `robots.ts` and `sitemap.ts` (identical records) and removes every Markdown route. No data or backend changes are involved.

## Next destination

[action-plan.md](action-plan.md)
