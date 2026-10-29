# Radiance v03

The third option in the picker, at `/radiance-v03/`. A cinematic cream-and-gold world with a floating product, monumental typography, two image scenes and fireflies that accompany the entire page, becoming brighter in the espresso chapter. Built in the existing React/Vite application; earlier alternatives remain separate.

## Direction and content

The supplied Elevate homepage informs the scale of type, full-screen media, tonal text reveal, held product sequence and oversized closing link. Original surreal imagery turns those principles into Radiance's own sunlit landscape. The contact-page fish scene informs the living firefly interaction. No reference code, photographs, copy or fish assets are used. See `DESIGN.md` for the complete direction and reference observations.

Product information is shared with `docs/radiance/`. Development FAQs reuse the existing Radiance content. There are no purchase, nutrition, suitability or treatment claims. All product imagery is explicitly identified as generated concept imagery.

## Assets

`assets/world/` contains the original ivory landscape and gold portal, surreal latte scene, and genuinely transparent floating product layer, made with the built-in image-generation tool. Masters and exact prompts are in `docs/radiance/assets/v03/world/`, excluded from deployment. `assets/manifest.json` records dimensions and hashes. The social preview is under `assets/social/`. The first draft's morning photographs remain source history under `docs/` and are not deployed.

The environments have responsive AVIF and WebP delivery variants. Small marks in `assets/brand/` preserve the existing identity. The sunburst macro uses the shared Radiance product photograph. Self-hosted Manrope and its OFL notice remain in `shared/fonts/`. Solar arrow attribution is in `radiance-v01/assets/icons/ATTRIBUTION.txt`.

Regenerate current delivery images with `node scripts/prepare-radiance-v3-world.mjs` from the repository root. This uses Sharp; it does not regenerate the masters with AI. The earlier `prepare-radiance-v3-assets.mjs` belongs to the rejected first draft.

## Motion and interaction

`FireflyAtmosphere.tsx` owns one fixed Canvas layer, the shared scene controls and a persistent pause button. `fireflyScene.ts` draws an original scene with loose groups, separation, wandering targets, pulsing abdomens, paired wings and depth. Nearby lights gently approach a fine pointer, leave room around it, then return to wandering after a brief linger. Links and controls do not attract the swarm. Touch devices use autonomous motion and fewer lights. The canvas never captures gestures or blocks links.

Each insect has a separate head, slender thorax and wing cases, translucent veined wings, small legs and antennae, and a warm ivory abdomen. The soft halo originates at the luminous tail. Wings remain visible between slow, individually phased glow pulses; body heading damps toward flight direction. Nearer insects become larger at dusk so the anatomy reads at normal size. The same renderer provides still reduced-motion insects, and the CSS fallback also has paired wings.

Mouse tracking uses each insect's proximity, with no selected follower group or quota. All insects inside the local field react; distant insects continue their ambient behaviour. Influence is full near the cursor and fades smoothly at the edge of a field capped at 350 CSS pixels. Engagement, cursor position, flight-speed limits and heading all ease between states. Critically damped steering and broad, evenly distributed targets leave a clear pocket around the pointer, with stronger neighbour separation approaching 50 pixels during following. A stationary nearby cursor remains interesting; moving far away releases the insects instead of recalling a flock across the whole viewport. Hovering controls or leaving the window releases the field. Browser verification measures rendered swarm displacement during a slow nearby sweep and verifies that a distant cursor jump does not recall it.

The same 40–100 particles persist from opening to closing. Daylight shows 18–34 lights; the reading chapters increase this to 24–44, with stronger amber cores. Actual text-line bounds soften the lights over words, leaving the surrounding whitespace alive. The rest gradually appear with brighter light and paired wings as the espresso section enters. Gather/release forms twelve rays echoing the tin's sunburst, only while the dusk section is visible. The scene suspends when the document is hidden. Pause freezes positions and resumes without resetting them. Reduced motion switches live to a still scene. Decorative lights remain without JavaScript or if Canvas is unavailable. Observers, animation frames and event listeners are disposed on unmount.

In the dark chapter, a click or tap makes a wish: two soft expanding rings with twelve glints briefly draw the swarm into orbit before it resumes wandering. The effect stays anchored to its position in the section, is clipped to that chapter, and recycles a maximum of three wishes. A native Make a wish button provides the same interaction from the keyboard. Pause and reduced motion disable new wishes. The button centres its effect within the visible part of the dark chapter, including short viewports.

The hero keeps its main headline, floating tin and entry link. The five scattered labels have been removed; product-development information remains in the manifesto and footer. Explore uses a dark espresso surface and cream lettering for clear contrast over the gold scene.

GSAP owns the hero intro, damped pointer depth, scroll-reading manifesto and two horizontal desktop scenes: the floating latte and the sunburst macro. The desktop pinned travel is 1.1 viewport widths, roughly half the former three-image sequence. Lenis is the sole smooth-scroll engine on fine-pointer desktop devices. Touch and reduced motion use native vertical chapters. Reduced-motion changes revert pinning and restore the complete static story. Native details/summary controls support navigation and FAQs; chapter anchors also work without JavaScript. No Three.js runtime is needed: rendered scenes and separate depth layers provide the spatial effect.

A three-pixel honey-gold reading-progress line hugs the page's top edge beneath the browser controls. It tracks actual document scroll, including pinning and FAQ height changes. The native side scrollbar is hidden only while v03 is enhanced, with normal wheel, touch, Home/End and keyboard scrolling preserved. Without JavaScript the native scrollbar remains. Leaving the variant restores the scrollbar styling.

## Verification

From the root: `npm run typecheck`, `npm run build`, `npm run verify:assets`, then `npm run preview` and `npm run verify:picker` / `npm run verify:radiance-v3`.

`BROWSER_EXECUTABLE` selects an installed Chromium/Edge executable. `RADIANCE_V3_URL` overrides the test URL. `npm run verify:pages` also covers the GitHub Pages project prefix. Reports and screenshots are ignored under `verification/radiance-v03/`.
