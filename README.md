# Nurture — The everyday, considered

The light luxury Nurture product concept showcase is the root application. Its complete asset library is self-contained in `assets/`; the old application has been deleted. This edition follows the installed `build-awwwards-quality-sites` workflow and the compatible editorial luxury direction from `high-end-visual-design`. See [DESIGN.md](DESIGN.md) for the ordered concept, art direction and interaction decisions, and [AUDIT.md](AUDIT.md) for measured verification and limitations.

## Run

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4180/. For the production page:

```sh
npm run typecheck
npm run build
npm run preview
```

The build writes a complete prerendered page to `dist/`. Deploy that directory on a static host; relative assets support a subfolder. `noindex, nofollow` remains deliberate during concept development. Set `PUBLIC_SITE_URL` to the confirmed full deployment URL before building to produce absolute sharing-image URLs, a canonical URL and `og:url`. Remove noindex only when public launch content is approved.

## Design and interaction

Warm ivory, espresso typography, oat and stone surfaces, restrained champagne accents. Self-hosted Cormorant Garamond and Manrope. The page presents the regenerated concept product as an object study, followed by material details, a four-view gallery, the brand aspiration and honest development FAQs.

Exactly one signature hero interaction: **A closer look**. An explicit button changes the angled tin to its front view and reveals two packaging annotations in under one second. It reverses on repeat activation. Mobile reserves space for the notes; reduced motion switches views immediately. Without JavaScript, the full prerendered story, angle render, native FAQ and gallery-image links remain usable.

React, TypeScript and Vite; GSAP for the short entrance and signature; ScrollTrigger for selected one-time reveals. Lenis is the sole smooth-scroll engine, limited to fine-pointer desktop devices. Touch and reduced motion use native scroll. No live 3D runtime is required for this concept. Both dialogs explicitly wrap keyboard focus, support Escape and restore focus and scrolling when closed.

## Product data and future launch

`src/content/product.ts` owns identity, concept status, images, gallery configuration and FAQ. `src/content/launch.ts` provides types for future commerce, variants, specifications and genuine testimonials. Unconfirmed fields are null or empty and are not displayed.

The present primary action explores the concept. Sales require approved formulation, ingredients/allergens, nutrition information, suitability and serving instructions, final artwork and photographs, accurate packs/variants, pricing, inventory, shipping/returns policies, checkout and legal copy. No product claims or launch date have been assumed. An email signup needs a real service, consent/privacy copy and verified success/error handling. There is no simulated purchase or signup.

## Asset library

All authored media, reference sources, generation masters, brand marks, icons, fonts/licenses and sharing artwork live under the repository-root `assets/` directory. There are no root-site dependencies on the archived application, `public/` or `src/media/`.

Seven new product images were created with the built-in image generator from the supplied packaging identity: angle, front, lid/upper-label finish, profile/botanical artwork, open tin, overhead lid and an everyday still life. Details are individually composed photographs, not crops from older CGI catalog images. The site preserves their frames with deliberate aspect ratios and contain behavior. Images remain clearly disclosed as generated concepts. The brand marks and licensed typefaces are preserved, not reinvented.

| Directory | Contents |
| --- | --- |
| `assets/reference/` | Supplied mockup, original brand marks and first generated studio anchor |
| `assets/masters/` | Seven selected generation PNGs |
| `assets/product/` | Fourteen responsive WebP deliveries |
| `assets/brand/` | Optimized original TRAYN marks and Nurture favicon |
| `assets/fonts/` | Local WOFF2 files, CSS and SIL OFL license notices |
| `assets/icons/` | Licensed Solar SVG arrows and attribution |
| `assets/social/` | Regenerated 1200 × 630 sharing image |

See `assets/PROVENANCE.md`, `assets/GENERATION.md`, `assets/DIRECTION.md` and `assets/manifest.json` for sources, exact prompts, framing and dimensions.

`npm run assets:prepare` rebuilds image variants and brand encodings from root-local saved masters with Sharp; it does not call an image-generation API. `npm run assets:social` recreates the sharing artwork from a running production preview. Vite emits font/mark resources and copies runtime files to `dist/assets/`; the supplied references and PNG masters are not deployed. All site media uses `/assets` URLs. No external image/font service is required.

## Verification

Playwright, Axe and Sharp are installed as root development dependencies. Browser scripts also require a compatible installed browser. `PLAYWRIGHT_MODULE` can point to a bundled Playwright directory; `BROWSER_EXECUTABLE` selects Chromium. `SITE_URL` overrides the production preview address.

```sh
npm run verify:assets
npm run verify:pages
npm run verify
npm run verify:accessibility
npm run verify:browsers
npm run measure:performance
```

The production browser suite checks 320, 390, 820, 1440 and 1920px layouts, anchors, gallery, dialogs, mobile navigation, keyboard focus, reduced motion, no-JavaScript content, missing-media recovery and HTTP/JavaScript errors. Accessibility scans cover desktop and mobile WCAG A/AA checks. Cross-browser checks use Edge and WebKit, then Chromium against a development server for unmount/remount diagnostics. Install WebKit with `npx playwright install webkit`; set `PLAYWRIGHT_BROWSERS_PATH` for a custom browser cache and `DEV_SITE_URL` for the development server (default port 4181).

Performance runs three sequential cold-cache samples per scenario, including mobile with 4× CPU slowdown, 1.6 Mbps download and 150ms latency. These are local browser measurements, not Lighthouse scores, real-device results or field Core Web Vitals. Reports and screenshots live in `verification/` and are ignored by Git. The verification scripts create that directory when needed. Run performance separately from other browser jobs.

## GitHub Pages

This site is static: deploy the prerendered `dist/` output through GitHub Actions. There is no server, client router or archive dependency. Relative URLs work at a project path such as `/nurture/`. The manual release workflow in `.github/workflows/pages.yml` installs locked dependencies, type-checks, builds with the Pages URL for canonical/sharing metadata, verifies local assets, and uploads only `dist/`.

To publish after merging this work to the repository default branch:

1. In Settings → Pages, choose **GitHub Actions** as the source.
2. In Actions, run **Publish Nurture to GitHub Pages** from the default branch.

Nothing has been published by this local task. GitHub CLI was not authenticated, so repository visibility, account eligibility and existing Pages/environment settings were not inspected. See the [official Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

To reproduce project-path hosting locally, build with PUBLIC_SITE_URL set to `https://acoaria4.github.io/nurture/`, then run `npm run preview:pages`. It serves static files at http://127.0.0.1:4183/nurture/ without Vite rewrites. Set SITE_URL to that address for the browser suites. `npm run verify:pages` checks canonical/sharing URLs, portrait and landscape touch layouts at DPR 3, responsive asset selection, 44px primary touch targets and application-bundle failure. For a different production domain, give the build and verification the same PUBLIC_SITE_URL.

The header uses a created outlined NURTURE wordmark above a smaller flat TRAYN Nutrition endorsement. Mobile uses dedicated generated 360/720px product images, native scrolling, larger reading/touch sizes, an exploration link before the product, and a complete endorsement even at 320px. Exact generation prompts and native wordmark source are recorded under assets/. The closed lightbox defers its full-size image until it opens; initial header geometry is reserved while hydration loads, with native navigation restored if the bundle fails.

The source/assets/lockfiles remain tracked; dependencies, build outputs, browser caches, local reports, logs and Python bytecode are ignored. The former archive has been deleted after independence checks.

## Product development documents

The [product development folder](docs/product-development/README.md) contains the detailed food-product discussion and links to the versioned, three-page [food technologist review PDF](output/pdf/nurture-food-technologist-review-brief.pdf), with regeneration instructions. These are concept review materials separate from the website.
