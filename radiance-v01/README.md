# Radiance v01

The second concept in the TRAYN Alternates picker, served at `/radiance-v01/`. Run commands from the repository root.

## Direction

A little sunshine. Every day. A warm editorial site for Radiance Cafe Latte, using the selected ivory-and-gold packaging and its flowing lettering. The page introduces the idea, a morning ritual, an interactive packaging study and development FAQs. Header and footer links return to the picker.

The intended audience is middle-aged and older men and women living with diabetes who require protein intake. Formulation, serving size, nutrition information and suitability have not been established. The page presents a concept, with no purchase, signup, medical claims or invented testimonials.

## Assets

Runtime delivery images are under `assets/`. Generation masters and prompts live in [shared Radiance documents](../docs/radiance/README.md), excluded from deployment. Original packaging explorations remain under `docs/alternative-02/packaging/`. `assets/manifest.json` records delivery dimensions, sizes and hashes.

Manrope and Cormorant Garamond are self-hosted with SIL OFL notices under `shared/fonts/`. Solar arrow icons retain their attribution under `assets/icons/`. The source TRAYN identity is preserved. All product and lifestyle images are generated concepts.

```sh
npm run assets:radiance
npm run typecheck
npm run build
npm run preview
npm run verify:radiance
```

## Interaction and motion

GSAP and ScrollTrigger handle the entrance and one-time heading reveals. Lenis is the sole smooth-scroll engine, active only on fine-pointer desktop devices without reduced motion. Touch and reduced motion use native scrolling. No Three.js runtime is needed.

The opening coordinates a subtle desktop photograph zoom, two headline lines and supporting copy/button in one timeline. A small desktop-only image drift within the existing ritual frame adds photographic depth; no sections are pinned or snapped and section dimensions are unchanged. Mobile uses shorter, smaller reveals with static photographs. FAQ toggles and image loads refresh measured scroll positions.

Packaging photographs decode before replacing the current image. Pointer selections crossfade in 200 ms, while keyboard selections update without a transition. Stale image requests cannot override a newer selection; failed images have a readable fallback. Reduced-motion changes remove scroll effects and finish any in-progress image transition. Hover motion is limited to fine pointers.

Packaging tabs support pointer, touch, arrow keys, Home and End, with recovery for failed images. Mobile navigation and FAQs use native details/summary. Without JavaScript or when the application bundle fails, the full story and navigation remain usable; direct image links replace enhanced controls.

`npm run verify:pages` covers the GitHub Pages project path, including Radiance at `/trayn-alternates/radiance-v01/`. Set `PUBLIC_SITE_URL` to the picker deployment URL before building. `RADIANCE_URL` overrides the browser test target; `BROWSER_EXECUTABLE` selects an installed Chromium or Edge.

For lifecycle verification, start a development server on port 4181 and run `node scripts/verify-radiance.mjs --dev`. Reports and screenshots are ignored under `verification/radiance*/`.

Run `node scripts/verify-radiance-motion.mjs` against the production preview to check delayed images, rapid selection, keyboard behaviour, desktop image depth, mobile/reduced-motion alternatives and free scrolling. The same `RADIANCE_URL` and `BROWSER_EXECUTABLE` overrides apply.
