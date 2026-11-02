# TRAYN Alternates

Product concepts exploring alternatives to TRAYN Nutrition Whey. The root page is the concept picker: **1) Nurture v01** at `/nurture-v01/`, **2) Radiance v01** at `/radiance-v01/` and **3) Radiance v03** at `/radiance-v03/`.

## Repository structure

```text
index.html                  Main concept picker
src/picker/                 Picker UI, styles and concept registry
shared/                     Picker brand marks and licensed fonts
docs/nurture/               Shared Nurture product information across page versions
  briefs/                   Food technologist review PDF
  costing/                  Costing workbooks, supplier request and supporting exports
  tools/                    PDF and workbook generation scripts
  assets/                   Source assets needed to regenerate the shared brief
nurture-v01/
  index.html                Nurture page
  src/                      Nurture application
  assets/                   Complete Nurture asset library and provenance
  scripts/                  Nurture asset and verification tools
radiance-v01/               Radiance page, source and runtime assets
radiance-v03/               Cream-and-gold editorial variant with interactive fireflies
docs/radiance/              Shared Radiance product material and image masters
scripts/                    Shared build, preview and verification tools
```

Page versions live directly at the repository root. There is no `options/` parent. Product information belongs under `docs/<product>/`, so future Nurture page versions share `docs/nurture/`. Package dependencies, lockfile, Vite configuration and release workflow are shared. The picker has its own styles; Nurture retains its existing visual design and includes an **All alternatives** return link.

## Run and build

Run commands from the repository root with Node.js 24 and npm:

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:4180/` for the picker, `http://127.0.0.1:4180/nurture-v01/` for Nurture, `http://127.0.0.1:4180/radiance-v01/` for Radiance v01 or `http://127.0.0.1:4180/radiance-v03/` for Radiance v03.

```sh
npm run typecheck
npm run build
npm run preview
```

All four pages are prerendered into one `dist/` directory, including usable links and content without JavaScript. Only `dist/` is deployed. Concept documents, workbooks, tooling, reference images and generation masters are excluded. Shared picker assets are copied from the original identity; Nurture's original source library remains self-contained. Vite deduplicates identical imported fonts in the built output. Radiance versions share `docs/radiance/`; earlier packaging explorations remain in `docs/alternative-02/`.

Set `PUBLIC_SITE_URL` to the full **picker** deployment URL, ending in `/`, before building. Each page receives its own canonical and sharing metadata. Development pages deliberately retain `noindex, nofollow`.

## Verify

Start the production preview before browser checks. Set `BROWSER_EXECUTABLE` to an installed Chromium/Edge executable, or install Playwright's Chromium.

```sh
npm run verify:assets
npm run verify
npm run verify:accessibility
```

The picker checks desktop/mobile layout, missing assets, accessibility, navigation in both directions and navigation without JavaScript. Nurture's existing interaction and accessibility suites run against the nested page. Generated reports and screenshots are ignored under `verification/` and `nurture-v01/verification/`.

To reproduce GitHub Pages project-path hosting, build with `PUBLIC_SITE_URL=https://acoaria4.github.io/trayn-alternates/`, then:

```sh
npm run preview:pages
npm run verify:pages
```

This serves the picker at `http://127.0.0.1:4183/trayn-alternates/` and Nurture at `http://127.0.0.1:4183/trayn-alternates/nurture-v01/`. `PICKER_URL` overrides the picker test URL; `SITE_URL` overrides the Nurture test URL. `PUBLIC_SITE_URL` always describes the picker URL, including when verifying Nurture's nested metadata.

The manual GitHub Actions workflow **Publish TRAYN alternates to GitHub Pages** checks types, builds all four pages using the configured Pages URL, validates delivery assets and uploads `dist/`. Run it deliberately after reviewing and pushing changes; local builds do not publish.

## Add another alternative

1. Add a sibling page-version folder at the root, with its page, source and assets. Keep product information in `docs/<product>/`; another Nurture page version reuses `docs/nurture/`.
2. Add its entry to `src/picker/concepts.ts`; picker numbering and count update automatically.
3. Register its HTML input in `vite.config.ts`, its render export in `src/entry-server.tsx` and its prerender settings in `scripts/prerender.mjs`.
4. Explicitly whitelist its runtime assets in the build and add verification coverage. Include an `../` link back to the picker.

See [Nurture's page documentation](nurture-v01/README.md), [Nurture product information](docs/nurture/README.md), [Radiance v01 documentation](radiance-v01/README.md), [Radiance v03 documentation](radiance-v03/README.md) and [Radiance product information](docs/radiance/README.md) for each concept's details.
