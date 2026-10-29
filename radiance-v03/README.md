# Radiance v03

The third option in the picker, at `/radiance-v03/`. A cinematic cream-and-gold world with a floating product, monumental typography, scroll-driven scenes and one espresso firefly chapter. Built in the existing React/Vite application; earlier alternatives remain separate.

## Direction and content

The supplied Elevate homepage informs the scale of type, full-screen media, tonal text reveal, held product sequence and oversized closing link. Original surreal imagery turns those principles into Radiance's own sunlit landscape. The contact-page fish scene informs the living firefly interaction. No reference code, photographs, copy or fish assets are used. See `DESIGN.md` for the complete direction and reference observations.

Product information is shared with `docs/radiance/`. Development FAQs reuse the existing Radiance content. There are no purchase, nutrition, suitability or treatment claims. All product imagery is explicitly identified as generated concept imagery.

## Assets

`assets/world/` contains the original ivory landscape and gold portal, surreal latte scene, and genuinely transparent floating product layer, made with the built-in image-generation tool. Masters and exact prompts are in `docs/radiance/assets/v03/world/`, excluded from deployment. `assets/manifest.json` records dimensions and hashes. The social preview is under `assets/social/`. The first draft's morning photographs remain source history under `docs/` and are not deployed.

The environments have responsive AVIF and WebP delivery variants. Small marks in `assets/brand/` preserve the existing identity. The sunburst macro uses the shared Radiance product photograph. Self-hosted Manrope and its OFL notice remain in `shared/fonts/`. Solar arrow attribution is in `radiance-v01/assets/icons/ATTRIBUTION.txt`.

Regenerate current delivery images with `node scripts/prepare-radiance-v3-world.mjs` from the repository root. This uses Sharp; it does not regenerate the masters with AI. The earlier `prepare-radiance-v3-assets.mjs` belongs to the rejected first draft.

## Motion and interaction

`fireflyScene.ts` draws an original Canvas 2D scene with loose groups, separation, alignment, wandering targets, pulsing abdomens, paired wings and depth. Fine-pointer movement gently repels nearby lights. Touch devices use autonomous motion and fewer lights. The canvas never captures gestures or blocks links.

Gather/release controls let the lights form a sun. The scene suspends when offscreen or when the document is hidden. Pause freezes the current view and resumes without resetting positions. Reduced motion switches live to a still scene. Decorative lights remain without JavaScript or if Canvas is unavailable. Observers, animation frames and event listeners are disposed on unmount.

GSAP owns the hero intro, damped pointer depth, scroll-reading manifesto and horizontal desktop triptych. Lenis is the sole smooth-scroll engine on fine-pointer desktop devices. Touch and reduced motion use native vertical chapters. Reduced-motion changes revert pinning and restore the complete static story. Native details/summary controls support navigation and FAQs; chapter anchors also work without JavaScript. No Three.js runtime is needed: rendered scenes and separate depth layers provide the spatial effect.

## Verification

From the root: `npm run typecheck`, `npm run build`, `npm run verify:assets`, then `npm run preview` and `npm run verify:picker` / `npm run verify:radiance-v3`.

`BROWSER_EXECUTABLE` selects an installed Chromium/Edge executable. `RADIANCE_V3_URL` overrides the test URL. `npm run verify:pages` also covers the GitHub Pages project prefix. Reports and screenshots are ignored under `verification/radiance-v03/`.
