# Nurture — The everyday, considered

## Skill source and workflow
Read the installed `C:/Users/Diwakar Mohan/.agents/skills/build-awwwards-quality-sites/SKILL.md` in full. This skill has seven sections and no separate referenced documentation. The user confirms that it is the intended Awwwards website skill. Compatible art-direction skill: `high-end-visual-design`, editorial luxury / editorial split. User requirements override that skill's unrelated glass, pills, card structures and excessive motion prescriptions. The requested Phase 0–6 sequence extends the installed workflow. There is no submission phase in this project.

## Phase 0 — Concept
Audience: women encountering the Nurture nutrition concept for the first time, and people interested in its eventual launch. They need a clear introduction, beautiful but honest mockup imagery, and clarity about development status.

Emotional register: composed, personal, warm and precise. No clinical authority, instant transformations or health promises.

Creative concept: **The everyday, considered.** Treat a familiar tin as an object worthy of attention. The page moves from its silhouette to its artwork, finish and brand intention, making everyday care feel deliberate rather than demanding.

Primary action: Explore the concept. No email service, verified contact address, final product data or launch date is available; collect no personal data and simulate no submissions.

## Phase 1 — Art direction (before implementation)
Typography: self-hosted Cormorant Garamond 400 / italic for expressive display and object-study captions; Manrope 400 / 500 / 600 for readable body and navigation. Use sentence case, clear hierarchy and limited tracking. Hero headline around 100–125px desktop, 57–70px mobile; body 14–16px; secondary text no smaller than 11px where practical.

Tokens: ivory #faf7f0; off-white #fffdf8; espresso #382a22; muted espresso #69594d (darkened during the contrast audit); champagne #b49a68; oat #eee5d7; stone #e5dfd6; hairline #d6c9b7. Gold is an accent, never low-contrast reading text. No green-led surfaces or controls.

Spacing: 8px base, 24/32/48/64/96/128 rhythm; desktop page gutters 5vw (max96px); mobile 22px. Twelve-column editorial grid, alternating full-width and offset spans. Mobile reorders the hero into headline → product → action and uses separate detail placement, not a squeezed desktop composition.

Imagery: the existing CGI concept tin remains the anchor. Front / angle / top / open-lid views are disclosed as concepts. Macro crops show actual existing artwork and lid. Do not use the old green campaign or lifestyle imagery. No fabricated ingredients, benefits or endorsements. A social preview will be composed from the existing cutout, actual brand typography and ivory ground.

Composition: restrained header → asymmetric hero with product study → large typographic intention → horizontal material studies → spacious gallery with concise object notes → native development FAQs → understated closing and footer. The old giant wordmark, dark hero, green story surface, orbit line and green campaign are removed.

Motion: short, nonblocking hero entrance; the single closer-look sequence; selected heading reveals. GSAP owns animated transforms and opacity. ScrollTrigger handles a small number of one-time reveals. Compare native / Lenis / Locomotive: native is correct for touch and reduced motion; Lenis is the one desktop smooth-scroll engine, consistent with the current supported implementation. Locomotive is not installed or initialized. No scroll pinning, pointer trails, ambient loops or live WebGL.

## Phase 2 — Signature moment
Name: **A closer look** — give an everyday object a moment of attention.
Trigger: explicit keyboard/touch/pointer activation of the hero's A closer look button; activating again returns to the silhouette. Use aria-pressed and a named region.
Sequence: 0–200ms the view changes from the angle render to the matching front render through an opacity crossfade; 120–850ms the product settles upright and enlarges slightly inside a stable frame; 450–950ms two concise annotations reveal the gold finish and botanical artwork. Total under one second. The main headline, concept CTA and navigation stay usable throughout.
Mobile: same trigger and image change, less scale travel; notes occupy reserved space below the product, not over the label. No pointer dependence.
Reduced motion: swap image and notes immediately, no transforms, no Lenis.
Static fallback: complete angle render, hero copy and native concept anchor in prerendered HTML. Hide the nonworking inspection button without JavaScript; ordinary gallery image links remain available.
Cleanup: kill scoped GSAP context/matchMedia, remove ticker and anchor listeners, destroy Lenis; disclosure effects restore scroll and focus. Verify unmount/remount resource counts in a real development browser.

## Phase 3 — Build decision
Rebuild presentation in the existing `nurture-redesign` subfolder. Keep its small React/TypeScript/Vite stack, supplied WebP images, SSR prerender pipeline and tested native dialog foundation. Replace the hero, page composition, design tokens, navigation treatment, content hierarchy, footer, metadata and social assets. No backend, router, commerce library or Three.js runtime is needed for the current story.

## Phase 4–6 acceptance plan
Craft: keyboard focus, meaningful hover states, real loading/error feedback, self-hosted fonts, correct favicon and social preview, complete semantic metadata.
Hardening: production build; desktop/tablet/mobile 320–1920px; Chrome and Edge, plus an independently available engine if installable; no-JS; live reduced-motion changes; keyboard modal trapping and Escape; every hero/gallery/navigation interaction; missing-media recovery; cleanup on remount.
Performance: measure actual local-browser navigation timings, LCP, CLS, long tasks and resource bytes under documented conditions. Record desktop/mobile samples, and a CPU/network-throttled sample. Do not label these Lighthouse scores or field Core Web Vitals. Attempt independent WebKit/Firefox coverage and report actual availability.
Audit: inspect real captures, record weaknesses and corrections, then give candid Design / Usability / Creativity / Content self-assessments. These are subjective internal scores, not Awwwards votes or official awards.


## Phase 4–6 delivery

The complete implementation, final corrections, actual build/browser/accessibility/lifecycle checks, nine measured performance samples and candid internal rubric scores are recorded in AUDIT.md. Raw verification reports live in verification/. The showcase is complete; approved product data and real launch services remain future integrations. No submission was made.

## Root promotion

The completed redesign was promoted to the repository root at the user's request. The original root application and its assets are preserved in `old_website/`. The media regeneration script now reads that archive; the design decisions above record the original build phase.


## Regenerated asset direction

The existing editorial-luxury composition now uses a freshly generated studio series anchored to the supplied packaging reference. assets/DIRECTION.md records the framing plan written before generation. Seven selected masters, full prompt provenance, licensed typography/marks/icons and responsive deliveries are retained under root assets/. The former product crops and archive-source regeneration dependencies have been removed. Hero, gallery, details and vision preserve the newly authored image frames. The motion stack and single closer-look interaction remain unchanged.
